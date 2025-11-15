import { Injectable } from '@nestjs/common';
import Redis, { Redis as RedisClient } from 'ioredis';
import { EnvKey } from '@/config/environment';
import { StructuredLoggerService } from '@/modules/common/logger';
import { EnvironmentService } from '@/modules/common/environment/environment.service';
import { CACHE_PROVIDER_TYPE, CACHE_DEFAULTS } from './cache-config.constants';
import { IBucketMap, ICacheCredentials, ICacheSecret, IRedisConfig, ITlsOptions } from './cache-config.interfaces';

/**
 * Centralized builder for Redis cache configuration.
 *
 * This service dynamically adapts the Redis connection settings
 * for both local and production environments, following the same
 * pattern as DatabaseConfigService.
 *
 * Features:
 * - Local: reads credentials from environment variables with optional no-auth mode
 * - Production: retrieves the password securely from Secret Manager
 * - Creates base Redis client and bucket-specific clients with key prefixes
 * - Validates connection with PING command
 * - Handles TLS/SSL configuration
 *
 * @see DatabaseConfigService for the database equivalent
 */
@Injectable()
export class CacheConfigService {
	constructor(
		private readonly env: EnvironmentService,
		private readonly logger: StructuredLoggerService
	) {
		this.logger.setContext(CacheConfigService.name);
	}

	/**
	 * Creates bucket-specific Redis clients with key prefixes.
	 * Each bucket is a duplicate of the base client with its own namespace.
	 *
	 * @param base The base Redis client to duplicate from
	 * @returns Map of bucket names to Redis client instances
	 */
	async createBuckets(base: RedisClient): Promise<IBucketMap> {
		const dedupNamespace = this.env.getOrThrow<string>(EnvKey.CACHE_NAMESPACE_DEDUP);
		const jwtNamespace = this.env.getOrThrow<string>(EnvKey.CACHE_NAMESPACE_JWT_BLACKLIST);
		const jwtActiveNamespace = this.env.getOrThrow<string>(EnvKey.CACHE_NAMESPACE_JWT_ACTIVE);
		const cursorNamespace = this.env.getOrThrow<string>(EnvKey.CACHE_NAMESPACE_CURSOR);
		const locksNamespace = this.env.getOrThrow<string>(EnvKey.CACHE_NAMESPACE_LOCKS);

		// Create duplicate clients with key prefixes
		const dedup = base.duplicate({
			keyPrefix: `${dedupNamespace}:`
		});

		const jwtBlacklist = base.duplicate({
			keyPrefix: `${jwtNamespace}:`
		});

		const jwtActive = base.duplicate({
			keyPrefix: `${jwtActiveNamespace}:`
		});

		const cursor = base.duplicate({
			keyPrefix: `${cursorNamespace}:`
		});

		const locks = base.duplicate({
			keyPrefix: `${locksNamespace}:`
		});

		// Connect all bucket clients
		await Promise.all([dedup.connect(), jwtBlacklist.connect(), jwtActive.connect(), cursor.connect(), locks.connect()]);

		this.logger.log('Redis bucket clients created and connected');

		return { dedup, jwtBlacklist, jwtActive, cursor, locks };
	}

	/**
	 * Returns the local cache credentials from environment variables.
	 *
	 * @returns The local cache credentials
	 */
	private getLocalCacheCredentials(): ICacheCredentials {
		const password = this.env.get<string>(EnvKey.CACHE_PASSWORD);

		return {
			host: this.env.getOrThrow<string>(EnvKey.CACHE_HOST),
			port: this.env.getOrThrow<number>(EnvKey.CACHE_PORT),
			...(!!password && { password })
		};
	}

	/**
	 * Returns the cache credentials from Secret Manager.
	 * Fetches the secret and maps it to ICacheCredentials using EnvKey names.
	 *
	 * @returns The cache credentials from secret
	 */
	private async getSecretCacheCredentials(): Promise<ICacheCredentials> {
		const secretName = this.env.getOrThrow<string>(EnvKey.SECRET_NAME_CACHE);
		const secret = await this.env.getSecretValueOrThrow<ICacheSecret>(secretName);
		const password = secret[EnvKey.CACHE_PASSWORD];

		return {
			host: secret[EnvKey.CACHE_HOST],
			port: secret[EnvKey.CACHE_PORT],
			...(!!password && { password })
		};
	}

	/**
	 * Returns the cache credentials based on environment.
	 * - Local: reads from environment variables
	 * - Production: reads from Secret Manager
	 *
	 * @returns The cache credentials
	 */
	private async getCacheCredentials(): Promise<ICacheCredentials> {
		if (this.env.isLocal()) {
			return this.getLocalCacheCredentials();
		}

		return this.getSecretCacheCredentials();
	}

	/**
	 * Returns the TLS options based on the scope.
	 * Similar to DatabaseConfigService.getSslOptions()
	 *
	 * @returns The TLS options or undefined for no TLS
	 */
	private getTlsOptions(): ITlsOptions {
		return this.env.isLocal() ? undefined : { rejectUnauthorized: true };
	}

	/**
	 * Builds and returns the Redis configuration.
	 *
	 * @returns The Redis configuration
	 */
	async getConfig(): Promise<IRedisConfig> {
		const isLocal = this.env.isLocal();
		const { host, port, password } = await this.getCacheCredentials();
		const connectTimeout = this.env.getOrThrow<number>(EnvKey.TIMEOUT_CACHE_CONNECT_MS);
		const readTimeout = this.env.getOrThrow<number>(EnvKey.TIMEOUT_CACHE_READ_MS);
		const tlsOptions = this.getTlsOptions();
		const scope = this.env.getScope();

		const config: IRedisConfig = {
			type: CACHE_PROVIDER_TYPE,
			host,
			port,
			connectTimeout,
			lazyConnect: true,
			maxRetriesPerRequest: CACHE_DEFAULTS.MAX_RETRIES,
			retryStrategy: (attempt) => Math.min(attempt * CACHE_DEFAULTS.RETRY_BASE_DELAY_MS, CACHE_DEFAULTS.RETRY_MAX_DELAY_MS),
			commandTimeout: readTimeout,
			enableOfflineQueue: isLocal,
			enableAutoPipelining: true,
			connectionName: `app:${scope}:${process.pid}`
		};

		if (password) {
			config.password = password;
		}

		if (tlsOptions) {
			config.tls = tlsOptions;
		}

		return config;
	}

	/**
	 * Creates and validates the base Redis client connection.
	 * This is the main Redis client that other bucket clients are duplicated from.
	 *
	 * @returns Connected and verified Redis client
	 * @throws Error if connection or authentication fails
	 */
	async createAndVerifyBaseClient(): Promise<RedisClient> {
		const config = await this.getConfig();

		// Remove the custom 'type' field before passing to Redis constructor
		const { type: _, ...redisOptions } = config;

		const client = new Redis(redisOptions);

		// Connect to Redis
		await client.connect();

		// Verify connection with PING
		try {
			await client.ping();
			this.logger.log('Redis base client connected and verified');
		} catch (err) {
			await client.quit();
			throw err;
		}

		// Setup event handlers
		client.on('error', (e) => this.logger.error(`Redis error: ${(e as Error).message}`, e as Error));
		client.on('end', () => this.logger.warn('Redis connection ended'));
		client.on('ready', () => this.logger.log('Redis ready'));

		return client;
	}
}
