import * as crypto from 'crypto';
import { BadRequestException } from '@nestjs/common';
import { ErrorCode } from '@/modules/common/filters';

/**
 * Code Generator Utility
 *
 * Generates unique coupon codes based on patterns.
 * Uses cryptographic randomness for security.
 *
 * Supported placeholders:
 * - {X} or {XX...} = Random uppercase letters (A-Z)
 * - {9} or {99...} = Random digits (0-9)
 * - {*} or {**...} = Random alphanumeric (A-Z0-9)
 *
 * @example
 * generateCodes('SUMMER{XXXX}', 1000)
 * // Returns: ['SUMMERABCD', 'SUMMEREFGH', ...]
 *
 * @example
 * generateCodes('SAVE{99}-{XXX}', 100)
 * // Returns: ['SAVE42-ABC', 'SAVE87-XYZ', ...]
 */
export class CodeGenerator {
	private static readonly CHARSET_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	private static readonly CHARSET_DIGITS = '0123456789';
	private static readonly CHARSET_ALPHANUMERIC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

	/**
	 * Generate unique coupon codes based on a pattern
	 *
	 * @param pattern - Code pattern with placeholders
	 * @param count - Number of unique codes to generate
	 * @returns Array of unique coupon codes
	 * @throws BadRequestException if unable to generate enough unique codes
	 */
	static generateCodes(pattern: string, count: number): string[] {
		const codes = new Set<string>();
		let attempts = 0;
		const maxAttempts = count * 10; // Prevent infinite loop

		while (codes.size < count && attempts < maxAttempts) {
			const code = this.generateSingleCode(pattern);

			codes.add(code);
			attempts++;
		}

		if (codes.size < count) {
			throw new BadRequestException({
				message:
					`Unable to generate ${count} unique codes with pattern "${pattern}". ` +
					`Generated ${codes.size} unique codes after ${attempts} attempts. ` +
					`Consider using a more diverse pattern.`,
				code: ErrorCode.VALIDATION_ERROR
			});
		}

		return Array.from(codes);
	}

	/**
	 * Extract placeholder length by removing the curly braces
	 *
	 * @param match - Matched placeholder string (e.g., "{XXXX}")
	 * @returns Length of the placeholder content
	 */
	private static getPlaceholderLength(match: string): number {
		return match.length - 2; // Remove {}
	}

	/**
	 * Generate a single code from pattern
	 *
	 * @param pattern - Code pattern with placeholders
	 * @returns Generated code
	 */
	private static generateSingleCode(pattern: string): string {
		let code = pattern;

		// Replace {X+} with random letters
		code = code.replace(/\{X+\}/gi, (match) => {
			const length = this.getPlaceholderLength(match);

			return this.randomString(length, this.CHARSET_LETTERS);
		});

		// Replace {9+} with random digits
		code = code.replace(/\{9+\}/g, (match) => {
			const length = this.getPlaceholderLength(match);

			return this.randomString(length, this.CHARSET_DIGITS);
		});

		// Replace {*+} with random alphanumeric
		code = code.replace(/\{\*+\}/g, (match) => {
			const length = this.getPlaceholderLength(match);

			return this.randomString(length, this.CHARSET_ALPHANUMERIC);
		});

		return code;
	}

	/**
	 * Generate cryptographically random string
	 *
	 * @param length - Length of the string
	 * @param charset - Character set to use
	 * @returns Random string
	 */
	private static randomString(length: number, charset: string): string {
		const result = [];

		for (let i = 0; i < length; i++) {
			const randomIndex = crypto.randomInt(0, charset.length);

			result.push(charset[randomIndex]);
		}

		return result.join('');
	}

	/**
	 * Validate code pattern
	 *
	 * @param pattern - Pattern to validate
	 * @returns True if pattern is valid
	 */
	static validatePattern(pattern: string): boolean {
		// Check if pattern contains at least one placeholder
		const hasPlaceholder = /\{[X9*]+\}/i.test(pattern);

		// Check if pattern uses only allowed characters
		const validChars = /^[A-Z0-9{}\-_]+$/i.test(pattern);

		return hasPlaceholder && validChars;
	}

	/**
	 * Estimate maximum unique codes possible with a pattern
	 *
	 * @param pattern - Code pattern
	 * @returns Estimated max unique codes
	 */
	static estimateMaxUniqueCodes(pattern: string): number {
		let combinations = 1;

		// Count {X} placeholders
		const letterMatches = pattern.match(/\{X+\}/gi) || [];

		letterMatches.forEach((match) => {
			const length = this.getPlaceholderLength(match);

			combinations *= Math.pow(this.CHARSET_LETTERS.length, length);
		});

		// Count {9} placeholders
		const digitMatches = pattern.match(/\{9+\}/g) || [];

		digitMatches.forEach((match) => {
			const length = this.getPlaceholderLength(match);

			combinations *= Math.pow(this.CHARSET_DIGITS.length, length);
		});

		// Count {*} placeholders
		const alphanumMatches = pattern.match(/\{\*+\}/g) || [];

		alphanumMatches.forEach((match) => {
			const length = this.getPlaceholderLength(match);

			combinations *= Math.pow(this.CHARSET_ALPHANUMERIC.length, length);
		});

		return combinations;
	}
}
