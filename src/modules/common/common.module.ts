import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CorrelationService } from './correlation/correlation.service';
import { StructuredLoggerService } from './logger';
import { EnvironmentService } from './environment/environment.service';
import { envSchema } from '@/config/environment';
import { SecretsService } from '@/services/secrets/secrets.service';

/**
 * Common Module
 *
 * Provides shared services and utilities across the application.
 * Marked as Global to make services available everywhere without imports.
 *
 * ConfigModule is imported here (NOT global) to encapsulate ConfigService.
 * Only EnvironmentService (facade) is exported to ensure consistent configuration access.
 *
 * Services:
 * - CorrelationService: Manages correlation IDs for request tracking
 * - StructuredLoggerService: Provides structured JSON logging with PII masking
 * - EnvironmentService: Provides type-safe environment configuration access (facade over ConfigService)
 */
@Global()
@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: false, // NOT global - only available within CommonModule
			validationSchema: envSchema,
			validationOptions: {
				allowUnknown: false
			},
			validatePredefined: false
		})
	],
	providers: [CorrelationService, StructuredLoggerService, EnvironmentService, SecretsService],
	exports: [CorrelationService, StructuredLoggerService, EnvironmentService, SecretsService]
})
export class CommonModule {}
