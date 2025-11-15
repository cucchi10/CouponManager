import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Response DTO for coupon assignment
 */
export class CouponAssignmentResponseDto {
	@ApiProperty({
		description: 'Coupon code',
		example: 'SUMMER1A2B'
	})
	couponCode: string;

	@ApiProperty({
		description: 'Assignment ID',
		example: '123e4567-e89b-12d3-a456-426614174000'
	})
	assignmentId: string;

	@ApiProperty({
		description: 'When the coupon was assigned',
		example: '2025-06-05T10:00:00Z'
	})
	assignedAt: string;

	@ApiProperty({
		description: 'When the coupon book expires',
		example: '2030-08-31T23:59:59Z'
	})
	expiresAt: string;

	@ApiPropertyOptional({
		description: 'Number of redemptions remaining for this user (null = unlimited)',
		example: 3
	})
	redemptionsRemaining: number | null;

	@ApiProperty({
		description: 'Number of times already redeemed by this user',
		example: 0
	})
	redemptionCount: number;
}
