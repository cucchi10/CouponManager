import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { CORRELATION_ID_KEY, REQUEST_ID_KEY, ALLY_ID_KEY } from '@/config/app.constants';

/**
 * Correlation Service
 *
 * Wrapper around ClsService to provide a clean, domain-specific interface
 * for accessing request context (correlation ID, request ID, ally ID) throughout the application.
 *
 * Benefits:
 * - Clean API specific to your domain
 * - Type-safe access to context values
 * - Easy to test and mock
 * - Decoupled from nestjs-cls implementation
 * - Centralized access to all request identifiers
 *
 * @example
 * // Inject in any service or controller
 * constructor(private readonly correlation: CorrelationService) {}
 *
 * @example
 * // Get context values
 * const correlationId = this.correlation.getCorrelationId();
 * const requestId = this.correlation.getRequestId();
 * const allyId = this.correlation.getAllyId();
 *
 * @example
 * // Set context values (usually done by middleware)
 * this.correlation.setCorrelationId('abc-123');
 * this.correlation.setRequestId('req-456');
 * this.correlation.setAllyId('ally-001');
 */
@Injectable()
export class CorrelationService {
	constructor(private readonly cls: ClsService) {}

	/**
	 * Get the correlation ID for the current request context
	 * Used to trace operations across multiple services
	 */
	getCorrelationId(): string {
		return this.cls.get<string>(CORRELATION_ID_KEY);
	}

	/**
	 * Set the correlation ID for the current request context
	 * Usually called by CorrelationIdMiddleware
	 */
	setCorrelationId(correlationId: string): void {
		this.cls.set(CORRELATION_ID_KEY, correlationId);
	}

	/**
	 * Get the request ID for the current request
	 * Each request has a unique request ID (different from correlation ID)
	 */
	getRequestId(): string {
		return this.cls.get<string>(REQUEST_ID_KEY);
	}

	/**
	 * Set the request ID for the current request context
	 * Usually called by CorrelationIdMiddleware
	 */
	setRequestId(requestId: string): void {
		this.cls.set(REQUEST_ID_KEY, requestId);
	}

	/**
	 * Get the ally ID for the current request
	 * May be undefined if not authenticated or ally not identified
	 */
	getAllyId(): string | undefined {
		return this.cls.get<string>(ALLY_ID_KEY);
	}

	/**
	 * Set the ally ID for the current request context
	 * Usually called by authentication middleware or guards
	 */
	setAllyId(allyId: string): void {
		this.cls.set(ALLY_ID_KEY, allyId);
	}

	/**
	 * Get all context values at once
	 * Useful for logging and debugging
	 */
	getContext() {
		return {
			correlationId: this.getCorrelationId(),
			requestId: this.getRequestId(),
			allyId: this.getAllyId()
		};
	}
}
