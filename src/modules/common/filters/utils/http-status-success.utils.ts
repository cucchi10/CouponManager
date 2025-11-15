import { HttpStatus } from '@nestjs/common';
import { SuccessMessage } from '../constants/success-messages.constants';

/**
 * Maps HTTP success status codes to standardized success code strings.
 * Uses HttpStatus enum names directly.
 *
 * @param status - HTTP status code number
 * @returns Standardized success code string (e.g., 'OK', 'CREATED', 'ACCEPTED')
 *
 * @example
 * mapStatusToSuccessCode(200) // Returns 'OK'
 * mapStatusToSuccessCode(201) // Returns 'CREATED'
 * mapStatusToSuccessCode(204) // Returns 'NO_CONTENT'
 */
export function mapStatusToSuccessCode(status: number): string {
	return HttpStatus[status] ?? HttpStatus[HttpStatus.OK];
}

/**
 * Gets a human-readable success message for a given status code.
 * Uses SuccessMessage enum for consistency across the application.
 *
 * @param status - HTTP status code number
 * @returns Human-readable success message
 *
 * @example
 * getSuccessMessage(200) // Returns 'Request successful'
 * getSuccessMessage(201) // Returns 'Resource created successfully'
 */
export function getSuccessMessage(status: number): string {
	switch (status) {
		case HttpStatus.OK:
			return SuccessMessage.OK;
		case HttpStatus.CREATED:
			return SuccessMessage.CREATED;
		case HttpStatus.ACCEPTED:
			return SuccessMessage.ACCEPTED;
		case HttpStatus.NO_CONTENT:
			return SuccessMessage.NO_CONTENT;
		case HttpStatus.RESET_CONTENT:
			return SuccessMessage.RESET_CONTENT;
		case HttpStatus.PARTIAL_CONTENT:
			return SuccessMessage.PARTIAL_CONTENT;
		default:
			if (status >= 200 && status < 300) {
				return SuccessMessage.DEFAULT_2XX;
			}

			return SuccessMessage.FALLBACK;
	}
}
