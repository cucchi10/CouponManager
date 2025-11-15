/**
 * Standardized success messages for HTTP status codes.
 * Used by both ResponseTransformInterceptor and Swagger documentation.
 */
export const SuccessMessage = {
	OK: 'Request successful',
	CREATED: 'Resource created successfully',
	ACCEPTED: 'Request accepted for processing',
	NO_CONTENT: 'Request successful',
	RESET_CONTENT: 'Content reset successfully',
	PARTIAL_CONTENT: 'Partial content retrieved',
	DEFAULT_2XX: 'Request successful',
	FALLBACK: 'Request completed successfully'
} as const;
