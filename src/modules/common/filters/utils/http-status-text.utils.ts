import { HttpStatus } from '@nestjs/common';
import { STATUS_CODES } from 'http';

/**
 * Gets the HTTP status code name in constant format (uppercase with underscores).
 *
 * @param status - HTTP status code number
 * @returns Status code name in constant format
 *
 * @example
 * getStatusText(400) // Returns 'BAD_REQUEST'
 * getStatusText(500) // Returns 'INTERNAL_SERVER_ERROR'
 * getStatusText(999) // Returns 'INTERNAL_SERVER_ERROR' (fallback)
 */
export function getStatusText(status: number): string {
	return HttpStatus[status] ?? HttpStatus[HttpStatus.INTERNAL_SERVER_ERROR];
}

/**
 * Gets the human-readable HTTP status message for a given status code.
 *
 * @param status - HTTP status code number
 * @returns Human-readable status message
 *
 * @example
 * getStatusMessage(400) // Returns 'Bad Request'
 * getStatusMessage(500) // Returns 'Internal Server Error'
 * getStatusMessage(999) // Returns 'Internal Server Error' (fallback)
 */
export function getStatusMessage(status: number): string {
	return STATUS_CODES[status] ?? STATUS_CODES[HttpStatus.INTERNAL_SERVER_ERROR]!;
}
