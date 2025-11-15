/**
 * Utilities for masking PII (Personally Identifiable Information) in logs
 */

/**
 * Masks a bank account number, showing only the last 4 digits
 * @param account - The account number to mask
 * @returns Masked account number (e.g., "***1234")
 * @example maskAccount("1234567890") => "***7890"
 */
export function maskAccount(account: string | undefined | null): string {
	if (!account) {
		return '***';
	}

	const str = String(account);

	if (str.length <= 4) {
		return '***';
	}

	return `***${str.slice(-4)}`;
}

/**
 * Masks a phone number, showing only the last 4 digits
 * @param phone - The phone number to mask
 * @returns Masked phone number (e.g., "***5678")
 * @example maskPhone("+584121234567") => "***4567"
 */
export function maskPhone(phone: string | undefined | null): string {
	if (!phone) {
		return '***';
	}

	const str = String(phone);

	if (str.length <= 4) {
		return '***';
	}

	return `***${str.slice(-4)}`;
}

/**
 * Masks a reference or transaction ID, showing only the last 4 characters
 * @param reference - The reference to mask
 * @returns Masked reference (e.g., "***AB12")
 * @example maskReference("TXN123456AB12") => "***AB12"
 */
export function maskReference(reference: string | undefined | null): string {
	if (!reference) {
		return '***';
	}

	const str = String(reference);

	if (str.length <= 4) {
		return '***';
	}

	return `***${str.slice(-4)}`;
}

/**
 * Completely masks sensitive data (API keys, tokens, secrets, passwords)
 * @param sensitive - The sensitive data to mask
 * @returns "***REDACTED***"
 */
export function maskSensitive(_sensitive: string | undefined | null): string {
	return '***REDACTED***';
}

/**
 * Masks email addresses, showing only first character and domain
 * @param email - The email to mask
 * @returns Masked email (e.g., "j***@example.com")
 * @example maskEmail("john.doe@example.com") => "j***@example.com"
 */
export function maskEmail(email: string | undefined | null): string {
	if (!email) {
		return '***';
	}

	const str = String(email);
	const parts = str.split('@');

	if (parts.length !== 2) {
		return '***';
	}

	const [local, domain] = parts;

	if (!local || local.length === 0) {
		return '***';
	}

	return `${local[0]}***@${domain}`;
}

/**
 * Masks document numbers (ID, passport, etc.), showing only last 4 digits
 * @param document - The document number to mask
 * @returns Masked document (e.g., "***1234")
 */
export function maskDocument(document: string | undefined | null): string {
	if (!document) {
		return '***';
	}

	const str = String(document);

	if (str.length <= 4) {
		return '***';
	}

	return `***${str.slice(-4)}`;
}

/**
 * Recursively masks PII fields in an object
 * Common PII field names: account, accountNumber, phone, phoneNumber, email, password, token, apiKey, secret, etc.
 * @param obj - The object to mask
 * @returns New object with masked PII
 */
export function maskPIIInObject<T extends Record<string, any>>(obj: T): T {
	if (!obj || typeof obj !== 'object') {
		return obj;
	}

	const masked: any = Array.isArray(obj) ? [] : {};

	for (const [key, value] of Object.entries(obj)) {
		const lowerKey = key.toLowerCase();

		// Check for sensitive fields
		if (
			lowerKey.includes('password') ||
			lowerKey.includes('secret') ||
			lowerKey.includes('token') ||
			lowerKey.includes('apikey') ||
			lowerKey.includes('api_key') ||
			lowerKey === 'authorization'
		) {
			masked[key] = maskSensitive(value);
		} else if (lowerKey.includes('account') && !lowerKey.includes('accounttype') && !lowerKey.includes('account_type')) {
			masked[key] = typeof value === 'string' ? maskAccount(value) : value;
		} else if (lowerKey.includes('phone') || lowerKey.includes('telefono') || lowerKey.includes('celular')) {
			masked[key] = typeof value === 'string' ? maskPhone(value) : value;
		} else if (lowerKey.includes('email') || lowerKey.includes('correo')) {
			masked[key] = typeof value === 'string' ? maskEmail(value) : value;
		} else if (lowerKey.includes('document') || lowerKey.includes('cedula') || lowerKey.includes('rif') || lowerKey.includes('passport')) {
			masked[key] = typeof value === 'string' ? maskDocument(value) : value;
		} else if (
			lowerKey.includes('reference') ||
			lowerKey.includes('referencia') ||
			lowerKey.includes('transactionid') ||
			lowerKey.includes('transaction_id')
		) {
			masked[key] = typeof value === 'string' ? maskReference(value) : value;
		} else if (value && typeof value === 'object') {
			// Recursively mask nested objects
			masked[key] = maskPIIInObject(value);
		} else {
			masked[key] = value;
		}
	}

	return masked;
}
