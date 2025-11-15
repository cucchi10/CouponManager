/**
 * Standardized error codes for API responses.
 */
export enum ErrorCode {
	/** Validation error */
	VALIDATION_ERROR = 'VALIDATION_ERROR',

	/** Unauthorized error */
	UNAUTHORIZED_ERROR = 'UNAUTHORIZED_ERROR',

	/** Forbidden error */
	FORBIDDEN_ERROR = 'FORBIDDEN_ERROR',

	/** Not found error */
	NOT_FOUND = 'NOT_FOUND',

	/** Conflict error */
	CONFLICT = 'CONFLICT',

	/** Cursor expired error */
	CURSOR_EXPIRED = 'CURSOR_EXPIRED',

	/** Business error */
	BUSINESS_ERROR = 'BUSINESS_ERROR',

	/** Dependency error */
	DEPENDENCY_ERROR = 'DEPENDENCY_ERROR',

	/** Rate limit error */
	RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',

	/** Invalid pagination error */
	INVALID_PAGINATION = 'INVALID_PAGINATION',

	/** Internal error */
	INTERNAL_ERROR = 'INTERNAL_ERROR',

	/** Service unavailable error */
	SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',

	/** Gateway timeout error */
	GATEWAY_TIMEOUT = 'GATEWAY_TIMEOUT',

	/** Generic error */
	ERROR = 'ERROR'
}
