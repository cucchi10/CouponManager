import { IBaseResponse } from './base-response.interface';

/**
 * Standard success response structure.
 * Provides a consistent format for all API successful responses.
 * Complements IErrorResponse to provide uniform API responses.
 */
export interface ISuccessResponse<T = unknown> extends IBaseResponse {
	/** Indicates that the request was successful */
	success: true;

	/** Machine-readable success code (e.g., 'OK', 'CREATED', 'ACCEPTED') */
	code: string;

	/** Response payload data */
	data: T;

	/** Optional human-readable success message */
	message?: string;
}
