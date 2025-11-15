import { Injectable, Logger, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull, FindOptionsWhere, EntityManager } from 'typeorm';
import { CouponBook } from './entities';
import { Coupon } from '../coupons/entities';
import {
	CreateCouponBookDto,
	CouponBookResponseDto,
	CouponBookListItemDto,
	PaginatedCouponBooksResponseDto,
	PaginatedCouponsResponseDto,
	CouponListItemDto,
	PaginationQueryDto,
	UploadCodesDto,
	UploadCodesResponseDto,
	GenerateCodesDto
} from './dto';
import { CouponStatus } from '../shared/enums';
import { CodeGenerator, CouponStatusCounter } from '../shared/utils';
import { BusinessException } from '@/modules/common/exceptions';
import { ErrorCode } from '@/modules/common/filters';

/**
 * Coupon Books Service
 *
 * Handles business logic for coupon book management:
 * - Creating coupon books
 * - Uploading custom codes
 * - Auto-generating codes with patterns
 * - Fetching book details and statistics
 */
@Injectable()
export class CouponBooksService {
	private readonly logger = new Logger(CouponBooksService.name);

	private static readonly BATCH_SIZE = 5000;
	private static readonly MAX_PATTERN_USAGE_RATIO = 0.8;

	constructor(
		@InjectRepository(CouponBook)
		private readonly couponBookRepo: Repository<CouponBook>,
		@InjectRepository(Coupon)
		private readonly couponRepo: Repository<Coupon>,
		private readonly dataSource: DataSource
	) {}

	// ============================================================================
	// PUBLIC API METHODS
	// ============================================================================

	/**
	 * Create a new coupon book
	 *
	 * @param dto - Coupon book creation data
	 * @returns Created coupon book with statistics
	 */
	async createCouponBook(dto: CreateCouponBookDto): Promise<CouponBookResponseDto> {
		const { validFrom, validUntil, codePattern = null, maxCodes = null, ...rest } = dto;

		await this.validateUniqueNameAndDescription(rest.name, rest.description);

		const from = new Date(validFrom);
		const until = new Date(validUntil);

		if (from >= until) {
			throw new BadRequestException({
				message: 'validFrom must be before validUntil',
				code: ErrorCode.VALIDATION_ERROR
			});
		}

		if (codePattern) {
			this.validateCodePattern(codePattern, maxCodes);
		}

		const book = this.couponBookRepo.create({
			...rest,
			validFrom: from,
			validUntil: until,
			codePattern,
			maxCodes
		});

		const saved = await this.couponBookRepo.save(book);

		this.logger.log(`Created coupon book: ${saved.id} - ${saved.name}`);

		return this.buildBookResponse(saved);
	}

	/**
	 * Get coupon book by ID with statistics
	 *
	 * @param bookId - Coupon book ID
	 * @returns Coupon book with stats
	 */
	async getCouponBook(bookId: string): Promise<CouponBookResponseDto> {
		const book = await this.findBookOrFail(bookId);

		return this.buildBookResponse(book);
	}

	/**
	 * Get all coupon books (paginated)
	 *
	 * @param query - Pagination query parameters
	 * @returns Paginated list of coupon books with basic info (id, name, isActive)
	 */
	async getAllCouponBooks(query: PaginationQueryDto): Promise<PaginatedCouponBooksResponseDto> {
		const { page = 1, limit = 20 } = query;
		const skip = (page - 1) * limit;

		const [total, books]: [number, CouponBookListItemDto[]] = await Promise.all([
			this.couponBookRepo.count(),
			this.couponBookRepo.find({
				select: ['id', 'name', 'isActive'],
				order: { createdAt: 'DESC' },
				skip,
				take: limit
			})
		]);

		const totalPages = Math.ceil(total / limit);

		return {
			items: books,
			pagination: {
				page,
				limit,
				total,
				totalPages,
				hasNextPage: page < totalPages,
				hasPrevPage: page > 1
			}
		};
	}

	/**
	 * Get all coupons for a specific coupon book (paginated)
	 *
	 * @param bookId - Coupon book ID
	 * @param query - Pagination query parameters
	 * @returns Paginated list of coupons
	 */
	async getCouponsByBookId(bookId: string, query: PaginationQueryDto): Promise<PaginatedCouponsResponseDto> {
		// Verify book exists
		await this.findBookOrFail(bookId);

		const { page = 1, limit = 20 } = query;
		const skip = (page - 1) * limit;

		const [total, coupons] = await Promise.all([
			this.couponRepo.count({
				where: { couponBookId: bookId }
			}),
			this.couponRepo.find({
				where: { couponBookId: bookId },
				select: ['code', 'status'],
				order: { createdAt: 'DESC' },
				skip,
				take: limit
			})
		]);

		const totalPages = Math.ceil(total / limit);

		const items: CouponListItemDto[] = coupons.map((coupon) => ({
			code: coupon.code,
			status: coupon.status
		}));

		return {
			items,
			pagination: {
				page,
				limit,
				total,
				totalPages,
				hasNextPage: page < totalPages,
				hasPrevPage: page > 1
			}
		};
	}

	/**
	 * Deactivate a coupon book
	 *
	 * @param bookId - Coupon book ID
	 * @returns Updated book
	 */
	async deactivateCouponBook(bookId: string): Promise<CouponBookResponseDto> {
		const book = await this.findBookOrFail(bookId);

		if (!book.isActive) {
			this.logger.warn(`Coupon book ${bookId} is already deactivated`);
			throw new ConflictException({
				message: `Coupon book ${bookId} is already deactivated`,
				code: ErrorCode.CONFLICT
			});
		}

		book.isActive = false;

		const updated = await this.couponBookRepo.save(book);

		this.logger.log(`Deactivated coupon book: ${bookId}`);

		return this.buildBookResponse(updated);
	}

	/**
	 * Upload custom codes to a coupon book
	 *
	 * @param bookId - Coupon book ID
	 * @param dto - Upload codes data
	 * @returns Upload statistics
	 */
	async uploadCodes(bookId: string, { codes }: UploadCodesDto): Promise<UploadCodesResponseDto> {
		const book = await this.findBookOrFail(bookId);

		this.validateBookForCodeOperation(book, bookId, false);

		const { uploadedCount, duplicateCount } = await this.dataSource.transaction(async (manager) => {
			return this.batchInsertCodes(manager, bookId, codes);
		});

		this.logger.log(`Uploaded ${uploadedCount} codes to book ${bookId} (${duplicateCount} duplicates skipped)`);

		return {
			couponBookId: bookId,
			uploadedCount,
			duplicateCount,
			invalidCount: 0,
			totalCodes: book.totalCodes + uploadedCount,
			maxCodes: book.maxCodes
		};
	}

	/**
	 * Auto-generate codes for a coupon book
	 *
	 * @param bookId - Coupon book ID
	 * @param dto - Generation parameters
	 * @returns Upload statistics
	 */
	async generateCodes(bookId: string, dto: GenerateCodesDto): Promise<UploadCodesResponseDto> {
		const book = await this.findBookOrFail(bookId);

		this.validateBookForCodeOperation(book, bookId, true);

		const currentCount = await this.couponRepo.count({
			where: { couponBookId: bookId }
		});

		if (book.maxCodes !== null && currentCount >= book.maxCodes) {
			throw new BusinessException({
				message: 'Coupon book already has the maximum number of codes',
				details: { current: currentCount, max: book.maxCodes }
			});
		}

		const toGenerate = this.calculateCodesToGenerate(book.maxCodes, currentCount, dto.count);

		this.logger.log(`Generating ${toGenerate} codes for book ${bookId} with pattern: ${book.codePattern}`);

		const codes = CodeGenerator.generateCodes(book.codePattern!, toGenerate);

		const { uploadedCount, duplicateCount } = await this.dataSource.transaction(async (manager) => {
			return this.batchInsertCodes(manager, bookId, codes);
		});

		this.logger.log(`Generated ${uploadedCount} codes for book ${bookId}`);

		return {
			couponBookId: bookId,
			uploadedCount,
			duplicateCount,
			invalidCount: 0,
			totalCodes: book.totalCodes + uploadedCount,
			maxCodes: book.maxCodes
		};
	}

	// ============================================================================
	// PRIVATE HELPER METHODS - Response Builders
	// ============================================================================

	/**
	 * Build response DTO with statistics
	 *
	 * @param book - Coupon book entity
	 * @returns Response DTO
	 */
	private async buildBookResponse(book: CouponBook): Promise<CouponBookResponseDto> {
		const stats = await this.couponRepo
			.createQueryBuilder('c')
			.select('c.status', 'status')
			.addSelect('COUNT(*)', 'count')
			.where('c.coupon_book_id = :bookId', { bookId: book.id })
			.groupBy('c.status')
			.getRawMany();

		return {
			id: book.id,
			name: book.name,
			description: book.description,
			isActive: book.isActive,
			validFrom: book.validFrom.toISOString(),
			validUntil: book.validUntil.toISOString(),
			maxRedemptionsPerUser: book.maxRedemptionsPerUser,
			maxAssignmentsPerUser: book.maxAssignmentsPerUser,
			codePattern: book.codePattern,
			maxCodes: book.maxCodes,
			totalCodes: book.totalCodes,
			availableCodes: CouponStatusCounter.getStatusCountFromStats(stats, CouponStatus.AVAILABLE),
			assignedCodes: CouponStatusCounter.getStatusCountFromStats(stats, CouponStatus.ASSIGNED),
			redeemedCodes: CouponStatusCounter.getStatusCountFromStats(stats, CouponStatus.REDEEMED),
			metadata: book.metadata,
			createdAt: book.createdAt.toISOString(),
			updatedAt: book.updatedAt.toISOString()
		};
	}

	// ============================================================================
	// PRIVATE HELPER METHODS - Code Management
	// ============================================================================

	/**
	 * Batch inserts coupon codes efficiently using PostgreSQL unnest
	 *
	 * @param manager - Transaction manager
	 * @param bookId - Coupon book ID
	 * @param codes - Array of codes to insert
	 * @returns Object with uploadedCount and duplicateCount
	 */
	private async batchInsertCodes(
		manager: EntityManager,
		bookId: string,
		codes: string[]
	): Promise<{ uploadedCount: number; duplicateCount: number }> {
		let uploadedCount = 0;
		let duplicateCount = 0;

		for (let i = 0; i < codes.length; i += CouponBooksService.BATCH_SIZE) {
			const batch = codes.slice(i, i + CouponBooksService.BATCH_SIZE);

			const result = await manager.query(
				`
				INSERT INTO coupons (coupon_book_id, code, status)
				SELECT $1, code, $2
				FROM unnest($3::text[]) AS code
				ON CONFLICT (code) DO NOTHING
				RETURNING id
			`,
				[bookId, CouponStatus.AVAILABLE, batch]
			);

			const inserted = result.length;

			uploadedCount += inserted;
			duplicateCount += batch.length - inserted;
		}

		await manager.update(CouponBook, bookId, {
			totalCodes: () => `total_codes + ${uploadedCount}`
		});

		return { uploadedCount, duplicateCount };
	}

	/**
	 * Calculates how many codes can be generated based on max limit and current count
	 *
	 * @param maxCodes - Maximum codes allowed (null = unlimited)
	 * @param currentCount - Current number of codes in the book
	 * @param requestedCount - Number of codes requested to generate
	 * @returns Number of codes that can be generated (respecting the limit)
	 */
	private calculateCodesToGenerate(maxCodes: number | null, currentCount: number, requestedCount: number): number {
		if (maxCodes === null) {
			return requestedCount;
		}

		return Math.min(requestedCount, maxCodes - currentCount);
	}

	// ============================================================================
	// PRIVATE HELPER METHODS - Validators
	// ============================================================================

	/**
	 * Validates code pattern and total codes for auto-generation
	 *
	 * @param codePattern - Pattern for generating codes
	 * @param totalCodes - Total number of codes to generate
	 * @throws BadRequestException if validation fails
	 */
	private validateCodePattern(codePattern: string, totalCodes?: number | null): void {
		if (!totalCodes) {
			throw new BadRequestException({
				message: 'totalCodes is required when codePattern is provided',
				code: ErrorCode.VALIDATION_ERROR
			});
		}

		if (!CodeGenerator.validatePattern(codePattern)) {
			throw new BadRequestException({
				message: 'Invalid code pattern. Use {X} for letters, {9} for digits, {*} for alphanumeric',
				code: ErrorCode.VALIDATION_ERROR
			});
		}

		const maxUnique = CodeGenerator.estimateMaxUniqueCodes(codePattern);

		if (totalCodes > maxUnique * CouponBooksService.MAX_PATTERN_USAGE_RATIO) {
			throw new BadRequestException({
				message: `Pattern can only generate ~${maxUnique} unique codes, but ${totalCodes} requested. Use a more diverse pattern.`,
				code: ErrorCode.VALIDATION_ERROR
			});
		}
	}

	/**
	 * Validate coupon book for code operations (upload or generate)
	 * Checks if book is active and if codePattern requirement is met
	 *
	 * @param book - Coupon book entity
	 * @param bookId - Coupon book ID (for error messages)
	 * @param requiresCodePattern - True if operation requires codePattern, false if it must not have one
	 * @throws ConflictException if book is not active
	 * @throws BusinessException if codePattern requirement is not met
	 */
	private validateBookForCodeOperation({ isActive, codePattern }: CouponBook, bookId: string, requiresCodePattern: boolean): void {
		if (!isActive) {
			const operation = requiresCodePattern ? 'generate codes for' : 'upload codes to';

			throw new ConflictException({
				message: `Cannot ${operation} a deactivated coupon book: ${bookId}`,
				code: ErrorCode.CONFLICT
			});
		}

		if (requiresCodePattern && !codePattern) {
			throw new BusinessException({
				message: 'Coupon book does not have a code pattern configured'
			});
		}

		if (!requiresCodePattern && codePattern) {
			throw new BusinessException({
				message: 'Cannot upload codes to a book with auto-generation pattern'
			});
		}
	}

	/**
	 * Validates that no coupon book exists with the same name and description
	 *
	 * @param name - Coupon book name
	 * @param description - Coupon book description (optional)
	 * @throws ConflictException if a duplicate is found
	 */
	private async validateUniqueNameAndDescription(name: string, description?: string): Promise<void> {
		const whereCondition: FindOptionsWhere<CouponBook> = description
			? {
					name,
					description
				}
			: {
					name,
					description: IsNull()
				};

		const existingBook = await this.couponBookRepo.findOne({
			where: whereCondition
		});

		if (existingBook) {
			throw new ConflictException({
				message: 'A coupon book with the same name and description already exists',
				code: ErrorCode.CONFLICT,
				details: {
					existingBookId: existingBook.id,
					name,
					description: description || null
				}
			});
		}
	}

	// ============================================================================
	// PRIVATE HELPER METHODS - Finders
	// ============================================================================

	/**
	 * Find book or throw not found exception
	 *
	 * @param bookId - Coupon book ID
	 * @returns Coupon book entity
	 */
	private async findBookOrFail(bookId: string): Promise<CouponBook> {
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
}
