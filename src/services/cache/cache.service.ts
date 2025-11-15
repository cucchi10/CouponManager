import { Inject, Injectable, InternalServerErrorException, OnModuleDestroy } from '@nestjs/common';
import { EnvKey } from '@/config/environment';
import { CacheBucket } from './cache.enums';
import type { BucketMap } from './cache.constants';
import { CacheKeyBuilder, CACHE_BASE, CACHE_BUCKETS } from './cache.constants';
import { StructuredLoggerService } from '@/modules/common/logger';
import { EnvironmentService } from '@/modules/common/environment/environment.service';
import { ErrorCode } from '@/modules/common/filters';
import type { Redis as RedisClient } from 'ioredis';

export interface CacheHealthCheck {
	status: 'healthy' | 'unhealthy';
	latencyMs: number;
	error?: string;
}

@Injectable()
export class CacheService implements OnModuleDestroy {
	private readonly readTimeoutMs: number;
	private readonly dedupTtlSec: number;
	private readonly cursorTtlSec: number;

	constructor(
		private readonly env: EnvironmentService,
		private readonly logger: StructuredLoggerService,
		@Inject(CACHE_BASE) private readonly base: RedisClient,
		@Inject(CACHE_BUCKETS) private readonly buckets: BucketMap
	) {
		this.readTimeoutMs = this.env.getOrThrow<number>(EnvKey.TIMEOUT_CACHE_READ_MS);
		this.dedupTtlSec = this.env.getOrThrow<number>(EnvKey.CACHE_DEDUP_TTL_SEC);
		this.cursorTtlSec = this.env.getOrThrow<number>(EnvKey.CACHE_CURSOR_TTL_SEC);
	}

	private async withReadTimeout<T>(op: () => Promise<T>): Promise<T> {
		return Promise.race<Promise<T>>([
			op(),
			new Promise<never>((_, reject) => {
				const id = setTimeout(() => {
					clearTimeout(id);
					reject(new Error('Redis read timeout'));
				}, this.readTimeoutMs);
			})
		]);
	}

	/**
	 * Retry logic for critical operations
	 */
	private async withRetry<T>(operation: () => Promise<T>, context: string, maxRetries: number = 3): Promise<T> {
		let lastError: Error | undefined;

		for (let attempt = 1; attempt <= maxRetries; attempt++) {
			try {
				return await operation();
			} catch (error) {
				lastError = error instanceof Error ? error : new Error(String(error));

				if (attempt === maxRetries) {
					this.logger.error(`Cache operation failed after ${maxRetries} attempts`, {
						context,
						error: lastError.message,
						attempts: maxRetries
					});
					throw lastError;
				}

				const backoffMs = Math.pow(2, attempt - 1) * 100;

				this.logger.warn(`Cache operation failed, retrying...`, {
					context,
					attempt,
					maxRetries,
					backoffMs,
					error: lastError.message
				});

				await new Promise((resolve) => setTimeout(resolve, backoffMs));
			}
		}

		throw lastError || new Error('Operation failed with unknown error');
	}

	/**
	 * Health check for Redis connection
	 */
	async healthCheck(): Promise<CacheHealthCheck> {
		const start = Date.now();

		try {
			await this.base.ping();

			const latencyMs = Date.now() - start;

			this.logger.debug('Cache health check passed', { latencyMs });

			return {
				status: 'healthy',
				latencyMs
			};
		} catch (error) {
			const latencyMs = Date.now() - start;
			const errorMessage = error instanceof Error ? error.message : String(error);

			this.logger.error('Cache health check failed', {
				latencyMs,
				error: errorMessage
			});

			return {
				status: 'unhealthy',
				latencyMs,
				error: errorMessage
			};
		}
	}

	async ping(): Promise<string> {
		return this.base.ping();
	}

	/**
	 * Get value from cache with logging
	 */
	async get(bucket: CacheBucket, key: string): Promise<string | null> {
		const start = Date.now();

		try {
			const c = this.client(bucket);
			const result = await this.withRetry(() => this.withReadTimeout(() => c.get(key)), `GET ${bucket}:${key}`);

			const duration = Date.now() - start;

			this.logger.debug('Cache GET', {
				bucket,
				key,
				hit: !!result,
				duration
			});

			return result;
		} catch (error) {
			const duration = Date.now() - start;

			this.logger.error('Cache GET failed', {
				bucket,
				key,
				duration,
				error: error instanceof Error ? error.message : String(error)
			});
			throw error;
		}
	}

	/**
	 * Set value in cache with logging
	 */
	async set(bucket: CacheBucket, key: string, value: string, ttlSec?: number): Promise<'OK' | null> {
		const start = Date.now();

		try {
			const c = this.client(bucket);
			const result = await this.withRetry(
				() => this.withReadTimeout(() => (ttlSec ? c.set(key, value, 'EX', ttlSec) : c.set(key, value))),
				`SET ${bucket}:${key}`
			);

			const duration = Date.now() - start;

			this.logger.debug('Cache SET', {
				bucket,
				key,
				ttlSec,
				duration
			});

			return result;
		} catch (error) {
			const duration = Date.now() - start;

			this.logger.error('Cache SET failed', {
				bucket,
				key,
				ttlSec,
				duration,
				error: error instanceof Error ? error.message : String(error)
			});
			throw error;
		}
	}

	/**
	 * Delete key from cache with logging
	 */
	async del(bucket: CacheBucket, key: string): Promise<number> {
		const start = Date.now();

		try {
			const c = this.client(bucket);
			const result = await this.withRetry(() => this.withReadTimeout(() => c.del(key)), `DEL ${bucket}:${key}`);

			const duration = Date.now() - start;

			this.logger.debug('Cache DEL', {
				bucket,
				key,
				deleted: result,
				duration
			});

			return result;
		} catch (error) {
			const duration = Date.now() - start;

			this.logger.error('Cache DEL failed', {
				bucket,
				key,
				duration,
				error: error instanceof Error ? error.message : String(error)
			});
			throw error;
		}
	}

	/**
	 * Check if key exists in cache with logging
	 */
	async exists(bucket: CacheBucket, key: string): Promise<number> {
		const start = Date.now();

		try {
			const c = this.client(bucket);
			const result = await this.withRetry(() => this.withReadTimeout(() => c.exists(key)), `EXISTS ${bucket}:${key}`);

			const duration = Date.now() - start;

			this.logger.debug('Cache EXISTS', {
				bucket,
				key,
				exists: result === 1,
				duration
			});

			return result;
		} catch (error) {
			const duration = Date.now() - start;

			this.logger.error('Cache EXISTS failed', {
				bucket,
				key,
				duration,
				error: error instanceof Error ? error.message : String(error)
			});
			throw error;
		}
	}

	/**
	 * Get JSON object from cache
	 */
	async getJson<T>(bucket: CacheBucket, key: string): Promise<T | null> {
		const value = await this.get(bucket, key);

		if (!value) {
			return null;
		}

		try {
			return JSON.parse(value) as T;
		} catch (error) {
			this.logger.error('Failed to parse JSON from cache', {
				bucket,
				key,
				error: error instanceof Error ? error.message : String(error)
			});
			throw new InternalServerErrorException({
				message: 'Failed to parse cached data',
				code: ErrorCode.INTERNAL_ERROR
			});
		}
	}

	/**
	 * Set JSON object in cache
	 */
	async setJson<T>(bucket: CacheBucket, key: string, value: T, ttlSec?: number): Promise<'OK' | null> {
		try {
			const jsonString = JSON.stringify(value);

			return await this.set(bucket, key, jsonString, ttlSec);
		} catch (error) {
			this.logger.error('Failed to stringify JSON for cache', {
				bucket,
				key,
				error: error instanceof Error ? error.message : String(error)
			});
			throw new InternalServerErrorException({
				message: 'Failed to cache data',
				code: ErrorCode.INTERNAL_ERROR
			});
		}
	}

	/**
	 * Set deduplication flag with configurable TTL
	 */
	async setDedup(feature: string, hash: string, ttl?: number) {
		const ttlToUse = ttl ?? this.dedupTtlSec;

		return this.set(CacheBucket.DEDUP, CacheKeyBuilder.dedup(feature, hash), '1', ttlToUse);
	}

	/**
	 * Check if deduplication flag exists
	 */
	async hasDedup(feature: string, hash: string) {
		return (await this.exists(CacheBucket.DEDUP, CacheKeyBuilder.dedup(feature, hash))) === 1;
	}

	/**
	 * Acquire a distributed lock with TTL
	 *
	 * @param feature - Feature name (e.g., 'coupon-lock', 'coupon-redeem')
	 * @param resource - Resource identifier (e.g., coupon code, user ID)
	 * @param ttlSeconds - Lock TTL in seconds
	 * @returns True if lock was acquired, false if already held
	 */
	async acquireLock(feature: string, resource: string, ttlSeconds: number): Promise<boolean> {
		const key = CacheKeyBuilder.lock(feature, resource);
		const client = this.client(CacheBucket.LOCKS);

		try {
			// Use SET NX (SET if Not eXists) for atomic lock acquisition
			const result = await this.withRetry(
				() => this.withReadTimeout(() => client.set(key, `${Date.now()}`, 'EX', ttlSeconds, 'NX')),
				`Acquire lock ${feature}:${resource}`
			);

			return result === 'OK';
		} catch (error) {
			this.logger.error(`Failed to acquire lock: ${feature}:${resource}`, { error });

			return false;
		}
	}

	/**
	 * Release a distributed lock
	 *
	 * @param feature - Feature name (e.g., 'coupon-lock', 'coupon-redeem')
	 * @param resource - Resource identifier (e.g., coupon code, user ID)
	 */
	async releaseLock(feature: string, resource: string): Promise<void> {
		const key = CacheKeyBuilder.lock(feature, resource);

		try {
			await this.del(CacheBucket.LOCKS, key);
		} catch (error) {
			this.logger.warn(`Failed to release lock: ${feature}:${resource}`, { error });
		}
	}

	/**
	 * Set cursor value with configurable TTL
	 */
	async setCursor(resource: string, id: string, value: string, ttl?: number) {
		const ttlToUse = ttl ?? this.cursorTtlSec;

		return this.set(CacheBucket.CURSOR, CacheKeyBuilder.cursor(resource, id), value, ttlToUse);
	}

	/**
	 * Get cursor value
	 */
	async getCursor(resource: string, id: string) {
		return this.get(CacheBucket.CURSOR, CacheKeyBuilder.cursor(resource, id));
	}

	/**
	 * Blacklist JWT token
	 */
	async blacklistJwt(jti: string, secondsToExpire: number) {
		return this.set(CacheBucket.JWT_BLACKLIST, CacheKeyBuilder.jwtBlacklist(jti), '1', secondsToExpire);
	}

	/**
	 * Check if JWT token is blacklisted
	 */
	async isJwtBlacklisted(jti: string) {
		return (await this.exists(CacheBucket.JWT_BLACKLIST, CacheKeyBuilder.jwtBlacklist(jti))) === 1;
	}

	/**
	 * Get remaining TTL (in seconds) for a key in a bucket
	 */
	async getTtlSeconds(bucket: CacheBucket, key: string): Promise<number> {
		const bucketClient = this.client(bucket);

		return await this.withRetry(() => this.withReadTimeout(() => bucketClient.ttl(key)), `TTL ${bucket}:${key}`);
	}

	/**
	 * Get remaining TTL for active JTI key of clientId
	 */
	async getActiveJwtTtlSeconds(clientId: string): Promise<number> {
		return this.getTtlSeconds(CacheBucket.JWT_ACTIVE, CacheKeyBuilder.jwtActive(clientId));
	}

	/**
	 *  Rotate active JWT jti for clientId with TTL
	 *
	 * @param clientId The client identifier.
	 * @param newJwt The new JWT jti to set as active
	 * @param ttlSec The TTL in seconds for the new JWT jti.
	 * @returns The previous JTI (there was an active token before this rotation) or null if no previous JTI (first login / no key existed).
	 */
	async rotateActiveJwt(clientId: string, newJwt: string, ttlSec: number): Promise<string | null> {
		const client = this.client(CacheBucket.JWT_ACTIVE);

		return client.set(CacheKeyBuilder.jwtActive(clientId), newJwt, 'EX', ttlSec, 'GET');
	}

	async onModuleDestroy() {
		await Promise.all([
			this.buckets?.dedup.quit(),
			this.buckets?.jwtBlacklist.quit(),
			this.buckets?.jwtActive.quit(),
			this.buckets?.cursor.quit(),
			this.buckets?.locks.quit(),
			this.base?.quit()
		]);
	}

	private client(bucket: CacheBucket): RedisClient {
		switch (bucket) {
			case CacheBucket.DEDUP:
				return this.buckets.dedup;
			case CacheBucket.JWT_BLACKLIST:
				return this.buckets.jwtBlacklist;
			case CacheBucket.JWT_ACTIVE:
				return this.buckets.jwtActive;
			case CacheBucket.CURSOR:
				return this.buckets.cursor;
			case CacheBucket.LOCKS:
				return this.buckets.locks;
			default:
				throw new InternalServerErrorException({
					message: 'Invalid cache bucket',
					code: ErrorCode.INTERNAL_ERROR
				});
		}
	}
}
