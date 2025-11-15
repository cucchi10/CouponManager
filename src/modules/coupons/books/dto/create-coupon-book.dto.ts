import { IsString, IsNotEmpty, IsOptional, IsInt, Min, IsDateString, IsObject, MaxLength, MinLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating a new coupon book
 */
export class CreateCouponBookDto {
	@ApiProperty({
		description: 'Name of the coupon book',
		example: 'Summer Sale 2026',
		minLength: 3,
		maxLength: 255
	})
	@IsString()
	@IsNotEmpty()
	@MinLength(3)
	@MaxLength(255)
	name: string;

	@ApiPropertyOptional({
		description: 'Description of the coupon book',
		example: '20% off on all products'
	})
	@IsString()
	@IsOptional()
	description?: string;

	@ApiProperty({
		description: 'Start date of validity (ISO 8601)',
		example: '2025-10-05T10:00:00Z'
	})
	@IsDateString()
	validFrom: string;

	@ApiProperty({
		description: 'End date of validity (ISO 8601)',
		example: '2026-03-31T23:59:59Z'
	})
	@IsDateString()
	validUntil: string;

	@ApiPropertyOptional({
		description: 'Maximum number of times a user can redeem coupons from this book (null = unlimited)',
		example: 3,
		minimum: 1
	})
	@IsInt()
	@Min(1)
	@IsOptional()
	maxRedemptionsPerUser?: number | null;

	@ApiPropertyOptional({
		description: 'Maximum number of coupons a user can be assigned from this book (null = unlimited)',
		example: 5,
		minimum: 1
	})
	@IsInt()
	@Min(1)
	@IsOptional()
	maxAssignmentsPerUser?: number | null;

	@ApiPropertyOptional({
		description: 'Pattern for auto-generating codes. Use {X} for letters, {9} for digits, {*} for alphanumeric. Example: SUMMER{XXXX}',
		example: 'SUMMER{XXXX}',
		maxLength: 100
	})
	@IsString()
	@IsOptional()
	@MaxLength(100)
	@Matches(/^[A-Z0-9{}\-_]+$/, {
		message: 'Code pattern must contain only uppercase letters, digits, hyphens, underscores, and placeholders {X}, {9}, {*}'
	})
	codePattern?: string | null;

	@ApiPropertyOptional({
		description: 'Maximum number of codes allowed (required if codePattern is provided)',
		example: 10000,
		minimum: 1
	})
	@IsInt()
	@Min(1)
	@IsOptional()
	maxCodes?: number;

	@ApiPropertyOptional({
		description: 'Additional metadata (JSON object)',
		example: {
			discountPercent: 20,
			applicableCategories: ['electronics', 'clothing']
		}
	})
	@IsObject()
	@IsOptional()
	metadata?: Record<string, any>;
}
