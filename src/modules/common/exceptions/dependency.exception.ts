import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '@/modules/common/filters';
import { IExceptionPayload } from './interfaces/exception-payload.interface';

/**
 * Custom exception representing a dependency or external service failure.
 *
 * This exception should be thrown when a dependent system or external API
 * fails to respond successfully after one or more retry attempts.
 *
 * Typical scenarios include:
 * - External service did not respond after multiple retry attempts
 * - Downstream service temporarily unavailable
 *
 * The {@link HttpExceptionFilter} automatically transforms this into a standardized
 * RFC 7807–compliant error response with:
 *  - HTTP status: 424 (Failed Dependency)
 *  - error code: {@link ErrorCode.DEPENDENCY_ERROR}
 */
export class DependencyException extends HttpException {
	constructor({ message, details }: IExceptionPayload) {
		super(
			{
				message,
				code: ErrorCode.DEPENDENCY_ERROR,
				...(details ? { details } : {})
			},
			HttpStatus.FAILED_DEPENDENCY
		);
	}
}
