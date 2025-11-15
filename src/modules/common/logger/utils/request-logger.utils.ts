import { Request, Response } from 'express';
import { HttpStatus } from '@nestjs/common';
import { IBaseLogContext } from '@/modules/common/logger';
import { ErrorCode } from '../../filters';

/**
 * Build base log context with common fields
 *
 * Note: correlationId, requestId, and allyId are automatically added by StructuredLoggerService.getEnrichedContext()
 * so they don't need to be included here.
 *
 * @param request - Express request object
 * @returns Base log context object
 */
function buildBaseContext(request: Request): IBaseLogContext {
	return {
		endpoint: request.path,
		httpMethod: request.method
	};
}

/**
 * Build structured log context for incoming requests
 *
 * @param request - Express request object
 * @returns Structured log context object
 */
export function buildRequestStartContext(request: Request): IBaseLogContext {
	return buildBaseContext(request);
}

/**
 * Build structured log context for completed requests
 *
 * @param request - Express request object
 * @param response - Express response object
 * @param latencyMs - Request duration in milliseconds
 * @returns Structured log context object
 */
export function buildRequestSuccessContext(request: Request, response: Response, latencyMs: number): IBaseLogContext {
	return {
		...buildBaseContext(request),
		httpStatus: response.statusCode,
		latencyMs,
		result: 'success'
	};
}

/**
 * Build structured log context for failed requests
 *
 * @param request - Express request object
 * @param error - Error object
 * @param latencyMs - Request duration in milliseconds
 * @returns Structured log context object
 */
export function buildRequestErrorContext(request: Request, error: { status?: number; code?: string }, latencyMs: number): IBaseLogContext {
	return {
		...buildBaseContext(request),
		httpStatus: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
		latencyMs,
		result: 'error',
		errorCode: error.code || ErrorCode.INTERNAL_ERROR
	};
}

/**
 * Build structured log context for exception filter
 *
 * @param request - Express request object
 * @param status - HTTP status code
 * @param errorCode - Error code
 * @returns Structured log context object
 */
export function buildExceptionContext(request: Request, status: number, errorCode: string): IBaseLogContext {
	return {
		...buildBaseContext(request),
		httpStatus: status,
		result: 'error',
		errorCode
	};
}

const phaseLabels = {
	incoming: 'Incoming request',
	completed: 'Request completed',
	failed: 'Request failed'
};

/**
 * Format request log message
 *
 * @param phase - Request phase (incoming, completed, failed)
 * @param method - HTTP method
 * @param path - Request path
 * @returns Formatted log message
 */
export function formatRequestMessage(phase: 'incoming' | 'completed' | 'failed', method: string, path: string): string {
	const label = phaseLabels[phase];

	if (!label) {
		return `Unknown phase (${phase}): ${method} ${path}`;
	}

	return `${label}: ${method} ${path}`;
}
