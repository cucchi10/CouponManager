import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key for skipping JWT authentication
 */
export const SKIP_JWT_KEY = 'skipJwt';

/**
 * SkipJwt Decorator
 *
 * Marks an endpoint to skip JWT authentication guard.
 * Use this decorator on controllers or individual routes that should be accessible without JWT token.
 * Note: This only skips JWT validation. Other guards (ApiKey, Monitoring) will still apply.
 *
 * @example
 * ```typescript
 * @Controller('auth')
 * export class AuthController {
 *   @Post('login')
 *   @SkipJwt() // Login endpoint doesn't need JWT
 *   login(@Body() dto: LoginDto) {
 *     return this.authService.login(dto);
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * @Controller('webhooks')
 * @UseGuards(JwtAuthGuard) // JWT required by default
 * export class WebhooksController {
 *   @Post('notifications')
 *   @SkipJwt() // But this endpoint skips JWT
 *   handleNotification(@Body() dto: NotificationDto) {
 *     return this.service.process(dto);
 *   }
 * }
 * ```
 */
export const SkipJwt = () => SetMetadata(SKIP_JWT_KEY, true);
