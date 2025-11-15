import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Response DTO for redeem operation
 */
export class RedeemResponseDto {
	@ApiProperty({
		description: 'Coupon code',
		example: 'SUMMER1A2B'
	})
	couponCode: string;

	@ApiProperty({
		description: 'When the coupon was redeemed',
		example: '2024-06-05T10:10:00Z'
	})
	redeemedAt: string;

	@ApiProperty({
		description: 'Total number of times this user has redeemed this coupon',
		example: 1
	})
	redemptionCount: number;

	@ApiPropertyOptional({
		description: 'Number of redemptions remaining for this user (null = unlimited)',
		example: 2
	})
	redemptionsRemaining: number | null;

	@ApiProperty({
		description: 'Whether this coupon is fully redeemed',
		example: false
	})
	fullyRedeemed: boolean;
}
