import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CouponStatus } from '../../shared/enums';

/**
 * Single coupon item in user's coupon list
 */
export class UserCouponItemDto {
	@ApiProperty({
		description: 'Coupon code',
		example: 'SUMMER1A2B'
	})
	code: string;

	@ApiProperty({
		description: 'Coupon book name',
		example: 'Summer Sale 2024'
	})
	bookName: string;

	@ApiProperty({
		description: 'Coupon status',
		enum: CouponStatus,
		example: CouponStatus.ASSIGNED
	})
	status: CouponStatus;

	@ApiProperty({
		description: 'When assigned to user',
		example: '2024-06-05T10:00:00Z'
	})
	assignedAt: string;

	@ApiPropertyOptional({
		description: 'When last redeemed',
		example: '2024-06-05T10:10:00Z'
	})
	redeemedAt: string | null;

	@ApiProperty({
		description: 'Number of times redeemed',
		example: 1
	})
	redemptionCount: number;

	@ApiPropertyOptional({
		description: 'Remaining redemptions (null = unlimited)',
		example: 2
	})
	redemptionsRemaining: number | null;

	@ApiProperty({
		description: 'When the coupon book expires',
		example: '2024-08-31T23:59:59Z'
	})
	expiresAt: string;

	@ApiProperty({
		description: 'Whether the coupon is currently locked',
		example: false
	})
	isLocked: boolean;

	@ApiPropertyOptional({
		description: 'Coupon book metadata',
		example: { discountPercent: 20 }
	})
	metadata: Record<string, any> | null;
}

/**
 * Response DTO for user's coupons list
 */
export class UserCouponsResponseDto {
	@ApiProperty({
		description: 'User ID',
		example: 'demo'
	})
	userId: string;

	@ApiProperty({
		description: 'Total number of assigned coupons',
		example: 5
	})
	totalCoupons: number;

	@ApiProperty({
		description: 'Number of available coupons (not fully redeemed)',
		example: 3
	})
	availableCoupons: number;

	@ApiProperty({
		description: 'Number of fully redeemed coupons',
		example: 2
	})
	redeemedCoupons: number;

	@ApiProperty({
		description: 'List of user coupons',
		type: [UserCouponItemDto]
	})
	coupons: UserCouponItemDto[];
}
