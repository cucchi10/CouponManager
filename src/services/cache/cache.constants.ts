export { CACHE_BASE, CACHE_BUCKETS } from './cache-config.constants';
export type { IBucketMap as BucketMap } from './cache-config.interfaces';
import { CacheBucket } from './cache.enums';

/**
 * Cache key builder with validation
 */
export class CacheKeyBuilder {
	private static readonly MAX_KEY_LENGTH = 512;

	static dedup(feature: string, hash: string): string {
		const key = `${feature}:${hash}`;

		this.validate(key, CacheBucket.DEDUP);

		return key;
	}

	static cursor(resource: string, id: string): string {
		const key = `${resource}:${id}`;

		this.validate(key, CacheBucket.CURSOR);

		return key;
	}

	static jwtBlacklist(jti: string): string {
		this.validate(jti, CacheBucket.JWT_BLACKLIST);

		return jti;
	}

	static jwtActive(clientId: string): string {
		this.validate(clientId, CacheBucket.JWT_ACTIVE);

		return `active:${clientId}`;
	}

	static lock(feature: string, resource: string): string {
		const key = `${feature}:${resource}`;

		this.validate(key, CacheBucket.LOCKS);

		return key;
	}

	private static validate(key: string, context: CacheBucket): void {
		if (!key || key.length === 0) {
			throw new Error(`Cache key cannot be empty (bucket: ${context})`);
		}

		if (key.length > this.MAX_KEY_LENGTH) {
			throw new Error(`Cache key exceeds maximum length of ${this.MAX_KEY_LENGTH} characters (bucket: ${context})`);
		}
	}
}
