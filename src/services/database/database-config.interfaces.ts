import { EnvKey } from '@/config/environment';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions.js';

export interface IDatabaseCredentials extends Pick<PostgresConnectionOptions, 'database' | 'host' | 'port' | 'username' | 'password'> {
	database: string;
	host: string;
	port: number;
	username: string;
	password: string;
}

/**
 * Database secret structure from Secret Manager.
 * Maps the JSON stored in SECRET_NAME_DB secret.
 * Uses EnvKey values as property names for consistency.
 */
export interface IDatabaseSecret {
	[EnvKey.DB_HOST]: string;
	[EnvKey.DB_PORT]: number;
	[EnvKey.DB_USERNAME]: string;
	[EnvKey.DB_PASSWORD]: string;
	[EnvKey.DB_NAME]: string;
}

export type IDatabaseConfig = Omit<TypeOrmModuleOptions, keyof DataSourceOptions> & PostgresConnectionOptions;

export type ITlsOptions = PostgresConnectionOptions['ssl'];
