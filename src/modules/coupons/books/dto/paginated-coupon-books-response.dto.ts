import { ApiProperty } from '@nestjs/swagger';
import { CouponBookListItemDto } from './coupon-book-list-item.dto';
import { PaginationMetaDto } from './paginated-response.dto';

/**
 * Response DTO for paginated coupon books list
 */
export class PaginatedCouponBooksResponseDto {
	@ApiProperty({
		description: 'List of coupon books',
		type: [CouponBookListItemDto]
	})
	items: CouponBookListItemDto[];

	@ApiProperty({
		description: 'Pagination metadata',
		type: PaginationMetaDto
	})
	pagination: PaginationMetaDto;
}
