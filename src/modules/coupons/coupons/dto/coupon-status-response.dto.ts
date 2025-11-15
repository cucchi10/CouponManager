import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CouponStatus } from '../../shared/enums';

/**
 * Response DTO for coupon status check
 */
export class CouponStatusResponseDto {
	@ApiProperty({
		description: 'Coupon code',
		example: 'SUMMER1A2B'
	})
	code: string;

	@ApiProperty({
		description: 'Current status of the coupon',
		enum: CouponStatus,
		example: CouponStatus.ASSIGNED
	})
	status: CouponStatus;

	@ApiProperty({
		description: 'Whether the coupon is assigned to the requesting user',
		example: true
	})
	isAssignedToUser: boolean;

	@ApiPropertyOptional({
		description: 'Whether the coupon is currently locked',
		example: false
	})
	isLocked?: boolean;

	@ApiPropertyOptional({
		description: 'When the lock expires (if locked)',
		example: '2024-06-05T10:05:00Z'
	})
	lockExpiresAt?: string | null;

	@ApiPropertyOptional({
		description: 'Number of redemptions by this user',
		example: 0
	})
	redemptionCount?: number;

	@ApiPropertyOptional({
		description: 'Remaining redemptions for this user (null = unlimited, undefined = not assigned)',
		example: 3
	})
	redemptionsRemaining?: number | null | undefined;

	@ApiProperty({
		description: 'Coupon book expiration date',
		example: '2024-08-31T23:59:59Z'
	})
	expiresAt: string;
}
