import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '@/modules/common/filters';
import { IExceptionPayload } from './interfaces/exception-payload.interface';

/**
 * Custom exception representing a business logic or orchestration rule violation
 * within the ESB layer.
 *
 * This exception should be thrown when a request cannot be processed due to
 * a predictable business rule or flow inconsistency within the ESB middleware,
 * rather than a technical or validation error.
 *
 * Typical scenarios include:
 * - Reference or transaction outside of the allowed processing window
 * - Account or identifier mismatch between systems
 *
 * The {@link HttpExceptionFilter} automatically formats this into a standardized
 * RFC 7807 error response with:
 *  - HTTP status: 422 (Unprocessable Entity)
 *  - error code: {@link ErrorCode.BUSINESS_ERROR}
 */
export class BusinessException extends HttpException {
	constructor({ message, details }: IExceptionPayload) {
		super(
			{
				message,
				code: ErrorCode.BUSINESS_ERROR,
				...(details ? { details } : {})
			},
			HttpStatus.UNPROCESSABLE_ENTITY
		);
	}
}
