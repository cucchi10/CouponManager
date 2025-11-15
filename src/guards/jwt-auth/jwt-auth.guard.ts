import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { CorrelationService } from '@/modules/common/correlation/correlation.service';
import { SKIP_JWT_KEY } from '@/decorators';
import { AuthService } from '@/modules/auth/auth.service';
import { ErrorCode } from '@/modules/common/filters';
import { CacheService } from '@/services/cache/cache.service';
import { AUTH_SCHEME_BEARER } from '@/modules/auth/auth.constants';
import { RequestWithUser } from '@/types/auth.types';

/**
 * JWT Authentication Guard
 *
 * Validates JWT token and extracts ally information.
 * Sets clientId (sub) in CorrelationService for request tracing.
 * Bypasses validation for endpoints marked with @SkipJwt() decorator.
 *
 * Flow:
 * 1. Check if endpoint is marked with @SkipJwt() - skip validation if true
 * 2. Extract JWT token from Authorization header
 * 3. Validate and decode JWT token
 * 4. Check if token is blacklisted (logout/revoked tokens)
 * 5. Extract clientId (sub) from token payload
 * 6. Store clientId (sub) in CorrelationService for logs and metrics
 *
 * @example
 * // In your controller
 * @UseGuards(JwtAuthGuard)
 * @Get('profile')
 * getProfile(@Request() req: RequestWithUser) {
 *   return { userId: req.user.sub };
 * }
 *
 * @example
 * // Bypass JWT validation
 * @SkipJwt()
 * @Get('public-endpoint')
 * publicEndpoint() {
 *   return { message: 'No auth required' };
 * }
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
	private readonly logger: Logger = new Logger(JwtAuthGuard.name);

	constructor(
		private readonly reflector: Reflector,
		private readonly authService: AuthService,
		private readonly correlation: CorrelationService,
		private readonly cacheService: CacheService
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		// Check if endpoint is marked to skip JWT
		const skipJwt = this.reflector.getAllAndOverride<boolean>(SKIP_JWT_KEY, [context.getHandler(), context.getClass()]);

		if (skipJwt) {
			return true;
		}

		const request = context.switchToHttp().getRequest<RequestWithUser>();
		const token = this.extractToken(request);
		const payload = await this.authService.verifyJwtToken(token);

		await this.checkBlacklist(payload.jti);
		this.logger.log(`JWT token validated for clientId=${payload.sub} | path=${request.path} method=${request.method}`);

		// Store clientId as allyId in context for logs and metrics
		this.correlation.setAllyId(payload.sub);
		request.user = payload;

		return true;
	}

	/**
	 * Extracts the JWT token from the Authorization header.
	 *
	 * Ensures the header exists and starts with the `Bearer ` prefix.
	 * If not, throws an `UnauthorizedException` with a standardized error code.
	 *
	 * @param request - HTTP Request object (Express)
	 * @throws {UnauthorizedException} If the header is missing or incorrectly formatted
	 * @returns The JWT token string (without the `Bearer ` prefix)
	 */
	private extractToken(request: Request): string {
		const { headers, path, method } = request;
		const authHeader = headers.authorization;

		if (!authHeader) {
			this.logger.warn(`Authorization header is missing | path=${path} method=${method}`);
			throw new UnauthorizedException({
				message: 'Authorization header is missing',
				code: ErrorCode.UNAUTHORIZED_ERROR
			});
		}

		const [scheme, token] = authHeader.trim().split(/\s+/);

		if (scheme?.toLowerCase() !== AUTH_SCHEME_BEARER || !token) {
			this.logger.warn(`Malformed Authorization header | raw=${authHeader} | path=${path} method=${method}`);
			throw new UnauthorizedException({
				message: 'Token is required',
				code: ErrorCode.UNAUTHORIZED_ERROR
			});
		}

		return token;
	}

	/**
	 * Checks whether the provided token (by its `jti` claim) is blacklisted.
	 *
	 * @param jti - Unique token identifier (JWT ID claim)
	 * @throws {UnauthorizedException} If the token is found in the blacklist
	 */
	private async checkBlacklist(jti: string): Promise<void> {
		const isBlacklisted = await this.cacheService.isJwtBlacklisted(jti);

		if (isBlacklisted) {
			this.logger.warn(`Rejected blacklisted JWT | jti=${jti}`);
			throw new UnauthorizedException({
				message: 'Invalid token',
				code: ErrorCode.UNAUTHORIZED_ERROR
			});
		}
	}
}
