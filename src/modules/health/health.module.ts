import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { HealthHttpConfigService } from './config';

/**
 * Health Module
 *
 * Provides simplified health check endpoints for monitoring systems.
 * Designed for infrastructure monitoring tools (Prometheus, Kubernetes, etc.).
 *
 * Features:
 * - Simplified response structure (only status and checks)
 * - External API connectivity checks
 * - HTTP status codes indicate health: 200 (UP), 503 (DOWN)
 * - Monitoring authentication protection
 * - No error tracking metadata in responses
 *
 * Controllers:
 * - HealthController: Exposes /api/client/health endpoint
 *
 * Services:
 * - HealthService: Performs health checks on external dependencies
 * - HealthHttpConfigService: Provides HttpModule configuration
 *
 * Dependencies:
 * - Protected by MonitoringAuthGuard from global guards
 */
@Module({
	imports: [
		HttpModule.registerAsync({
			useClass: HealthHttpConfigService
		})
	],
	controllers: [HealthController],
	providers: [HealthService, HealthHttpConfigService]
})
export class HealthModule {}
