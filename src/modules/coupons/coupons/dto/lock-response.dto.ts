import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTO for lock operation
 */
export class LockResponseDto {
	@ApiProperty({
		description: 'Coupon code',
		example: 'SUMMER1A2B'
	})
	couponCode: string;

	@ApiProperty({
		description: 'Whether the lock was successful',
		example: true
	})
	locked: boolean;

	@ApiProperty({
		description: 'When the lock expires',
		example: '2024-06-05T10:05:00Z'
	})
	lockExpiresAt: string;

	@ApiProperty({
		description: 'Lock duration in seconds',
		example: 300
	})
	lockDurationSeconds: number;
}
