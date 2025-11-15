import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { CorrelationService } from '../correlation/correlation.service';
import { EnvironmentService } from '../environment/environment.service';
import { IBaseLogContext } from './interfaces/log-context.interface';
import { maskPIIInObject } from './utils/masking.utils';
import pino from 'pino';
import { ALLY_ID_KEY, CORRELATION_ID_KEY, REQUEST_ID_KEY } from '@/config/app.constants';
import { EnvKey, LogLevel } from '@/config/environment';

const logLevelValues = Object.values(LogLevel);

/**
 * Structured Logger Service
 *
 * Provides JSON-formatted structured logging with automatic PII masking
 * and context enrichment (correlationId, requestId, etc.)
 *
 * Uses Pino for high-performance JSON logging.
 *
 * Features:
 * - JSON structured logs with mandatory fields
 * - Automatic PII masking for sensitive data
 * - Context enrichment from CLS (AsyncLocalStorage)
 * - Support for all log levels (DEBUG, INFO, WARN, ERROR, FATAL)
 * - High performance with Pino
 * - Pretty print in development
 * - Compatible with external log aggregators (CloudWatch, DataDog, etc.)
 *
 * @example
 * // Basic usage
 * this.logger.info('User logged in successfully', { userId: '123' });
 *
 * @example
 * // With context
 * this.logger.info('Operation processed', {
 *   service: 'ExternalService',
 *   clientId: 'client-001',
 *   httpStatus: 200,
 *   latencyMs: 245
 * });
 *
 * @example
 * // Error logging
 * this.logger.error('Operation failed', error, {
 *   service: 'ExternalService',
 *   errorCode: 'OPERATION_ERROR'
 * });
 */
@Injectable()
export class StructuredLoggerService implements NestLoggerService {
	private context?: string;
	private readonly logger: pino.Logger;

	constructor(
		private readonly correlationService: CorrelationService,
		private readonly env: EnvironmentService
	) {
		const pinoOptions: pino.LoggerOptions = {
			level: this.env.getOrThrow<LogLevel>(EnvKey.LOG_LEVEL),
			timestamp: pino.stdTimeFunctions.isoTime, // ISO 8601 timestamp
			formatters: {
				level: (label) => {
					return { level: label };
				}
			}
		};

		this.logger = pino(pinoOptions);
	}

	/**
	 * Sets the logger context (usually the class name)
	 */
	setContext(context: string): void {
		this.context = context;
	}

	/**
	 * Logs a DEBUG level message
	 * Use for: Details of encryption/decryption, key derivation (only in development)
	 */
	debug(message: string, context?: IBaseLogContext): void {
		this.log(LogLevel.DEBUG, message, context);
	}

	/**
	 * Logs an INFO level message
	 * Use for: Successful requests, normal operations
	 */
	info(message: string, context?: IBaseLogContext): void {
		this.log(LogLevel.INFO, message, context);
	}

	/**
	 * Logs a WARN level message
	 * Use for: Retries, circuit breaker activated, secret about to expire
	 */
	warn(message: string, context?: IBaseLogContext): void {
		this.log(LogLevel.WARN, message, context);
	}

	/**
	 * Logs an ERROR level message
	 * Use for: Dependency errors, failed validations
	 */
	error(message: string, error?: Error | unknown, context?: IBaseLogContext): void {
		const errorContext: IBaseLogContext = {
			...context,
			...(error instanceof Error && { stack: error.stack, error: error.message })
		};

		this.log(LogLevel.ERROR, message, errorContext);
	}

	/**
	 * Logs a FATAL level message
	 * Use for: Critical errors requiring immediate intervention
	 */
	fatal(message: string, error?: Error | unknown, context?: IBaseLogContext): void {
		const errorContext: IBaseLogContext = {
			...context,
			...(error instanceof Error && { stack: error.stack, error: error.message })
		};

		this.log(LogLevel.FATAL, message, errorContext);
	}

	/**
	 * Alias for info() - implements NestJS LoggerService interface
	 */
	log(message: string, context?: string): void;
	log(level: LogLevel, message: string, context?: IBaseLogContext): void;
	log(levelOrMessage: string | LogLevel, contextOrMessage?: string | IBaseLogContext, maybeContext?: IBaseLogContext): void {
		// Handle both signatures
		if (typeof levelOrMessage === 'string' && logLevelValues.includes(levelOrMessage as LogLevel)) {
			// Called as log(level, message, context)
			this.writeLog(levelOrMessage as LogLevel, contextOrMessage as string, maybeContext);
		} else {
			// Called as log(message, context) - NestJS interface
			const ctx = typeof contextOrMessage === 'string' ? { context: contextOrMessage } : contextOrMessage;

			this.writeLog(LogLevel.INFO, levelOrMessage as string, ctx);
		}
	}

	/**
	 * Alias for debug() - implements NestJS LoggerService interface
	 */
	verbose(message: string, context?: string): void {
		this.debug(message, context ? { context } : undefined);
	}

	/**
	 * Core logging method that formats and writes the log entry using Pino
	 */
	private writeLog(level: LogLevel, message: string, context?: IBaseLogContext): void {
		// Get enriched context with correlation IDs
		const enrichedContext = this.getEnrichedContext(context);

		// Mask PII in the context
		const maskedContext = maskPIIInObject(enrichedContext);

		// Use Pino's appropriate method based on level
		switch (level) {
			case LogLevel.DEBUG:
				this.logger.debug(maskedContext, message);
				break;
			case LogLevel.INFO:
				this.logger.info(maskedContext, message);
				break;
			case LogLevel.WARN:
				this.logger.warn(maskedContext, message);
				break;
			case LogLevel.ERROR:
				this.logger.error(maskedContext, message);
				break;
			case LogLevel.FATAL:
				this.logger.fatal(maskedContext, message);
				break;
			default:
				this.logger.info(maskedContext, message);
		}
	}

	/**
	 * Enriches log context with correlationId, requestId, allyId, and other contextual data
	 */
	private getEnrichedContext(context?: IBaseLogContext): Record<string, unknown> {
		const enriched: Record<string, unknown> = {
			...(context || {})
		};

		// Get all IDs from CLS
		try {
			const { correlationId, requestId, allyId } = this.correlationService.getContext();

			if (correlationId) {
				enriched[CORRELATION_ID_KEY] = correlationId;
			}

			if (requestId) {
				enriched[REQUEST_ID_KEY] = requestId;
			}

			if (allyId) {
				enriched[ALLY_ID_KEY] = allyId;
			}
		} catch {
			// CLS might not be available in some contexts (e.g., startup, tests)
			// Silently ignore
		}

		// Add class context if available
		if (this.context) {
			enriched['context'] = this.context;
		}

		return enriched;
	}
}
