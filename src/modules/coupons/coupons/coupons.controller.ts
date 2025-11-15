import { Controller, Get, Post, Body, Param, Request, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CouponsService } from './coupons.service';
import {
	AssignRandomCouponDto,
	CouponAssignmentResponseDto,
	LockCouponDto,
	LockResponseDto,
	UnlockResponseDto,
	RedeemCouponDto,
	RedeemResponseDto,
	CouponStatusResponseDto,
	UserCouponsResponseDto
} from './dto';
import type { RequestWithUser } from '@/types/auth.types';
import { ApiJwtEndpoint, ApiApiKeyEndpoint } from '@/modules/common/swagger/decorators';
import { SkipJwt } from '@/decorators';
import { ApiKeyGuard } from '@/guards';
import { NormalizeCodePipe } from '../shared/pipes';

/**
 * Coupons Controller
 *
 * Manages coupon assignment, locking, and redemption operations.
 *
 * All endpoints return only data - ResponseTransformInterceptor wraps it.
 * Errors are thrown as exceptions - HttpExceptionFilter handles them.
 *
 * Security:
 * - All endpoints require JWT authentication
 * - User ID is extracted from JWT token
 * - Concurrency is handled at service layer
 */
@ApiTags('coupons')
@Controller('coupons')
export class CouponsController {
	constructor(private readonly couponsService: CouponsService) {}

	/**
	 * Assign a random coupon to a user
	 *
	 * Selects a random available coupon from the specified book
	 * and assigns it to the user.
	 *
	 * @param dto - Assignment data
	 * @returns Assignment details
	 */
	@Post('assign/random')
	@SkipJwt()
	@UseGuards(ApiKeyGuard)
	@HttpCode(HttpStatus.OK)
	@ApiApiKeyEndpoint({
		summary: 'Assign random coupon to user',
		description:
			'Assigns a random available coupon from the specified book to a user. Uses row-level locking to prevent race conditions. Requires API key authentication.',
		requestDto: AssignRandomCouponDto,
		responseDto: CouponAssignmentResponseDto
	})
	async assignRandomCoupon(@Body() dto: AssignRandomCouponDto): Promise<CouponAssignmentResponseDto> {
		return this.couponsService.assignRandomCoupon(dto);
	}

	/**
	 * Assign a specific coupon code to the authenticated user
	 *
	 * Assigns a specific coupon code to the authenticated user if available.
	 * The user ID is extracted from the JWT token.
	 *
	 * @param code - Coupon code
	 * @param req - Request with user info from JWT token
	 * @returns Assignment details
	 */
	@Post('assign/:code')
	@ApiJwtEndpoint({
		summary: 'Assign specific coupon to authenticated user',
		description:
			'Assigns a specific coupon code to the authenticated user if available. User ID is extracted from the JWT token. Code must not be already assigned.',
		responseDto: CouponAssignmentResponseDto,
		pathParams: [{ name: 'code', description: 'Coupon code to assign', example: 'SUMMER1A2B' }],
		standardErrors: {
			conflict: true
		}
	})
	@HttpCode(HttpStatus.OK)
	async assignSpecificCoupon(
		@Param('code', NormalizeCodePipe) code: string,
		@Request() { user }: RequestWithUser
	): Promise<CouponAssignmentResponseDto> {
		return this.couponsService.assignSpecificCoupon(code, { userId: user.sub });
	}

	/**
	 * Lock a coupon temporarily
	 *
	 * Locks a coupon for a specified duration (e.g., during checkout).
	 * Lock expires automatically after the duration.
	 * User ID is extracted from JWT token.
	 *
	 * @param code - Coupon code
	 * @param dto - Lock data (optional lockDurationSeconds)
	 * @param req - Request with user info from JWT token
	 * @returns Lock details
	 */
	@Post(':code/lock')
	@ApiJwtEndpoint({
		summary: 'Lock coupon temporarily',
		description:
			'Locks a coupon for a specified duration (30-600 seconds). Used during checkout to prevent redemption by others. Lock expires automatically. User ID is extracted from JWT token.',
		requestDto: LockCouponDto,
		responseDto: LockResponseDto,
		pathParams: [{ name: 'code', description: 'Coupon code', example: 'SUMMER1A2B' }]
	})
	@HttpCode(HttpStatus.OK)
	async lockCoupon(
		@Param('code', NormalizeCodePipe) code: string,
		@Body() dto: LockCouponDto,
		@Request() { user }: RequestWithUser
	): Promise<LockResponseDto> {
		return this.couponsService.lockCoupon(code, user.sub, dto.lockDurationSeconds);
	}

	/**
	 * Unlock a coupon
	 *
	 * Releases a temporary lock on a coupon (e.g., if checkout was cancelled).
	 * User ID is extracted from JWT token.
	 *
	 * @param code - Coupon code
	 * @param req - Request with user info from JWT token
	 * @returns Success response
	 */
	@Post(':code/unlock')
	@HttpCode(HttpStatus.OK)
	@ApiJwtEndpoint({
		summary: 'Unlock coupon',
		description: 'Releases a temporary lock on a coupon. Use this if checkout is cancelled. User ID is extracted from JWT token.',
		responseDto: UnlockResponseDto,
		pathParams: [{ name: 'code', description: 'Coupon code', example: 'SUMMER1A2B' }]
	})
	async unlockCoupon(@Param('code', NormalizeCodePipe) code: string, @Request() { user }: RequestWithUser): Promise<UnlockResponseDto> {
		return this.couponsService.unlockCoupon(code, user.sub);
	}

	/**
	 * Redeem a coupon
	 *
	 * Permanently redeems a coupon (or increments redemption count if multiple redemptions allowed).
	 * Uses multi-layer locking to prevent race conditions.
	 * User ID is extracted from JWT token.
	 *
	 * @param code - Coupon code
	 * @param dto - Redemption data (optional metadata)
	 * @param req - Request with user info from JWT token
	 * @returns Redemption details
	 */
	@Post(':code/redeem')
	@HttpCode(HttpStatus.OK)
	@ApiJwtEndpoint({
		summary: 'Redeem coupon',
		description:
			'Redeems a coupon permanently (or increments redemption count). Uses distributed locking and optimistic locking to prevent race conditions. User ID is extracted from JWT token.',
		requestDto: RedeemCouponDto,
		responseDto: RedeemResponseDto,
		pathParams: [{ name: 'code', description: 'Coupon code', example: 'SUMMER1A2B' }]
	})
	async redeemCoupon(
		@Param('code', NormalizeCodePipe) code: string,
		@Body() dto: RedeemCouponDto,
		@Request() { user }: RequestWithUser
	): Promise<RedeemResponseDto> {
		return this.couponsService.redeemCoupon(code, user.sub, dto.metadata);
	}

	/**
	 * Get coupon status
	 *
	 * Checks the current status of a coupon for a specific user.
	 *
	 * @param code - Coupon code
	 * @param req - Request with user info
	 * @returns Coupon status details
	 */
	@Get(':code/status')
	@HttpCode(HttpStatus.OK)
	@ApiJwtEndpoint({
		summary: 'Get coupon status',
		description: 'Retrieves the current status of a coupon for the authenticated user',
		responseDto: CouponStatusResponseDto,
		pathParams: [{ name: 'code', description: 'Coupon code', example: 'SUMMER1A2B' }]
	})
	async getCouponStatus(@Param('code', NormalizeCodePipe) code: string, @Request() req: RequestWithUser): Promise<CouponStatusResponseDto> {
		const userId = req.user?.sub || '';

		return this.couponsService.getCouponStatus(code, userId);
	}

	/**
	 * Get user's assigned coupons
	 *
	 * Retrieves all coupons assigned to the authenticated user.
	 *
	 * @param req - Request with user info
	 * @returns List of user's coupons
	 */
	@Get('my-coupons')
	@HttpCode(HttpStatus.OK)
	@ApiJwtEndpoint({
		summary: "Get user's coupons",
		description: 'Retrieves all coupons assigned to the authenticated user with redemption status',
		responseDto: UserCouponsResponseDto
	})
	async getUserCoupons(@Request() req: RequestWithUser): Promise<UserCouponsResponseDto> {
		const userId = req.user?.sub || '';

		return this.couponsService.getUserCoupons(userId);
	}
}
