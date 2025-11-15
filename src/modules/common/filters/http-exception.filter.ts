import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Response } from 'express';
import { mapStatusToErrorCode } from './utils/http-status-error.utils';
import { getStatusText, getStatusMessage } from './utils/http-status-text.utils';
import { IErrorBody, IErrorResponse } from './interfaces/error-response.interface';
import { RequestWithCorrelation } from '@/types/express.types';
import { CORRELATION_ID_KEY } from '@/config/app.constants';
import { CorrelationService } from '../correlation/correlation.service';
import { buildExceptionContext } from '../logger';

/**
 * Global exception filter that catches all exceptions and formats them into a consistent error response.
 * Implements RFC 7807 problem details for HTTP APIs.
 *
 * Features:
 * - Standardized error response format
 * - Request tracking with correlationId (provided by CorrelationIdMiddleware)
 * - Automatic error logging for unhandled exceptions
 * - Support for custom HttpException responses
 *
 * @requires CorrelationIdMiddleware - Must be configured before this filter
 *
 * @example
 * // In app.module.ts
 * providers: [
 *   {
 *     provide: APP_FILTER,
 *     useClass: HttpExceptionFilter
 *   }
 * ]
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger(HttpExceptionFilter.name);
	constructor(
		private readonly adapterHost: HttpAdapterHost,
		private readonly correlation: CorrelationService
	) {}

	/**
	 * Extracts error body from HttpException response
	 */
	private extractErrorBody(exception: HttpException, status: number): IErrorBody {
		const resBody = exception.getResponse();

		let body: IErrorBody = {};

		if (typeof resBody === 'string') {
			body = { message: resBody };
		} else if (resBody && typeof resBody === 'object') {
			body = resBody as IErrorBody;
		}

		// Normalize required fields with fallbacks
		return {
			message: body.message ?? getStatusMessage(status),
			code: body.code ?? mapStatusToErrorCode(status),
			...(body.details ? { details: body.details } : {})
		};
	}

	/**
	 * Builds the standardized error response payload
	 */
	private buildErrorResponse(status: number, body: IErrorBody, path: string, method: string, correlationId: string): IErrorResponse {
		return {
			statusCode: status,
			success: false,
			error: getStatusText(status),
			message: body.message ?? getStatusMessage(status),
			code: body.code ?? mapStatusToErrorCode(status),
			...(body.details ? { details: body.details } : {}),
			path,
			method,
			timestamp: new Date().toISOString(),
			[CORRELATION_ID_KEY]: correlationId
		};
	}

	catch(exception: unknown, host: ArgumentsHost): void {
		const { httpAdapter } = this.adapterHost;
		const ctx = host.switchToHttp();

		const req = ctx.getRequest<RequestWithCorrelation>();
		const res = ctx.getResponse<Response>();

		const path = req.url ?? '';
		const method = req.method ?? '';

		// Get correlationId for error response (correlationId, requestId, allyId are automatically added to logs by StructuredLoggerService)
		const correlationId = this.correlation.getCorrelationId();

		let status = HttpStatus.INTERNAL_SERVER_ERROR;
		let body: IErrorBody = {
			message: getStatusMessage(status),
			code: mapStatusToErrorCode(status)
		};

		if (exception instanceof HttpException) {
			status = exception.getStatus();
			body = this.extractErrorBody(exception, status);
		} else {
			// Log unhandled exceptions (non-HTTP exceptions) with structured logger
			this.logger.error(
				`Unhandled exception: ${method} ${path}`,
				exception instanceof Error ? exception : undefined,
				buildExceptionContext(req, status, body.code ?? mapStatusToErrorCode(status))
			);
		}

		const payload = this.buildErrorResponse(status, body, path, method, correlationId);

		httpAdapter.reply(res, payload, status);
	}
}
