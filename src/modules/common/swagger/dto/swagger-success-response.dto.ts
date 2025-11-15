import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';
import { EXAMPLE_CORRELATION_ID, EXAMPLE_JWT_ISSUED_AT, EXAMPLE_METHOD, EXAMPLE_PATH } from '../constants';

/**
 * Generic standardized success response DTO.
 * Matches ISuccessResponse interface from ResponseTransformInterceptor.
 *
 * This DTO documents the wrapper structure that the ResponseTransformInterceptor
 * applies to all successful responses.
 *
 * @template T The type of the data payload
 */
export class SuccessResponseDto<T = unknown> {
	@ApiProperty({ example: HttpStatus.OK, description: 'HTTP status code' })
	statusCode: number;

	@ApiProperty({ default: true, description: 'Indicates that the request was successful' })
	readonly success = true;

	@ApiProperty({ example: 'OK', description: 'Machine-readable success code (e.g., OK, CREATED, ACCEPTED)' })
	code: string;

	@ApiProperty({ description: 'Response payload data' })
	data: T;

	@ApiPropertyOptional({ example: 'Request successful', description: 'Optional human-readable success message' })
	message?: string;

	@ApiProperty({ example: EXAMPLE_PATH, description: 'API endpoint path' })
	path: string;

	@ApiProperty({ example: EXAMPLE_METHOD, description: 'HTTP method used (GET, POST, etc.)' })
	method: string;

	@ApiProperty({ example: EXAMPLE_JWT_ISSUED_AT, description: 'ISO 8601 timestamp when the response was generated' })
	timestamp: string;

	@ApiProperty({
		example: EXAMPLE_CORRELATION_ID,
		description: 'Request tracking ID for debugging'
	})
	correlationId: string;
}
