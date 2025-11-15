import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from '@/modules/common/filters';

/**
 * Maps HTTP error status codes to standardized error code strings.
 *
 * @param status - HTTP status code number
 * @returns Standardized error code from ErrorCode enum
 *
 * @example
 * mapStatusToErrorCode(400) // Returns ErrorCode.VALIDATION_ERROR
 * mapStatusToErrorCode(500) // Returns ErrorCode.INTERNAL_ERROR
 */
export function mapStatusToErrorCode(status: number): ErrorCode {
	switch (status) {
		case HttpStatus.BAD_REQUEST:
			return ErrorCode.VALIDATION_ERROR;
		case HttpStatus.UNAUTHORIZED:
			return ErrorCode.UNAUTHORIZED_ERROR;
		case HttpStatus.FORBIDDEN:
			return ErrorCode.FORBIDDEN_ERROR;
		case HttpStatus.NOT_FOUND:
			return ErrorCode.NOT_FOUND;
		case HttpStatus.CONFLICT:
			return ErrorCode.CONFLICT;
		case HttpStatus.GONE:
			return ErrorCode.CURSOR_EXPIRED;
		case HttpStatus.UNPROCESSABLE_ENTITY:
			return ErrorCode.BUSINESS_ERROR;
		case HttpStatus.FAILED_DEPENDENCY:
			return ErrorCode.DEPENDENCY_ERROR;
		case HttpStatus.TOO_MANY_REQUESTS:
			return ErrorCode.RATE_LIMIT_ERROR;
		case HttpStatus.INTERNAL_SERVER_ERROR:
			return ErrorCode.INTERNAL_ERROR;
		case HttpStatus.SERVICE_UNAVAILABLE:
			return ErrorCode.SERVICE_UNAVAILABLE;
		case HttpStatus.GATEWAY_TIMEOUT:
			return ErrorCode.GATEWAY_TIMEOUT;
		default:
			if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
				return ErrorCode.INTERNAL_ERROR;
			}

			return ErrorCode.ERROR;
	}
}
