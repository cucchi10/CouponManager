import { IsArray, IsString, ArrayMinSize, ArrayMaxSize, Matches, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NormalizeCodes } from '../../shared/decorators';

/**
 * DTO for uploading custom coupon codes to a book
 */
export class UploadCodesDto {
	@ApiProperty({
		description: 'Array of coupon codes to upload',
		example: ['SAVE20-ABC123', 'SAVE20-DEF456', 'SAVE20-GHI789'],
		minItems: 1,
		maxItems: 10000,
		type: [String]
	})
	@IsArray()
	@ArrayMinSize(1)
	@ArrayMaxSize(10000)
	@IsString({ each: true })
	@MinLength(6, { each: true })
	@MaxLength(32, { each: true })
	@Matches(/^[A-Z0-9\-_]+$/, {
		each: true,
		message: 'Each code must contain only uppercase letters, digits, hyphens, and underscores'
	})
	@NormalizeCodes()
	codes: string[];
}
