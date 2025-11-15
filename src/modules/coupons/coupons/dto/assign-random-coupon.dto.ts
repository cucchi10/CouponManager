import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for assigning a random coupon to a user
 */
export class AssignRandomCouponDto {
	@ApiProperty({
		description: 'ID of the coupon book',
		example: '123e4567-e89b-12d3-a456-426614174000'
	})
	@IsUUID()
	@IsNotEmpty()
	couponBookId: string;

	@ApiProperty({
		description: 'User ID to assign the coupon to',
		example: 'demo'
	})
	@IsString()
	@IsNotEmpty()
	userId: string;
}
