/**
 * Code Normalizer Utility
 *
 * Provides utilities for normalizing coupon codes to uppercase.
 * Ensures consistent code format across the application.
 *
 * @example
 * normalizeCode('save20-abc123')
 * // Returns: 'SAVE20-ABC123'
 *
 * @example
 * normalizeCodes(['save20-abc', 'save20-def'])
 * // Returns: ['SAVE20-ABC', 'SAVE20-DEF']
 */
export class CodeNormalizer {
	/**
	 * Normalizes a single coupon code to uppercase
	 *
	 * @param code - Coupon code to normalize
	 * @returns Normalized code in uppercase
	 */
	static normalizeCode(code: string): string {
		return code.toUpperCase();
	}

	/**
	 * Normalizes an array of coupon codes to uppercase
	 *
	 * @param codes - Array of codes to normalize
	 * @returns Normalized array of codes in uppercase
	 */
	static normalizeCodes(codes: string[]): string[] {
		return codes.map((code) => this.normalizeCode(code));
	}
}
