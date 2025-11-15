import { ApiProperty } from '@nestjs/swagger';

/**
 * Pagination metadata
 */
export class PaginationMetaDto {
	@ApiProperty({
		description: 'Current page number (1-based)',
		example: 1
	})
	page: number;

	@ApiProperty({
		description: 'Number of items per page',
		example: 20
	})
	limit: number;

	@ApiProperty({
		description: 'Total number of items',
		example: 100
	})
	total: number;

	@ApiProperty({
		description: 'Total number of pages',
		example: 5
	})
	totalPages: number;

	@ApiProperty({
		description: 'Whether there is a next page',
		example: true
	})
	hasNextPage: boolean;

	@ApiProperty({
		description: 'Whether there is a previous page',
		example: false
	})
	hasPrevPage: boolean;
}
