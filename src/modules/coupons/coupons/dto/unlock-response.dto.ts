import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTO for unlocking a coupon
 */
export class UnlockResponseDto {
	@ApiProperty({
		description: 'Whether the coupon was successfully unlocked',
		example: true
	})
	unlocked: boolean;

	@ApiProperty({
		description: 'The coupon code that was unlocked',
		example: 'SUMMER1A2B'
	})
	couponCode: string;
}
