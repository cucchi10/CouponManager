import { ApiProperty } from '@nestjs/swagger';
import { CouponListItemDto } from './coupon-list-item.dto';
import { PaginationMetaDto } from './paginated-response.dto';

/**
 * Response DTO for paginated coupons list
 */
export class PaginatedCouponsResponseDto {
	@ApiProperty({
		description: 'List of coupons',
		type: [CouponListItemDto]
	})
	items: CouponListItemDto[];

	@ApiProperty({
		description: 'Pagination metadata',
		type: PaginationMetaDto
	})
	pagination: PaginationMetaDto;
}
