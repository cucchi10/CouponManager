import { Controller, Get, UseGuards, Header, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MonitoringAuthGuard } from '@/guards/monitoring-auth/monitoring-auth.guard';
import { SkipJwt, SkipResponseTransform } from '@/decorators';
import { HealthService } from './health.service';
import { ApiHealthEndpoint } from '@/modules/common/swagger/decorators';
import { HealthResponseDto } from './dto';

/**
 * Health Controller
 *
 * Provides simple health check endpoints for monitoring systems.
 * Protected by monitoring authentication for internal use only.
 *
 * Response Strategy:
 * - Returns standardized JSON with health status and metadata
 * - HTTP 200 when all services are UP
 * - HTTP 503 when any service is DOWN
 * - No wrapper from ResponseTransformInterceptor (uses @SkipResponseTransform)
 *
 * Response structure:
 * {
 *   "status": "UP" | "DOWN",
 *   "statusCode": 200 | 503,
 *   "code": "OK" | "SERVICE_UNAVAILABLE",
 *   "message": "OK" | "Service Unavailable"
 * }
 */
@ApiTags('health')
@Controller('client')
@SkipResponseTransform()
@SkipJwt()
@UseGuards(MonitoringAuthGuard)
export class HealthController {
	constructor(private readonly healthService: HealthService) {}

	/**
	 * Get health status
	 *
	 * Checks the health of the application and external dependencies.
	 * Returns standardized JSON with health status and metadata.
	 *
	 * HTTP status codes:
	 * - 200: All services UP
	 * - 401: Missing or invalid monitoring token
	 * - 403: Valid token but insufficient permissions
	 * - 503: One or more services DOWN
	 *
	 * @returns Health response with status, statusCode, code, and message fields
	 */
	@Get('health')
	@HttpCode(HttpStatus.OK)
	@ApiHealthEndpoint({
		summary: 'Check application and external services health',
		description:
			'Performs a health check against external dependencies to verify service availability and connectivity. This endpoint is designed for monitoring systems and load balancers.',
		responseDto: HealthResponseDto,
		useSuccessWrapper: true
	})
	@Header('Cache-Control', 'no-store')
	async getHealth(): Promise<HealthResponseDto> {
		return this.healthService.getHealth();
	}
}
