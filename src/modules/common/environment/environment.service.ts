import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Environment, EnvKey } from '@/config/environment';
import { SecretsService } from '@/services/secrets/secrets.service';

/**
 * Environment service that wraps ConfigService with convenient environment checking methods.
 * Provides type-safe access to configuration and environment scope utilities.
 *
 * @example
 * ```typescript
 * constructor(private readonly env: EnvironmentService) {}
 *
 * someMethod() {
 *   if (this.env.isLocal()) {
 *     // Development-specific logic
 *   }
 *
 *   const host = this.env.get(EnvKey.DB_HOST);
 *   const port = this.env.getOrThrow(EnvKey.DB_PORT);
 * }
 * ```
 */
@Injectable()
export class EnvironmentService {
	private readonly secretsCache = new Map<string, unknown>();

	constructor(
		private readonly config: ConfigService,
		private readonly secrets: SecretsService
	) {}

	/**
	 * Get a configuration value by key.
	 * Returns undefined if the key doesn't exist.
	 *
	 * @param key Configuration key from EnvKey enum
	 * @returns Configuration value or undefined
	 */
	get<T = any>(key: EnvKey): T | undefined {
		return this.config.get<T>(key);
	}

	/**
	 * Get a configuration value by key.
	 * Throws an error if the key doesn't exist.
	 *
	 * @param key Configuration key from EnvKey enum
	 * @returns Configuration value
	 * @throws Error if key is not found
	 */
	getOrThrow<T = any>(key: EnvKey): T {
		return this.config.getOrThrow<T>(key);
	}

	/**
	 * Returns the current environment scope.
	 *
	 * @returns Current scope as Environment enum
	 * @throws Error if SCOPE is not configured
	 */
	getScope(): Environment {
		return this.config.getOrThrow<Environment>(EnvKey.SCOPE);
	}

	/**
	 * Checks if the current scope is DEVELOPMENT.
	 *
	 * @returns True if scope is DEVELOPMENT
	 */
	isDev(): boolean {
		return this.getScope() === Environment.DEVELOPMENT;
	}

	/**
	 * Checks if the current scope is PRODUCTION.
	 *
	 * @returns True if scope is PRODUCTION
	 */
	isProd(): boolean {
		return this.getScope() === Environment.PRODUCTION;
	}

	/**
	 * Checks if the current scope is local (development).
	 * Alias for isDev() for better readability in some contexts.
	 *
	 * @returns True if scope is DEVELOPMENT
	 */
	isLocal(): boolean {
		return this.isDev();
	}

	/**
	 * Provides access to the underlying ConfigService if needed.
	 * Use this sparingly - prefer using the typed methods above.
	 *
	 * @returns The underlying ConfigService instance
	 */
	getConfigService(): ConfigService {
		return this.config;
	}

	/**
	 * Get a secret value by name with caching.
	 * Returns undefined if the secret doesn't exist.
	 * Caches the result to avoid redundant calls to Secret Manager.
	 */
	async getSecretValue<T = string>(secretName: string): Promise<T | undefined> {
		// Check cache first
		if (this.secretsCache.has(secretName)) {
			return this.secretsCache.get(secretName) as T;
		}

		// Fetch from Secret Manager
		const value = await this.secrets.getSecretValue<T>(secretName);

		// Cache the value (only if defined)
		if (value !== undefined) {
			this.secretsCache.set(secretName, value);
		}

		return value;
	}

	/**
	 * Get a secret value by name with caching.
	 * Throws an error if the secret doesn't exist.
	 * Caches the result to avoid redundant calls to Secret Manager.
	 */
	async getSecretValueOrThrow<T = string>(secretName: string): Promise<T> {
		// Check cache first
		if (this.secretsCache.has(secretName)) {
			return this.secretsCache.get(secretName) as T;
		}

		// Fetch from Secret Manager
		const value = await this.secrets.getSecretValueOrThrow<T>(secretName);

		// Cache the value
		this.secretsCache.set(secretName, value);

		return value;
	}

	/**
	 * Clear the secrets cache.
	 * Useful for testing or forcing a refresh of secrets.
	 */
	clearSecretsCache(): void {
		this.secretsCache.clear();
	}

	/**
	 * Get the number of cached secrets.
	 */
	getCachedSecretsCount(): number {
		return this.secretsCache.size;
	}

	/**
	 * Provides access to the underlying SecretsService if needed.
	 * Use this sparingly - prefer using the typed methods above.
	 *
	 * @returns The underlying SecretsService instance
	 */
	getSecretService(): SecretsService {
		return this.secrets;
	}
}
