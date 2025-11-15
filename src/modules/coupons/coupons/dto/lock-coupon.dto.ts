import { IsInt, Min, Max, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for locking a coupon temporarily
 * User ID is extracted from JWT token
 */
export class LockCouponDto {
	@ApiPropertyOptional({
		description: 'Lock duration in seconds (default: 300 = 5 minutes)',
		example: 300,
		minimum: 30,
		maximum: 600,
		default: 300
	})
	@IsInt()
	@Min(30)
	@Max(600)
	@IsOptional()
	lockDurationSeconds?: number;
}
