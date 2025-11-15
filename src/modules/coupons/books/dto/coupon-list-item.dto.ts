import { ApiProperty } from '@nestjs/swagger';
import { CouponStatus } from '../../shared/enums';

/**
 * DTO for a single coupon in a paginated list
 */
export class CouponListItemDto {
	@ApiProperty({
		description: 'Coupon code',
		example: 'SUMMER1A2B'
	})
	code: string;

	@ApiProperty({
		description: 'Coupon status',
		enum: CouponStatus,
		example: CouponStatus.AVAILABLE
	})
	status: CouponStatus;
}
