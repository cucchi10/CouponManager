import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { EnvironmentService } from '@/modules/common/environment/environment.service';
import { EnvKey } from '@/config/environment';

/**
 * Authentication Module (MOCK)
 *
 * This is a basic authentication module with mock implementation.
 * It provides JWT token generation and validation.
 *
 * Features:
 * - JWT token validation
 * - Mock authentication service
 * - Example controller with protected and public endpoints
 * - Ready to extend with real authentication logic
 *
 * Usage:
 * 1. Import this module in your app.module.ts (already done)
 * 2. Use JwtAuthGuard in your controllers
 * 3. Replace mock logic with real authentication
 *
 * Example endpoints:
 * - POST /api/auth/login - Mock login (public)
 * - GET /api/auth/profile - Get user profile (protected)
 * - GET /api/auth/public - Public endpoint (no auth)
 *
 * TODO:
 * - Connect to your user database
 * - Implement real credential validation
 * - Add password hashing (bcrypt)
 * - Add token refresh mechanism
 * - Add blacklist support (optional)
 */
@Module({
	imports: [
		JwtModule.registerAsync({
			inject: [EnvironmentService],
			useFactory: async (env: EnvironmentService) => ({
				secret: env.getOrThrow<string>(EnvKey.JWT_SECRET),
				signOptions: {
					expiresIn: `${env.getOrThrow<number>(EnvKey.JWT_TTL_SEC)}s`
				}
			})
		})
	],
	controllers: [AuthController],
	providers: [AuthService],
	exports: [AuthService]
})
export class AuthModule {}
