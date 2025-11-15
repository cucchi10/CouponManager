import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import {
	buildRequestErrorContext,
	buildRequestStartContext,
	buildRequestSuccessContext,
	formatRequestMessage,
	StructuredLoggerService
} from '@/modules/common/logger';

/**
 * Observability Interceptor
 *
 * Automatically captures logs for every HTTP request using standardized logging utilities.
 *
 * Features:
 * - Logs request start and completion with structured context
 * - Captures latency in milliseconds
 * - Uses standardized logging functions for consistency
 * - Enriches logs with context from CorrelationService (CLS)
 * - Works transparently across all controllers
 *
 * @example
 * // In app.module.ts providers
 * {
 *   provide: APP_INTERCEPTOR,
 *   useClass: ObservabilityInterceptor
 * }
 */
@Injectable()
export class ObservabilityInterceptor implements NestInterceptor {
	constructor(private readonly logger: StructuredLoggerService) {
		this.logger.setContext(ObservabilityInterceptor.name);
	}

	intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
		const ctx = context.switchToHttp();
		const request = ctx.getRequest<Request>();
		const response = ctx.getResponse<Response>();

		const startTime = Date.now();
		const { method, path } = request;

		// Log request start using standardized function
		this.logger.info(formatRequestMessage('incoming', method, path), buildRequestStartContext(request));

		return next.handle().pipe(
			tap(() => {
				// Request succeeded
				const latencyMs = Date.now() - startTime;

				// Log success using standardized function
				this.logger.info(formatRequestMessage('completed', method, path), buildRequestSuccessContext(request, response, latencyMs));
			}),
			catchError((error) => {
				// Request failed
				const latencyMs = Date.now() - startTime;

				// Log error using standardized function
				this.logger.error(formatRequestMessage('failed', method, path), error, buildRequestErrorContext(request, error, latencyMs));

				// Re-throw the error
				return throwError(() => error);
			})
		);
	}
}
