import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ErrorCode } from '@/modules/common/filters';

/**
 * Centralized access layer for all secrets used by the application.
 *
 * This service relies on the `SecretRefreshService` which periodically
 * retrieves and refreshes all secrets (every 15 minutes).
 *
 * Responsibilities:
 *  - Provide access to the latest secret values.
 *  - Log warnings for missing or stale secrets.
 */

@Injectable()
export class SecretsService {
	private readonly logger = new Logger(SecretsService.name);
	/**
	 * Retrieves a secret value managed by SecretRefreshService.
	 *
	 * @template T Expected return type of the secret.
	 * @param _secretName The unique identifier of the secret
	 * @returns The secret value (parsed and typed).
	 */
	async getSecretValue<T>(_secretName: string): Promise<T | undefined> {
		// TODO: Integrate with SecretRefreshService to get actual secrets.
		return undefined as unknown as T;
	}

	async getSecretValueOrThrow<T>(secretName: string): Promise<T> {
		const secret = await this.getSecretValue<T>(secretName);

		if (secret === undefined || secret === null) {
			// Log full details server-side only
			this.logger.error(`Secret not found: ${secretName}`);

			// Return generic error to client (no sensitive info)
			throw new InternalServerErrorException({
				message: 'Secret configuration error',
				code: ErrorCode.INTERNAL_ERROR
			});
		}

		return secret as T;
	}
}
