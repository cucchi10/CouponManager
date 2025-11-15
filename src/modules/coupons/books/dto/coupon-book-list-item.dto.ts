import { ApiProperty } from '@nestjs/swagger';

/**
 * Simplified DTO for coupon book list items
 */
export class CouponBookListItemDto {
	@ApiProperty({
		description: 'Coupon book ID',
		example: '123e4567-e89b-12d3-a456-426614174000'
	})
	id: string;

	@ApiProperty({
		description: 'Name of the coupon book',
		example: 'Summer Sale 2024'
	})
	name: string;

	@ApiProperty({
		description: 'Whether the book is active',
		example: true
	})
	isActive: boolean;
}
