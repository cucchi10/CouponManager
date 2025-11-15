import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Safely compares two values in constant time using an HMAC-based approach.
 *
 * This function:
 * - Produces a fixed-length HMAC digest for both inputs (prevents length leaks).
 * - Uses a server-side secret key to avoid precomputation attacks.
 * - Performs a constant-time comparison with `timingSafeEqual`.
 *
 * @param expectedValue - The expected value to compare against.
 * @param providedValue - The value to check.
 * @param secret - HMAC key (REQUIRED). Must be obtained from EnvironmentService in NestJS.
 * @param options - Optional settings for comparison.
 * @param options.algorithm - Hash algorithm (`sha256` or `sha512`). Default is `sha256`.
 * @param options.maxInputLength - Max input length to mitigate DoS risks. Default is `4096`.
 * @param options.encoding - Encoding used for string inputs. Default is `utf8`.
 * @returns `true` if both values match, `false` otherwise.
 */
export function safeEqual(
	expectedValue: string | Buffer | null | undefined,
	providedValue: string | Buffer | null | undefined,
	secret: string | Buffer,
	options?: {
		algorithm?: 'sha256' | 'sha512';
		maxInputLength?: number;
		encoding?: BufferEncoding;
	}
): boolean {
	const { algorithm = 'sha256', maxInputLength = 4096, encoding = 'utf8' } = options || {};

	// Normalize all inputs to Buffer form (empty string for null/undefined)
	const toBuffer = (value: string | Buffer | null | undefined): Buffer =>
		Buffer.isBuffer(value) ? value : Buffer.from(String(value ?? ''), encoding);

	let expectedBuf = toBuffer(expectedValue);
	let providedBuf = toBuffer(providedValue);

	// Defensive input size limiting (prevents large input abuse)
	if (expectedBuf.length > maxInputLength) {
		expectedBuf = expectedBuf.subarray(0, maxInputLength);
	}

	if (providedBuf.length > maxInputLength) {
		providedBuf = providedBuf.subarray(0, maxInputLength);
	}

	// Compute fixed-length HMAC digests
	const expectedDigest = createHmac(algorithm, secret).update(expectedBuf).digest();
	const providedDigest = createHmac(algorithm, secret).update(providedBuf).digest();

	// Constant-time comparison (same length guaranteed)
	return timingSafeEqual(expectedDigest, providedDigest);
}
