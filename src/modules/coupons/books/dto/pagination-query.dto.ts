import { IsInt, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Query DTO for pagination
 */
export class PaginationQueryDto {
	@ApiPropertyOptional({
		description: 'Page number (1-based)',
		example: 1,
		minimum: 1,
		default: 1
	})
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@IsOptional()
	page?: number = 1;

	@ApiPropertyOptional({
		description: 'Number of items per page',
		example: 20,
		minimum: 1,
		maximum: 100,
		default: 20
	})
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(100)
	@IsOptional()
	limit?: number = 20;
}
