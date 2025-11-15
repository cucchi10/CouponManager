import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import { RequestWithCorrelation } from '@/types/express.types';
import { CORRELATION_ID_KEY } from '@/config/app.constants';
import { CorrelationService } from '@/modules/common/correlation/correlation.service';
import { ISuccessResponse, mapStatusToSuccessCode, getSuccessMessage } from '@/modules/common/filters';
import { SKIP_RESPONSE_TRANSFORM_KEY } from '@/decorators';

/**
 * Response Transform Interceptor
 *
 * Transforms successful HTTP responses into a standardized format.
 * Complements the HttpExceptionFilter to provide consistent response structure
 * for both success and error cases.
 *
 * Features:
 * - Standardized success response format
 * - Request tracking with correlationId
 * - Consistent structure with error responses
 * - Preserves original response data
 * Response format:
 * {
 *   statusCode: 200,
 *   success: true,
 *   code: "OK",
 *   data: <original response>,
 *   message: "Request successful",
 *   path: "/api/endpoint",
 *   method: "GET",
 *   timestamp: "2024-11-07T10:30:00.000Z",
 *   correlationId: "uuid"
 * }
 *
 * @example
 * // In app.module.ts providers
 * {
 *   provide: APP_INTERCEPTOR,
 *   useClass: ResponseTransformInterceptor
 * }
 */
@Injectable()
export class ResponseTransformInterceptor<T = unknown> implements NestInterceptor<T, T | ISuccessResponse<T>> {
	constructor(
		private readonly correlation: CorrelationService,
		private readonly reflector: Reflector
	) {}

	intercept(context: ExecutionContext, next: CallHandler<T>): Observable<T | ISuccessResponse<T>> {
		// Check if response transformation should be skipped
		const skipTransform = this.reflector.getAllAndOverride<boolean>(SKIP_RESPONSE_TRANSFORM_KEY, [context.getHandler(), context.getClass()]);

		// If skip flag is set, return data as-is without transformation
		if (skipTransform) {
			return next.handle();
		}

		const ctx = context.switchToHttp();
		const request = ctx.getRequest<RequestWithCorrelation>();
		const response = ctx.getResponse<Response>();

		return next.handle().pipe(
			map((data) => {
				const statusCode = response.statusCode;
				const path = request.url ?? '';
				const method = request.method ?? '';
				const correlationId = this.correlation.getCorrelationId();
				const code = mapStatusToSuccessCode(statusCode);
				const message = getSuccessMessage(statusCode);

				return {
					statusCode,
					success: true,
					code,
					data,
					message,
					path,
					method,
					timestamp: new Date().toISOString(),
					[CORRELATION_ID_KEY]: correlationId
				};
			})
		);
	}
}
