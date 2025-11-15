/**
 * Cache provider type constant.
 * Forces the use of Redis as the only supported cache provider.
 */
export const CACHE_PROVIDER_TYPE = 'redis' as const;

/**
 * Injection tokens for cache instances
 */
export const CACHE_BASE = Symbol('CACHE_BASE');
export const CACHE_BUCKETS = Symbol('CACHE_BUCKETS');

/**
 * Cache connection constants
 */
export const CACHE_DEFAULTS = {
	/** Maximum retries per request */
	MAX_RETRIES: 3,

	/** Base delay in milliseconds for retry strategy */
	RETRY_BASE_DELAY_MS: 200,

	/** Maximum delay in milliseconds for retry strategy */
	RETRY_MAX_DELAY_MS: 2000
} as const;
