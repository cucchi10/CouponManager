import type { Redis, RedisOptions } from 'ioredis';
import { CACHE_PROVIDER_TYPE } from './cache-config.constants';
import { EnvKey } from '@/config/environment';

/**
 * Cache credentials interface for both local and production environments.
 */
export interface ICacheCredentials extends Pick<RedisOptions, 'host' | 'port' | 'password'> {
	host: string;
	port: number;
	password?: string;
}

/**
 * Cache secret structure from Secret Manager.
 * Maps the JSON stored in SECRET_NAME_CACHE secret.
 * Uses EnvKey values as property names for consistency.
 */
export interface ICacheSecret {
	[EnvKey.CACHE_HOST]: string;
	[EnvKey.CACHE_PORT]: number;
	[EnvKey.CACHE_PASSWORD]?: string;
}

/**
 * Redis connection configuration interface.
 * This interface forces the use of Redis (ioredis) as the cache provider,
 * similar to how IDatabaseConfig forces PostgreSQL for the database.
 *
 * We extend RedisOptions and add our custom 'type' field to force Redis usage.
 * All other fields are inherited from RedisOptions to ensure full compatibility.
 */
export interface IRedisConfig extends RedisOptions {
	/** Cache provider type - always 'redis' */
	readonly type: typeof CACHE_PROVIDER_TYPE;
}

/**
 * Bucket map containing Redis client instances for different cache buckets.
 * Each bucket is a separate Redis connection with its own key prefix.
 */
export interface IBucketMap {
	/** Deduplication bucket - for idempotency checks */
	dedup: Redis;

	/** JWT blacklist bucket - for revoked tokens */
	jwtBlacklist: Redis;

	/** JWT active bucket - single active JTI per clientId */
	jwtActive: Redis;

	/** Cursor bucket - for pagination cursors */
	cursor: Redis;

	/** Locks bucket - for distributed locking */
	locks: Redis;
}

/**
 * TLS options type extracted from RedisOptions.
 * This can be ConnectionOptions from 'tls', an empty object, or undefined.
 */
export type ITlsOptions = RedisOptions['tls'];
