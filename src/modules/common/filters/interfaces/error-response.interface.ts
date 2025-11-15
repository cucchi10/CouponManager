import { ErrorCode } from '@/modules/common/filters';
import { IBaseResponse } from './base-response.interface';

/**
 * Standard error response structure following RFC 7807 problem details.
 * Provides a consistent format for all API error responses.
 */
export interface IErrorResponse extends IBaseResponse {
	/** Indicates that the request was unsuccessful */
	success: false;

	/** Standard HTTP status text (e.g., 'Bad Request', 'Internal Server Error') */
	error: string;

	/** Human-readable error message */
	message: string;

	/** Machine-readable error code (e.g., ErrorCode.VALIDATION_ERROR) */
	code: ErrorCode | string;

	/** Optional detailed error information (e.g., validation errors) */
	details?: Record<string, unknown> | unknown[];
}

/**
 * Internal error body extracted from HttpException
 */
export interface IErrorBody {
	message?: string;
	code?: ErrorCode | string;
	details?: Record<string, unknown> | unknown[];
	[key: string]: unknown;
}
