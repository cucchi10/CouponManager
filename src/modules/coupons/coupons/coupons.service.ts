import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { CouponBook } from '../books/entities';
import { Coupon, CouponAssignment } from './entities';
import {
	AssignRandomCouponDto,
	AssignSpecificCouponDto,
	CouponAssignmentResponseDto,
	LockResponseDto,
	UnlockResponseDto,
	RedeemResponseDto,
	CouponStatusResponseDto,
	UserCouponsResponseDto,
	UserCouponItemDto
} from './dto';
import { CouponStatus, CacheFeature } from '../shared/enums';
import { CouponStatusCounter, QueryResultUtil } from '../shared/utils';
import { BusinessException } from '@/modules/common/exceptions';
import { ErrorCode } from '@/modules/common/filters';
import { CacheService } from '@/services/cache/cache.service';
import { AssignmentTransactionResult } from './types';

/**
 * Coupons Service
 *
 * Handles business logic for coupon operations:
 * - Assigning coupons (random or specific)
 * - Locking coupons temporarily
 * - Redeeming coupons with concurrency control
 * - Fetching user's coupons
 *
 * Concurrency Strategy:
 * - Redis distributed locks for critical sections
 * - Database optimistic locking (version column)
 * - Row-level locks (FOR UPDATE) in transactions
 * - Deduplication to prevent double-submit
 */
@Injectable()
export class CouponsService {
	private readonly logger = new Logger(CouponsService.name);
	private static readonly DEFAULT_LOCK_DURATION = 300; // 5 minutes

	constructor(
		@InjectRepository(CouponBook)
		private readonly couponBookRepo: Repository<CouponBook>,
		@InjectRepository(Coupon)
		private readonly couponRepo: Repository<Coupon>,
		@InjectRepository(CouponAssignment)
		private readonly assignmentRepo: Repository<CouponAssignment>,
		private readonly dataSource: DataSource,
		private readonly cacheService: CacheService
	) {}

	// ============================================================================
	// PUBLIC API METHODS - Assignment
	// ============================================================================

	/**
	 * Assign a random available coupon to a user
	 *
	 * Uses database row-level locking to prevent race conditions.
	 * Implements SKIP LOCKED to allow concurrent assignments.
	 *
	 * @param dto - Assignment data
	 * @returns Assignment details
	 */
	async assignRandomCoupon({ couponBookId, userId }: AssignRandomCouponDto): Promise<CouponAssignmentResponseDto> {
		const book = await this.findCouponBookOrFail(couponBookId);

		this.validateCouponBook(book);

		await this.checkUserAssignmentLimit(userId, couponBookId, book.maxAssignmentsPerUser);

		const { assignment, couponCode } = await this.dataSource.transaction(async (manager) => {
			return this.assignRandomCouponInTransaction(manager, couponBookId, userId);
		});

		this.logger.log(`Assigned random coupon to user ${userId} from book ${couponBookId}`);

		return this.buildAssignmentResponse(assignment, book, couponCode);
	}

	/**
	 * Assign a specific coupon code to a user
	 *
	 * @param code - Coupon code
	 * @param dto - Assignment data
	 * @returns Assignment details
	 */
	async assignSpecificCoupon(code: string, { userId }: AssignSpecificCouponDto): Promise<CouponAssignmentResponseDto> {
		const coupon = await this.couponRepo.findOne({
			where: { code },
			relations: ['couponBook']
		});

		if (!coupon) {
			throw new NotFoundException({
				message: `Coupon not found: ${code}`,
				code: ErrorCode.NOT_FOUND
			});
		}

		const { couponBook: book, couponBookId } = coupon;

		if (!book) {
			throw new NotFoundException({
				message: `Coupon book not found for coupon: ${code}`,
				code: ErrorCode.NOT_FOUND
			});
		}

		this.validateCouponBook(book);

		await this.checkUserAssignmentLimit(userId, couponBookId, book.maxAssignmentsPerUser);

		const { assignment, couponCode } = await this.dataSource.transaction(async (manager) => {
			return this.assignSpecificCouponInTransaction(manager, coupon, userId);
		});

		this.logger.log(`Assigned specific coupon ${code} to user ${userId}`);

		return this.buildAssignmentResponse(assignment, book, couponCode);
	}

	// ============================================================================
	// PUBLIC API METHODS - Lock/Unlock
	// ============================================================================

	/**
	 * Lock a coupon temporarily
	 *
	 * Uses Redis distributed lock + database transaction for safety.
	 *
	 * @param code - Coupon code (already normalized)
	 * @param userId - User ID (extracted from JWT token)
	 * @param lockDurationSeconds - Lock duration in seconds (default: 300)
	 * @returns Lock details
	 */
	async lockCoupon(code: string, userId: string, lockDurationSeconds: number = CouponsService.DEFAULT_LOCK_DURATION): Promise<LockResponseDto> {
		await this.acquireLockLock(code, lockDurationSeconds);

		try {
			const lockExpiry = await this.dataSource.transaction(async (manager) => {
				return this.lockCouponInTransaction(manager, code, userId, lockDurationSeconds);
			});

			this.logger.log(`Locked coupon ${code} for user ${userId} until ${lockExpiry.toISOString()}`);

			return {
				couponCode: code,
				locked: true,
				lockExpiresAt: lockExpiry.toISOString(),
				lockDurationSeconds
			};
		} finally {
			await this.releaseLockLock(code);
		}
	}

	/**
	 * Unlock a coupon
	 *
	 * @param code - Coupon code (already normalized)
	 * @param userId - User ID (extracted from JWT token)
	 * @returns Success response
	 */
	async unlockCoupon(code: string, userId: string): Promise<UnlockResponseDto> {
		await this.dataSource.transaction(async (manager) => {
			return this.unlockCouponInTransaction(manager, code, userId);
		});

		this.logger.log(`Unlocked coupon ${code} for user ${userId}`);

		return {
			unlocked: true,
			couponCode: code
		};
	}

	// ============================================================================
	// PUBLIC API METHODS - Redemption
	// ============================================================================

	/**
	 * Redeem a coupon
	 *
	 * Uses multi-layer locking:
	 * 1. Deduplication check (prevent double-submit)
	 * 2. Redis distributed lock
	 * 3. Database optimistic locking (version)
	 * 4. Row-level locking (FOR UPDATE)
	 *
	 * @param code - Coupon code (already normalized)
	 * @param userId - User ID (extracted from JWT token)
	 * @param metadata - Optional metadata about the redemption
	 * @returns Redemption details
	 */
	async redeemCoupon(code: string, userId: string, metadata?: Record<string, any>): Promise<RedeemResponseDto> {
		const couponUserKey = this.buildCouponUserKey(code, userId);

		await this.checkAndSetRedemptionDedup(couponUserKey);
		await this.acquireRedemptionLock(couponUserKey);

		try {
			const { newCount, maxRedemptions, isFullyRedeemed } = await this.dataSource.transaction(async (manager) => {
				return this.redeemCouponInTransaction(manager, code, userId, metadata);
			});

			this.logger.log(`Redeemed coupon ${code} for user ${userId} (count: ${newCount}/${maxRedemptions || '∞'})`);

			return {
				couponCode: code,
				redeemedAt: new Date().toISOString(),
				redemptionCount: newCount,
				redemptionsRemaining: maxRedemptions ? maxRedemptions - newCount : null,
				fullyRedeemed: isFullyRedeemed
			};
		} finally {
			await this.releaseRedemptionLock(couponUserKey);
		}
	}

	// ============================================================================
	// PUBLIC API METHODS - Queries
	// ============================================================================

	/**
	 * Get coupon status
	 *
	 * @param code - Coupon code (already normalized)
	 * @param userId - User ID checking the status
	 * @returns Coupon status details
	 */
	async getCouponStatus(code: string, userId: string): Promise<CouponStatusResponseDto> {
		const result = await this.dataSource.query(
			`
			SELECT 
				c.code,
				c.status,
				cb.valid_until,
				cb.max_redemptions_per_user,
				a.user_id,
				a.locked_at,
				a.lock_expires_at,
				a.redemption_count
			FROM coupons c
			JOIN coupon_books cb ON c.coupon_book_id = cb.id
			LEFT JOIN coupon_assignments a ON c.id = a.coupon_id AND a.user_id = $2
			WHERE c.code = $1
		`,
			[code, userId]
		);

		if (QueryResultUtil.isEmpty(result)) {
			throw new NotFoundException({
				message: `Coupon not found: ${code}`,
				code: ErrorCode.NOT_FOUND
			});
		}

		const {
			status,
			valid_until: validUntil,
			max_redemptions_per_user: maxRedemptions,
			user_id: couponUserId,
			locked_at: lockedAt,
			lock_expires_at: lockExpiresAt,
			redemption_count: redemptionCount = 0
		} = result[0];

		const isAssigned = !!couponUserId;
		const isLocked = this.isCouponLocked(isAssigned, lockedAt, lockExpiresAt);
		const remaining = this.calculateRemainingRedemptions(maxRedemptions, redemptionCount);

		return {
			code,
			status,
			isAssignedToUser: isAssigned,
			isLocked,
			lockExpiresAt: lockExpiresAt || undefined,
			redemptionCount: isAssigned ? redemptionCount : undefined,
			redemptionsRemaining: isAssigned ? (remaining !== null ? remaining : null) : undefined,
			expiresAt: new Date(validUntil).toISOString()
		};
	}

	/**
	 * Get all coupons assigned to a user
	 *
	 * @param userId - User ID
	 * @returns User's coupons with details
	 */
	async getUserCoupons(userId: string): Promise<UserCouponsResponseDto> {
		const assignments = await this.assignmentRepo.find({
			where: { userId },
			relations: ['coupon', 'coupon.couponBook'],
			order: { assignedAt: 'DESC' }
		});

		const coupons: UserCouponItemDto[] = assignments.map((assignment) => {
			const { coupon, redemptionCount, isLocked, assignedAt, redeemedAt } = assignment;
			const { couponBook: book, code, status } = coupon;
			const { maxRedemptionsPerUser: maxRedemptions, name: bookName, validUntil, metadata } = book;

			return {
				code,
				bookName,
				status,
				assignedAt: assignedAt.toISOString(),
				redeemedAt: redeemedAt?.toISOString() || null,
				redemptionCount,
				redemptionsRemaining: this.calculateRemainingRedemptions(maxRedemptions, redemptionCount),
				expiresAt: validUntil.toISOString(),
				isLocked,
				metadata
			};
		});

		return {
			userId,
			totalCoupons: coupons.length,
			availableCoupons: CouponStatusCounter.countByNotStatus(coupons, CouponStatus.REDEEMED),
			redeemedCoupons: CouponStatusCounter.countByStatus(coupons, CouponStatus.REDEEMED),
			coupons
		};
	}

	// ============================================================================
	// PRIVATE HELPER METHODS - Transaction Methods
	// ============================================================================

	/**
	 * Assigns a random available coupon to a user within a transaction
	 *
	 * @param manager - Transaction manager
	 * @param couponBookId - Coupon book ID
	 * @param userId - User ID
	 * @returns Created assignment and coupon code
	 */
	private async assignRandomCouponInTransaction(manager: EntityManager, couponBookId: string, userId: string): Promise<AssignmentTransactionResult> {
		const result = await manager.query(
			`
			SELECT id, code 
			FROM coupons 
			WHERE coupon_book_id = $1 
			  AND status = $2
			ORDER BY RANDOM()
			LIMIT 1
			FOR UPDATE SKIP LOCKED
		`,
			[couponBookId, CouponStatus.AVAILABLE]
		);

		if (QueryResultUtil.isEmpty(result)) {
			throw new BusinessException({
				message: 'No available coupons in this book'
			});
		}

		const { id: couponId, code: couponCode } = result[0];

		await manager.update(Coupon, couponId, {
			status: CouponStatus.ASSIGNED
		});

		const newAssignment = manager.create(CouponAssignment, {
			couponId,
			userId
		});

		const savedAssignment = await manager.save(newAssignment);

		return { assignment: savedAssignment, couponCode };
	}

	/**
	 * Assigns a specific coupon to a user within a transaction
	 *
	 * @param manager - Transaction manager
	 * @param coupon - Coupon entity to assign
	 * @param userId - User ID
	 * @returns Created assignment and coupon code
	 */
	private async assignSpecificCouponInTransaction(manager: EntityManager, coupon: Coupon, userId: string): Promise<AssignmentTransactionResult> {
		const locked = await manager.query(
			`
			SELECT * FROM coupons 
			WHERE id = $1
			FOR UPDATE NOWAIT
		`,
			[coupon.id]
		);

		if (QueryResultUtil.isEmpty(locked)) {
			throw new ConflictException({
				message: 'Coupon is currently being assigned',
				code: ErrorCode.CONFLICT
			});
		}

		if (coupon.status !== CouponStatus.AVAILABLE) {
			throw new BusinessException({
				message: `Coupon is not available (current status: ${coupon.status})`
			});
		}

		await manager.update(Coupon, coupon.id, {
			status: CouponStatus.ASSIGNED
		});

		const newAssignment = manager.create(CouponAssignment, {
			couponId: coupon.id,
			userId
		});

		const savedAssignment = await manager.save(newAssignment);

		return { assignment: savedAssignment, couponCode: coupon.code };
	}

	/**
	 * Locks a coupon within a transaction
	 *
	 * @param manager - Transaction manager
	 * @param code - Normalized coupon code
	 * @param userId - User ID
	 * @param duration - Lock duration in seconds
	 * @returns Lock expiration date
	 */
	private async lockCouponInTransaction(manager: EntityManager, code: string, userId: string, duration: number): Promise<Date> {
		const result = await manager.query(
			`
			SELECT c.id, c.status, c.version, c.coupon_book_id, a.user_id, a.redemption_count
			FROM coupons c
			INNER JOIN coupon_assignments a ON c.id = a.coupon_id AND a.user_id = $2
			WHERE c.code = $1
			FOR UPDATE NOWAIT
		`,
			[code, userId]
		);

		if (QueryResultUtil.isEmpty(result)) {
			throw new NotFoundException({
				message: `Coupon not found or not assigned to this user: ${code}`,
				code: ErrorCode.NOT_FOUND
			});
		}

		const { id: couponId, status } = result[0];

		if (!this.isValidStatusForRedemption(status)) {
			throw new BusinessException({
				message: `Coupon cannot be locked (current status: ${status})`
			});
		}

		const expiresAt = new Date(Date.now() + duration * 1000);

		await manager.update(Coupon, couponId, {
			status: CouponStatus.LOCKED
		});

		await manager.query(
			`
			UPDATE coupon_assignments
			SET locked_at = NOW(), lock_expires_at = $2
			WHERE coupon_id = $1 AND user_id = $3
		`,
			[couponId, expiresAt, userId]
		);

		return expiresAt;
	}

	/**
	 * Unlocks a coupon within a transaction
	 *
	 * @param manager - Transaction manager
	 * @param code - Coupon code (already normalized)
	 * @param userId - User ID
	 */
	private async unlockCouponInTransaction(manager: EntityManager, code: string, userId: string): Promise<void> {
		const result = await manager.query(
			`
			SELECT c.id, c.status, a.user_id
			FROM coupons c
			JOIN coupon_assignments a ON c.id = a.coupon_id AND a.user_id = $2
			WHERE c.code = $1
			FOR UPDATE
		`,
			[code, userId]
		);

		if (QueryResultUtil.isEmpty(result)) {
			throw new NotFoundException({
				message: `Coupon not found: ${code} or not assigned to this user`,
				code: ErrorCode.NOT_FOUND
			});
		}

		const { id: couponId, status } = result[0];

		if (status !== CouponStatus.LOCKED) {
			throw new BusinessException({
				message: 'Coupon is not locked'
			});
		}

		await manager.update(Coupon, couponId, {
			status: CouponStatus.ASSIGNED
		});

		await manager.query(
			`
			UPDATE coupon_assignments
			SET locked_at = NULL, lock_expires_at = NULL
			WHERE coupon_id = $1 AND user_id = $2
		`,
			[couponId, userId]
		);
	}

	/**
	 * Redeems a coupon within a transaction
	 *
	 * @param manager - Transaction manager
	 * @param code - Coupon code (already normalized)
	 * @param userId - User ID
	 * @param metadata - Optional metadata about the redemption
	 * @returns Redemption result with count and status
	 */
	private async redeemCouponInTransaction(
		manager: EntityManager,
		code: string,
		userId: string,
		metadata?: Record<string, any>
	): Promise<{ newCount: number; maxRedemptions: number | null; isFullyRedeemed: boolean }> {
		const data = await manager.query(
			`
			SELECT 
				c.id,
				c.status,
				c.version,
				cb.id as book_id,
				cb.max_redemptions_per_user,
				a.id as assignment_id,
				a.user_id,
				a.redemption_count
			FROM coupons c
			JOIN coupon_books cb ON c.coupon_book_id = cb.id
			INNER JOIN coupon_assignments a ON c.id = a.coupon_id AND a.user_id = $2
			WHERE c.code = $1
			FOR UPDATE NOWAIT
		`,
			[code, userId]
		);

		if (QueryResultUtil.isEmpty(data)) {
			throw new NotFoundException({
				message: `Coupon not found or not assigned to this user: ${code}`,
				code: ErrorCode.NOT_FOUND
			});
		}

		const {
			id: couponId,
			status,
			version,
			max_redemptions_per_user: maxRedemptions,
			redemption_count: currentCount = 0,
			assignment_id: assignmentId
		} = data[0];

		if (!this.isValidStatusForRedemption(status)) {
			throw new BusinessException({
				message: `Coupon cannot be redeemed (current status: ${status})`
			});
		}

		if (maxRedemptions !== null && currentCount >= maxRedemptions) {
			throw new BusinessException({
				message: 'Redemption limit reached for this coupon',
				details: {
					limit: maxRedemptions,
					current: currentCount
				}
			});
		}

		const newCount = currentCount + 1;
		const fullyRedeemed = this.isFullyRedeemed(newCount, maxRedemptions);
		const newStatus = this.getStatusAfterRedemption(fullyRedeemed);

		const updateResult = await manager.query(
			`
			UPDATE coupons 
			SET status = $2, version = version + 1, updated_at = NOW()
			WHERE id = $1 AND version = $3
			RETURNING version
		`,
			[couponId, newStatus, version]
		);

		if (QueryResultUtil.isEmpty(updateResult)) {
			throw new ConflictException({
				message: 'Coupon was modified by another request. Please retry.',
				code: ErrorCode.CONFLICT
			});
		}

		await manager.query(
			`
			UPDATE coupon_assignments
			SET 
				redemption_count = $2,
				redeemed_at = NOW(),
				locked_at = NULL,
				lock_expires_at = NULL,
				metadata = $3
			WHERE id = $1
		`,
			[assignmentId, newCount, JSON.stringify(metadata || {})]
		);

		return {
			newCount,
			maxRedemptions,
			isFullyRedeemed: fullyRedeemed
		};
	}

	// ============================================================================
	// PRIVATE HELPER METHODS - Finders
	// ============================================================================

	/**
	 * Find coupon book or throw not found exception
	 *
	 * @param bookId - Coupon book ID
	 * @returns Coupon book entity
	 */
	private async findCouponBookOrFail(bookId: string): Promise<CouponBook> {
		const book = await this.couponBookRepo.findOne({
			where: { id: bookId }
		});

		if (!book) {
			throw new NotFoundException({
				message: `Coupon book not found: ${bookId}`,
				code: ErrorCode.NOT_FOUND
			});
		}

		return book;
	}

	// ============================================================================
	// PRIVATE HELPER METHODS - Validators
	// ============================================================================

	/**
	 * Check if a coupon is fully redeemed based on redemption count and limit
	 *
	 * @param currentCount - Current redemption count
	 * @param maxRedemptions - Maximum redemptions allowed (null = unlimited)
	 * @returns True if coupon has reached its redemption limit
	 */
	private isFullyRedeemed(currentCount: number, maxRedemptions: number | null): boolean {
		return maxRedemptions !== null && currentCount >= maxRedemptions;
	}

	/**
	 * Determine the new coupon status after redemption
	 *
	 * @param isFullyRedeemed - Whether the coupon has reached its redemption limit
	 * @returns New coupon status (REDEEMED if fully redeemed, ASSIGNED otherwise)
	 */
	private getStatusAfterRedemption(isFullyRedeemed: boolean): CouponStatus {
		return isFullyRedeemed ? CouponStatus.REDEEMED : CouponStatus.ASSIGNED;
	}

	/**
	 * Check if a coupon status is valid for redemption
	 *
	 * @param status - Current coupon status
	 * @returns True if status is ASSIGNED or LOCKED (valid for redemption)
	 */
	private isValidStatusForRedemption(status: CouponStatus): boolean {
		if (status === CouponStatus.REDEEMED) {
			return false;
		}

		return status === CouponStatus.ASSIGNED || status === CouponStatus.LOCKED;
	}

	/**
	 * Check if a coupon is currently locked
	 *
	 * @param isAssigned - Whether the coupon is assigned to a user
	 * @param lockedAt - Lock timestamp (null if not locked)
	 * @param lockExpiresAt - Lock expiration timestamp (null if not locked)
	 * @returns True if coupon is currently locked and lock hasn't expired
	 */
	private isCouponLocked(isAssigned: boolean, lockedAt: string | null | undefined, lockExpiresAt: string | null | undefined): boolean {
		if (!isAssigned || !lockedAt || !lockExpiresAt) {
			return false;
		}

		return new Date(lockExpiresAt) > new Date();
	}

	/**
	 * Calculate remaining redemptions for a coupon
	 *
	 * @param maxRedemptions - Maximum redemptions allowed (null = unlimited)
	 * @param redemptionCount - Current redemption count
	 * @returns Remaining redemptions (null if unlimited)
	 */
	private calculateRemainingRedemptions(maxRedemptions: number | null | undefined, redemptionCount: number): number | null {
		if (maxRedemptions === null || maxRedemptions === undefined) {
			return null;
		}

		return maxRedemptions - redemptionCount;
	}

	/**
	 * Build coupon-user key for cache operations
	 *
	 * @param normalizedCode - Normalized coupon code
	 * @param userId - User ID
	 * @returns Cache key in format "code:userId"
	 */
	private buildCouponUserKey(normalizedCode: string, userId: string): string {
		return `${normalizedCode}:${userId}`;
	}

	/**
	 * Check and set deduplication flag for coupon redemption
	 * Throws ConflictException if a duplicate redemption request is detected
	 *
	 * @param couponUserKey - Cache key for the coupon-user combination
	 * @throws ConflictException if duplicate request detected
	 */
	private async checkAndSetRedemptionDedup(couponUserKey: string): Promise<void> {
		const isDuplicate = await this.cacheService.hasDedup(CacheFeature.COUPON_REDEEM, couponUserKey);

		if (isDuplicate) {
			throw new ConflictException({
				message: 'Redemption request already in progress',
				code: ErrorCode.CONFLICT
			});
		}

		await this.cacheService.setDedup(CacheFeature.COUPON_REDEEM, couponUserKey, 60);
	}

	/**
	 * Acquire distributed lock for coupon redemption
	 * Throws ConflictException if lock cannot be acquired
	 *
	 * @param couponUserKey - Cache key for the coupon-user combination
	 * @throws ConflictException if lock cannot be acquired
	 */
	private async acquireRedemptionLock(couponUserKey: string): Promise<void> {
		const lockAcquired = await this.cacheService.acquireLock(CacheFeature.COUPON_REDEEM, couponUserKey, 10);

		if (!lockAcquired) {
			throw new ConflictException({
				message: 'Coupon is being redeemed by another request',
				code: ErrorCode.CONFLICT
			});
		}
	}

	/**
	 * Release distributed lock for coupon redemption
	 *
	 * @param couponUserKey - Cache key for the coupon-user combination
	 */
	private async releaseRedemptionLock(couponUserKey: string): Promise<void> {
		await this.cacheService.releaseLock(CacheFeature.COUPON_REDEEM, couponUserKey);
	}

	/**
	 * Acquire distributed lock for coupon locking operation
	 * Throws ConflictException if lock cannot be acquired
	 *
	 * @param normalizedCode - Normalized coupon code
	 * @param lockDurationSeconds - Lock duration in seconds
	 * @throws ConflictException if lock cannot be acquired
	 */
	private async acquireLockLock(normalizedCode: string, lockDurationSeconds: number): Promise<void> {
		const redisLockAcquired = await this.cacheService.acquireLock(CacheFeature.COUPON_LOCK, normalizedCode, lockDurationSeconds);

		if (!redisLockAcquired) {
			throw new ConflictException({
				message: 'Coupon is currently locked by another request',
				code: ErrorCode.CONFLICT
			});
		}
	}

	/**
	 * Release distributed lock for coupon locking operation
	 *
	 * @param normalizedCode - Normalized coupon code
	 */
	private async releaseLockLock(normalizedCode: string): Promise<void> {
		await this.cacheService.releaseLock(CacheFeature.COUPON_LOCK, normalizedCode);
	}

	/**
	 * Validate coupon book and check if valid
	 *
	 * @param book - Coupon book entity to validate
	 * @throws BusinessException if book is invalid
	 */
	private validateCouponBook(book: CouponBook): void {
		if (!book.isActive) {
			throw new BusinessException({
				message: 'Coupon book is not active'
			});
		}

		if (book.isExpired) {
			throw new BusinessException({
				message: 'Coupon book has expired'
			});
		}

		const now = new Date();

		if (now < book.validFrom) {
			throw new BusinessException({
				message: 'Coupon book is not yet valid',
				details: { validFrom: book.validFrom.toISOString() }
			});
		}
	}

	/**
	 * Check if user has reached assignment limit
	 *
	 * @param userId - User ID
	 * @param bookId - Coupon book ID
	 * @param maxAssignments - Max assignments allowed (null = unlimited)
	 */
	private async checkUserAssignmentLimit(userId: string, bookId: string, maxAssignments: number | null): Promise<void> {
		if (maxAssignments === null) {
			return; // No limit
		}

		const count = await this.assignmentRepo
			.createQueryBuilder('a')
			.innerJoin('a.coupon', 'c')
			.where('c.coupon_book_id = :bookId', { bookId })
			.andWhere('a.user_id = :userId', { userId })
			.getCount();

		if (count >= maxAssignments) {
			throw new BusinessException({
				message: 'User has reached maximum assignment limit for this coupon book',
				details: {
					limit: maxAssignments,
					current: count
				}
			});
		}
	}

	// ============================================================================
	// PRIVATE HELPER METHODS - Response Builders
	// ============================================================================

	/**
	 * Build assignment response DTO
	 */
	private buildAssignmentResponse(
		{ id: assignmentId, assignedAt, redemptionCount }: CouponAssignment,
		{ maxRedemptionsPerUser: maxRedemptions, validUntil }: CouponBook,
		couponCode: string
	): CouponAssignmentResponseDto {
		const remaining = this.calculateRemainingRedemptions(maxRedemptions, redemptionCount);

		return {
			couponCode,
			assignmentId,
			assignedAt: assignedAt.toISOString(),
			expiresAt: validUntil.toISOString(),
			redemptionsRemaining: remaining,
			redemptionCount
		};
	}
}
