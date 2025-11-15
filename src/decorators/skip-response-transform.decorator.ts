import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key for skipping response transformation
 */
export const SKIP_RESPONSE_TRANSFORM_KEY = 'skipResponseTransform';

/**
 * Decorator to skip ResponseTransformInterceptor for specific controllers or methods.
 * Useful for endpoints that return custom formats (e.g., Prometheus metrics, ACK responses).
 *
 * @example
 * // Skip for entire controller
 * @Controller('metrics')
 * @SkipResponseTransform()
 * export class MetricsController {}
 *
 * @example
 * // Skip for specific method
 * @Get('metrics')
 * @SkipResponseTransform()
 * async getMetrics() {}
 */
export const SkipResponseTransform = () => SetMetadata(SKIP_RESPONSE_TRANSFORM_KEY, true);
