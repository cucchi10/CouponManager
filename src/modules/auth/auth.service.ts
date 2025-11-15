import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IJwtPayload } from './interfaces/jwt.interface';
import { ErrorCode } from '@/modules/common/filters';

/**
 * Authentication Service (MOCK)
 *
 * This is a mock/placeholder service for JWT validation.
 * Replace the mock logic with your real authentication logic.
 *
 * Features:
 * - JWT token validation
 * - Token payload extraction
 * - Error handling with standardized codes
 *
 * TODO: Implement real authentication logic:
 * - Connect to your user database
 * - Validate user credentials
 * - Generate real JWT tokens
 * - Implement token refresh logic
 */
@Injectable()
export class AuthService {
	private readonly logger = new Logger(AuthService.name);

	constructor(private readonly jwtService: JwtService) {}

	/**
	 * Verifies and decodes a JWT token
	 *
	 * @param token - JWT token string
	 * @returns Decoded JWT payload
	 * @throws UnauthorizedException if token is invalid or expired
	 */
	async verifyJwtToken(token: string): Promise<IJwtPayload> {
		try {
			const payload = await this.jwtService.verifyAsync<IJwtPayload>(token);

			// MOCK: Additional validation can go here
			// For example:
			// - Check if user exists in database
			// - Check if user is active
			// - Check if token has required permissions

			return payload;
		} catch (error) {
			this.logger.warn(`JWT validation failed: ${(error as Error).message}`);

			// Determine the specific error type
			if (error instanceof Error) {
				if (error.message.includes('expired')) {
					throw new UnauthorizedException({
						message: 'Token has expired',
						code: ErrorCode.UNAUTHORIZED_ERROR
					});
				}

				if (error.message.includes('invalid')) {
					throw new UnauthorizedException({
						message: 'Invalid token',
						code: ErrorCode.UNAUTHORIZED_ERROR
					});
				}
			}

			// Generic error for any other case
			throw new UnauthorizedException({
				message: 'Token validation failed',
				code: ErrorCode.UNAUTHORIZED_ERROR
			});
		}
	}

	/**
	 * MOCK: Generate a JWT token
	 *
	 * This is a placeholder for token generation.
	 * Replace with your real implementation.
	 *
	 * @param payload - Data to encode in the token
	 * @returns JWT token string
	 */
	async generateToken(payload: Partial<IJwtPayload>): Promise<string> {
		// MOCK: In a real implementation, you would:
		// 1. Validate the user credentials
		// 2. Generate a unique jti (JWT ID)
		// 3. Add any custom claims
		// 4. Sign the token with proper expiration

		const jti = this.generateJti();
		const fullPayload = {
			sub: payload.sub || 'mock-user-id',
			jti
			// Note: iat and exp are automatically added by JwtService based on module configuration
		};

		return this.jwtService.signAsync(fullPayload);
	}

	/**
	 * MOCK: Generate a unique JWT ID
	 *
	 * @returns Unique identifier string
	 */
	private generateJti(): string {
		// MOCK: Use UUID or your preferred unique ID generator
		return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
	}

	/**
	 * MOCK: Validate user credentials
	 *
	 * This is a placeholder for credential validation.
	 * Replace with your real implementation.
	 *
	 * @param username - User's username or email
	 * @param password - User's password
	 * @returns True if credentials are valid
	 */
	async validateCredentials(username: string, password: string): Promise<boolean> {
		// MOCK: In a real implementation:
		// 1. Query your database for the user
		// 2. Compare password hash using bcrypt or similar
		// 3. Return true only if credentials match

		this.logger.warn('Using MOCK credential validation - replace with real implementation');

		// Mock validation (DO NOT USE IN PRODUCTION)
		return username === 'demo' && password === 'demo123';
	}
}
