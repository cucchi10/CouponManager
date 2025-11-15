import { HttpStatus, Injectable } from '@nestjs/common';
import { HttpModuleOptions, HttpModuleOptionsFactory } from '@nestjs/axios';
import * as http from 'http';
import * as https from 'https';

@Injectable()
export class HealthHttpConfigService implements HttpModuleOptionsFactory {
	private readonly baseURL: string;
	private readonly timeout: number;
	private readonly httpAgent: http.Agent;
	private readonly httpsAgent: https.Agent;

	constructor() {
		// Configure your external service URL and timeout here
		// For example: this.baseURL = this.env.getOrThrow<string>(EnvKey.EXTERNAL_SERVICE_URL);
		this.baseURL = 'http://localhost:3000'; // Default placeholder
		this.timeout = 5000; // 5 seconds default timeout
		this.httpAgent = new http.Agent({ keepAlive: true });
		this.httpsAgent = new https.Agent({ keepAlive: true });
	}

	/**
	 * Validates if an HTTP status code should be considered successful for health checks.
	 *
	 * @param status - HTTP status code
	 * @returns True if status indicates service is healthy (2xx, 401, or 403)
	 *
	 * @remarks
	 * - 2xx: Successful response
	 * - 401/403: Authentication errors indicate server is alive but requires auth
	 */
	private validateStatus(status: number): boolean {
		const isSuccessful = status >= HttpStatus.OK && status < HttpStatus.AMBIGUOUS;
		const isUnauthorizedError = status === HttpStatus.UNAUTHORIZED;
		const isForbiddenError = status === HttpStatus.FORBIDDEN;

		return isSuccessful || isUnauthorizedError || isForbiddenError;
	}

	createHttpOptions(): HttpModuleOptions {
		return {
			baseURL: this.baseURL,
			timeout: this.timeout,
			maxRedirects: 2,
			validateStatus: (status) => this.validateStatus(status),
			httpAgent: this.httpAgent,
			httpsAgent: this.httpsAgent,
			headers: { 'User-Agent': 'health-check/1.0' }
		};
	}
}
