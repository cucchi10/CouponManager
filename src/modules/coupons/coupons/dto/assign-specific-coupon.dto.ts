import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for assigning a specific coupon code to a user
 */
export class AssignSpecificCouponDto {
	@ApiProperty({
		description: 'User ID to assign the coupon to',
		example: 'demo'
	})
	@IsString()
	@IsNotEmpty()
	userId: string;
}
