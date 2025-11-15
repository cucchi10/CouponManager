/**
 * Common interface for all custom exception payloads.
 * Ensures a consistent structure across all ESB-level exceptions.
 */
export interface IExceptionPayload {
	/** Human-readable message describing the error */
	message: string;

	/** Optional additional structured details (context, metadata, etc.) */
	details?: Record<string, unknown> | unknown[];
}
