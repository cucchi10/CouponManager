import { CanActivate, ExecutionContext, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { EnvironmentService } from '@/modules/common/environment/environment.service';
import { EnvKey } from '@/config/environment';
import { ErrorCode } from '@/modules/common/filters/constants/error-codes.constants';
import { MONITORING_TOKEN_HEADER } from '@/config/app.constants';
import { safeEqual } from '@/modules/common/security';

/**
 * Monitoring Authentication Guard
 *
 * Validates monitoring token for internal services and monitoring endpoints.
 * Uses X-Monitoring-Token custom header for authentication.
 *
 * Security features:
 * - Uses timingSafeEqual to prevent timing attacks
 * - Bypasses validation for endpoints marked with @SkipJwt() decorator
 * ```
 */
@Injectable()
export class MonitoringAuthGuard implements CanActivate {
	private readonly logger: Logger = new Logger(MonitoringAuthGuard.name);

	constructor(private readonly env: EnvironmentService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<Request>();

		// Extract token from headers
		const token = this.extractToken(request);

		if (!token) {
			throw new UnauthorizedException({
				message: 'Monitoring token is required',
				code: ErrorCode.UNAUTHORIZED_ERROR
			});
		}

		// Validate token against configured value
		const isValid = await this.validateToken(token);

		if (!isValid) {
			throw new UnauthorizedException({
				message: 'Invalid monitoring token',
				code: ErrorCode.UNAUTHORIZED_ERROR
			});
		}

		return true;
	}

	/**
	 * Extracts monitoring token from request headers
	 * Uses X-Monitoring-Token custom header
	 *
	 * @param request - HTTP request object
	 * @returns Extracted token or empty string if not found
	 */
	private extractToken(request: Request): string {
		const token = request.headers[MONITORING_TOKEN_HEADER] as string;

		if (token) {
			return token;
		}

		return '';
	}

	/**
	 * Validates token using timing-safe comparison
	 * Prevents timing attacks by using constant-time comparison
	 *
	 * @param receivedToken - Token received from request
	 * @returns true if token is valid, false otherwise
	 */
	private async validateToken(receivedToken: string): Promise<boolean> {
		const [expectedToken, compareSecret] = await Promise.all([this.getMonitoringToken(), this.getCompareSecret()]);

		return safeEqual(expectedToken, receivedToken, compareSecret);
	}

	/**
	 * Retrieves the monitoring token based on the environment configuration.
	 *
	 * If running in a local environment, it returns the secret name directly.
	 * Otherwise, it would fetch the secret value from the environment.
	 *
	 * @returns The monitoring token string
	 */
	private async getMonitoringToken(): Promise<string> {
		if (this.env.isLocal()) {
			return this.env.getOrThrow<string>(EnvKey.MONITORING_TOKEN);
		}

		const secretName = this.env.getOrThrow<string>(EnvKey.SECRET_NAME_APP);
		const secret = await this.env.getSecretValueOrThrow<Record<string, string>>(secretName);
		const monitoringToken = secret[EnvKey.MONITORING_TOKEN];

		if (!monitoringToken) {
			// Log full details server-side only
			this.logger.error(`Monitoring token configuration error: ${EnvKey.MONITORING_TOKEN} is missing from secret ${secretName}`);

			// Return generic error to client (no sensitive info)
			throw new InternalServerErrorException({
				message: 'API key configuration error',
				code: ErrorCode.INTERNAL_ERROR
			});
		}

		return monitoringToken;
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
