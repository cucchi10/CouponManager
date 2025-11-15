import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

/**
 * Decorator to add pagination query parameters to Swagger documentation
 *
 * Adds both `page` and `limit` query parameters with their descriptions.
 * Use this decorator on paginated endpoints to document pagination parameters.
 *
 * @example
 * @Get()
 * @ApiPaginationQuery()
 * async getItems(@Query() query: PaginationQueryDto) {}
 */
export function ApiPaginationQuery() {
	return applyDecorators(
		ApiQuery({
			name: 'page',
			required: false,
			type: Number,
			description: 'Page number (1-based)',
			example: 1
		}),
		ApiQuery({
			name: 'limit',
			required: false,
			type: Number,
			description: 'Number of items per page (max 100)',
			example: 20
		})
	);
}
