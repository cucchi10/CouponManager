import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
	InternalServerErrorException,
	Logger,
	UnauthorizedException
} from '@nestjs/common';
import { Request } from 'express';
import { CorrelationService } from '@/modules/common/correlation/correlation.service';
import { API_KEY_HEADER } from '@/config/app.constants';
import { EnvironmentService } from '@/modules/common/environment/environment.service';
import { EnvKey } from '@/config/environment';
import { ErrorCode } from '@/modules/common/filters';
import { safeEqual } from '@/modules/common/security';

/**
 * API Key Guard
 *
 * Validates API key from request headers.
 * Optionally extracts client/ally information from request body for tracing.
 *
 * Flow:
 * 1. Extract clientId from request body and store as allyId in CorrelationService (if present)
 * 2. Extract and validate API key from X-API-KEY header
 * 3. Perform constant-time comparison for security
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
	private readonly logger: Logger = new Logger(ApiKeyGuard.name);

	constructor(
		private readonly correlation: CorrelationService,
		private readonly env: EnvironmentService
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const { body, headers, path, method } = context.switchToHttp().getRequest<Request>();

		if (body?.clientId) {
			// Store clientId as allyId in context for logs and metrics
			this.correlation.setAllyId(body.clientId);
		}

		const apiKey = headers[API_KEY_HEADER];

		// Validate API key presence
		if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
			this.logger.warn(`Missing API key header | path=${path} method=${method}`);
			throw new UnauthorizedException({ message: 'API key is required', code: ErrorCode.UNAUTHORIZED_ERROR });
		}

		const isValid = await this.isValidApiKey(apiKey);

		if (!isValid) {
			this.logger.warn(`Invalid API key provided | path=${path} method=${method} allyId=${body?.clientId}`);
			throw new ForbiddenException({ message: 'Invalid API key', code: ErrorCode.FORBIDDEN_ERROR });
		}

		return true;
	}

	/**
	 * Checks whether the provided API key is valid using constant-time comparison.
	 *
	 * @param apiKey - The API key extracted from the request header.
	 * @returns Promise<boolean> - `true` if the API key is valid, otherwise `false`.
	 */
	private async isValidApiKey(apiKey: string): Promise<boolean> {
		const [expectedApiKey, compareSecret] = await Promise.all([this.getApiKey(), this.getCompareSecret()]);

		return safeEqual(expectedApiKey, apiKey, compareSecret);
	}

	/**
	 * Retrieves the API key.
	 * - Local: reads from API_KEY env var directly
	 * - Production: fetches from SECRET_NAME_APP and extracts API_KEY
	 *
	 * @return {Promise<string>} The API key string.
	 */
	private async getApiKey(): Promise<string> {
		if (this.env.isLocal()) {
			return this.env.getOrThrow<string>(EnvKey.API_KEY);
		}

		const secretName = this.env.getOrThrow<string>(EnvKey.SECRET_NAME_APP);
		const secret = await this.env.getSecretValueOrThrow<Record<string, string>>(secretName);
		const apiKey = secret[EnvKey.API_KEY];

		if (!apiKey) {
			// Log full details server-side only
			this.logger.error(`API key configuration error: ${EnvKey.API_KEY} is missing from secret ${secretName}`);

			// Return generic error to client (no sensitive info)
			throw new InternalServerErrorException({
				message: 'API key configuration error',
				code: ErrorCode.INTERNAL_ERROR
			});
		}

		return apiKey;
	}

	/**
	 * Retrieves the secret used for constant-time comparison in safeEqual.
	 * - Local: reads from TOKEN_COMPARE_SECRET env var directly
	 * - Production: fetches from SECRET_NAME_APP and extracts TOKEN_COMPARE_SECRET
	 *
	 * @return {Promise<string>} The comparison secret string.
	 */
	private async getCompareSecret(): Promise<string> {
		if (this.env.isLocal()) {
			return this.env.getOrThrow<string>(EnvKey.TOKEN_COMPARE_SECRET);
		}

		const secretName = this.env.getOrThrow<string>(EnvKey.SECRET_NAME_APP);
		const secret = await this.env.getSecretValueOrThrow<Record<string, string>>(secretName);
		const compareSecret = secret[EnvKey.TOKEN_COMPARE_SECRET];

		if (!compareSecret) {
			// Log full details server-side only
			this.logger.error(`Comparison secret configuration error: ${EnvKey.TOKEN_COMPARE_SECRET} is missing from secret ${secretName}`);

			// Return generic error to client (no sensitive info)
			throw new InternalServerErrorException({
				message: 'Security configuration error',
				code: ErrorCode.INTERNAL_ERROR
			});
		}

		return compareSecret;
	}
}
