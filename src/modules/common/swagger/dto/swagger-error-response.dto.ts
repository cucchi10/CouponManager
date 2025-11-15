import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from '@/modules/common/filters';
import { EXAMPLE_CORRELATION_ID, EXAMPLE_JWT_ISSUED_AT, EXAMPLE_METHOD, EXAMPLE_PATH } from '../constants';
import { VALIDATION_ERROR_MESSAGE } from '../../validation';

/**
 * Standardized error response DTO following RFC 7807 problem details.
 * Matches IErrorResponse interface from http-exception.filter.ts
 */
export class ErrorResponseDto {
	@ApiProperty({ example: HttpStatus.BAD_REQUEST, description: 'HTTP status code' })
	statusCode: number;

	@ApiProperty({ default: false, description: 'Indicates that the request was unsuccessful' })
	readonly success = false;

	@ApiProperty({ example: HttpStatus[HttpStatus.BAD_REQUEST], description: 'Standard HTTP status text' })
	error: string;

	@ApiProperty({ example: VALIDATION_ERROR_MESSAGE, description: 'Human-readable error message' })
	message: string;

	@ApiProperty({ enum: ErrorCode, example: ErrorCode.VALIDATION_ERROR, description: 'Machine-readable error code' })
	code: ErrorCode | string;

	@ApiPropertyOptional({
		example: { field: ['error detail'] },
		description: 'Optional detailed error information (e.g., validation errors)'
	})
	details?: Record<string, unknown> | unknown[];

	@ApiProperty({ example: EXAMPLE_PATH, description: 'API endpoint path where the error occurred' })
	path: string;

	@ApiProperty({ example: EXAMPLE_METHOD, description: 'HTTP method used (GET, POST, etc.)' })
	method: string;

	@ApiProperty({ example: EXAMPLE_JWT_ISSUED_AT, description: 'ISO 8601 timestamp when the error occurred' })
	timestamp: string;

	@ApiProperty({
		example: EXAMPLE_CORRELATION_ID,
		description: 'Request tracking ID for debugging'
	})
	correlationId: string;
}
