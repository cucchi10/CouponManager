import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Response DTO for coupon book
 */
export class CouponBookResponseDto {
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

	@ApiPropertyOptional({
		description: 'Description',
		example: '20% off on all products'
	})
	description: string | null;

	@ApiProperty({
		description: 'Whether the book is active',
		example: true
	})
	isActive: boolean;

	@ApiProperty({
		description: 'Start date of validity',
		example: '2024-06-01T00:00:00Z'
	})
	validFrom: string;

	@ApiProperty({
		description: 'End date of validity',
		example: '2024-08-31T23:59:59Z'
	})
	validUntil: string;

	@ApiPropertyOptional({
		description: 'Max redemptions per user',
		example: 3
	})
	maxRedemptionsPerUser: number | null;

	@ApiPropertyOptional({
		description: 'Max assignments per user',
		example: 5
	})
	maxAssignmentsPerUser: number | null;

	@ApiPropertyOptional({
		description: 'Code generation pattern',
		example: 'SUMMER{XXXX}'
	})
	codePattern: string | null;

	@ApiPropertyOptional({
		description: 'Maximum number of codes allowed in this book (null = unlimited for manual uploads)',
		example: 10000
	})
	maxCodes: number | null;

	@ApiProperty({
		description: 'Total number of codes currently in this book',
		example: 8500
	})
	totalCodes: number;

	@ApiProperty({
		description: 'Number of codes currently available',
		example: 8500
	})
	availableCodes: number;

	@ApiProperty({
		description: 'Number of codes assigned',
		example: 1200
	})
	assignedCodes: number;

	@ApiProperty({
		description: 'Number of codes redeemed',
		example: 300
	})
	redeemedCodes: number;

	@ApiPropertyOptional({
		description: 'Custom metadata',
		example: { discountPercent: 20 }
	})
	metadata: Record<string, any> | null;

	@ApiProperty({
		description: 'Creation timestamp',
		example: '2024-06-01T10:00:00Z'
	})
	createdAt: string;

	@ApiProperty({
		description: 'Last update timestamp',
		example: '2024-06-01T10:00:00Z'
	})
	updatedAt: string;
}
