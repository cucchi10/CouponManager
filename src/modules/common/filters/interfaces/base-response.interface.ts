import { CORRELATION_ID_KEY } from '@/config/app.constants';

/**
 * Base response structure for all API responses.
 * Contains common fields shared by both success and error responses.
 */
export interface IBaseResponse {
	/** HTTP status code */
	statusCode: number;

	/** Indicates whether the request was successful */
	success: boolean;

	/** API endpoint path where the request was made */
	path: string;

	/** HTTP method used (GET, POST, etc.) */
	method: string;

	/** ISO 8601 timestamp when the response was generated */
	timestamp: string;

	/** Request tracking ID for debugging */
	[CORRELATION_ID_KEY]: string;
}
