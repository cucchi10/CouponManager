import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Response DTO for code upload operation
 */
export class UploadCodesResponseDto {
	@ApiProperty({
		description: 'ID of the coupon book',
		example: '123e4567-e89b-12d3-a456-426614174000'
	})
	couponBookId: string;

	@ApiProperty({
		description: 'Number of codes successfully uploaded',
		example: 3
	})
	uploadedCount: number;

	@ApiProperty({
		description: 'Number of duplicate codes skipped',
		example: 0
	})
	duplicateCount: number;

	@ApiProperty({
		description: 'Number of invalid codes rejected',
		example: 0
	})
	invalidCount: number;

	@ApiProperty({
		description: 'Total codes in the book after upload',
		example: 3
	})
	totalCodes: number;

	@ApiPropertyOptional({
		description: 'Maximum number of codes allowed in this book (null = unlimited)',
		example: 10000
	})
	maxCodes: number | null;
}
