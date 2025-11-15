import { HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse, isAxiosError } from 'axios';
import { HealthStatus } from './constants';
import { getStatusMessage, mapStatusToErrorCode, mapStatusToSuccessCode } from '../common/filters';
import { HealthResponseDto } from './dto';

/**
 * Health Service
 *
 * Provides health check functionality for external API dependencies.
 * Monitors external services to ensure availability.
 *
 * Health Check Logic:
 * - UP: HTTP 2xx (successful) or 401/403 (server alive but requires auth)
 * - DOWN: HTTP 5xx, 4xx (except 401/403), timeouts, or network errors
 */
@Injectable()
export class HealthService {
	constructor(private readonly http: HttpService) {}

	/**
	 * Checks the health of external API dependencies
	 *
	 * @returns True if the external API is healthy, false otherwise
	 */
	async checkExternal(): Promise<boolean> {
		try {
			// Configuration (timeout, validateStatus, etc.) comes from HttpModule setup
			await firstValueFrom(this.http.get('/'));

			return true;
		} catch (error: unknown) {
			if (!isAxiosError(error)) {
				return false;
			}

			if (!error.response) {
				return false;
			}

			const { status } = error.response as AxiosResponse;

			if (status === HttpStatus.UNAUTHORIZED || status === HttpStatus.FORBIDDEN) {
				return true;
			}

			return false;
		}
	}

	/**
	 * Gets the health of the application
	 *
	 * Checks the health of external dependencies and returns a standardized response.
	 *
	 * @returns Health response with status
	 */
	async getHealth(): Promise<HealthResponseDto> {
		const isHealthy = await this.checkExternal();

		// If service is degraded, return HealthResponseDto with DOWN status and 503 code
		if (!isHealthy) {
			const statusCode = HttpStatus.SERVICE_UNAVAILABLE;

			return {
				code: mapStatusToErrorCode(statusCode),
				statusCode: HttpStatus.SERVICE_UNAVAILABLE,
				message: getStatusMessage(statusCode),
				status: HealthStatus.DOWN
			};
		}

		const statusCode = HttpStatus.OK;

		return {
			code: mapStatusToSuccessCode(statusCode),
			statusCode: HttpStatus.OK,
			message: getStatusMessage(statusCode),
			status: HealthStatus.UP
		};
	}
}
