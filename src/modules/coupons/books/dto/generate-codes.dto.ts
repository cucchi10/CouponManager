import { IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for generating coupon codes for a book
 */
export class GenerateCodesDto {
	@ApiProperty({
		description: 'Number of codes to generate',
		example: 1000,
		minimum: 1,
		maximum: 100000
	})
	@IsInt()
	@Min(1)
	@Max(100000)
	count: number;
}
