import { Injectable } from '@nestjs/common';
import { EnvKey } from '@/config/environment';
import { EnvironmentService } from '@/modules/common/environment/environment.service';
import { DATABASE_TYPE } from './database-config.constants';
import { IDatabaseConfig, IDatabaseCredentials, IDatabaseSecret, ITlsOptions } from './database-config.interfaces';

/**
 * Centralized builder for TypeORM configuration.
 *
 * This service dynamically adapts the database connection settings
 * for both local and production environments.
 *
 * - Local: reads credentials from environment variables
 * - Production: retrieves the password securely from Secret Manager
 */
@Injectable()
export class DatabaseConfigService {
	constructor(private readonly env: EnvironmentService) {}

	/**
	 * Returns the local database credentials from environment variables.
	 *
	 * @returns The local database credentials
	 */
	private getLocalDatabaseCredentials(): IDatabaseCredentials {
		return {
			database: this.env.getOrThrow<string>(EnvKey.DB_NAME),
			host: this.env.getOrThrow<string>(EnvKey.DB_HOST),
			port: this.env.getOrThrow<number>(EnvKey.DB_PORT),
			username: this.env.getOrThrow<string>(EnvKey.DB_USERNAME),
			password: this.env.getOrThrow<string>(EnvKey.DB_PASSWORD)
		};
	}

	/**
	 * Returns the database credentials from Secret Manager.
	 * Fetches the secret and maps it to IDatabaseCredentials using EnvKey names.
	 *
	 * @returns The database credentials from secret
	 */
	private async getSecretDatabaseCredentials(): Promise<IDatabaseCredentials> {
		const secretName = this.env.getOrThrow<string>(EnvKey.SECRET_NAME_DB);
		const secret = await this.env.getSecretValueOrThrow<IDatabaseSecret>(secretName);

		return {
			database: secret[EnvKey.DB_NAME],
			host: secret[EnvKey.DB_HOST],
			port: secret[EnvKey.DB_PORT],
			username: secret[EnvKey.DB_USERNAME],
			password: secret[EnvKey.DB_PASSWORD]
		};
	}

	/**
	 * Returns the database credentials based on environment.
	 * - Local: reads from environment variables
	 * - Production: reads from Secret Manager
	 *
	 * @returns The database credentials
	 */
	private async getDatabaseCredentials(): Promise<IDatabaseCredentials> {
		if (this.env.isLocal()) {
			return this.getLocalDatabaseCredentials();
		}

		return this.getSecretDatabaseCredentials();
	}
	/**
	 * Returns the SSL options based on the scope.
	 *
	 * @returns The SSL options
	 */
	private getSslOptions(): ITlsOptions {
		return this.env.isLocal() ? false : { rejectUnauthorized: true };
	}

	/**
	 * Builds and returns the TypeORM configuration.
	 *
	 * Enables synchronization/logging locally for rapid development,
	 * and disables both in production to protect data integrity.
	 *
	 * @throws Error if mandatory environment variables are missing
	 */
	async getConfig(): Promise<IDatabaseConfig> {
		const isLocal = this.env.isLocal();
		const { database, password, host, port, username } = await this.getDatabaseCredentials();
		const sslOptions = this.getSslOptions()!;

		return {
			database,
			type: DATABASE_TYPE,
			host,
			port,
			username,
			password,
			logging: isLocal,
			autoLoadEntities: isLocal,
			synchronize: isLocal,
			ssl: sslOptions
		};
	}
}
