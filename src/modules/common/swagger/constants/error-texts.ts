import { STATUS_CODES } from 'http';
import { HttpStatus } from '@nestjs/common';
import { VALIDATION_ERROR_MESSAGE } from '../../validation';

export type HttpStatusLiteral = 400 | 401 | 403 | 409 | 410 | 422 | 424 | 500 | 503 | 504;

export const ERROR_DESCRIPTIONS: Record<HttpStatusLiteral, string> = {
	400: VALIDATION_ERROR_MESSAGE,
	401: 'Invalid or expired token',
	403: 'Invalid or unauthorized API key',
	409: STATUS_CODES[HttpStatus.CONFLICT]!,
	410: 'Expired cursor: restart from page = 1',
	422: 'Invalid pagination: page > 1 without previous cursor or page skipping',
	424: 'External service dependency failed',
	500: STATUS_CODES[HttpStatus.INTERNAL_SERVER_ERROR]!,
	503: 'Service unavailable (circuit breaker open / provider down)',
	504: 'Timeout to dependency after retries'
} as const;
