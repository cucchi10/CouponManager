import { Transform } from 'class-transformer';
import { CodeNormalizer } from '../utils';

/**
 * Decorator to automatically normalize a single coupon code to uppercase
 *
 * Use this decorator on DTO properties that receive coupon codes.
 * The code will be automatically normalized to uppercase before validation.
 *
 * @example
 * class MyDto {
 *   @NormalizeCode()
 *   @IsString()
 *   code: string;
 * }
 */
export const NormalizeCode = () => {
	return Transform(({ value }) => {
		if (typeof value === 'string') {
			return CodeNormalizer.normalizeCode(value);
		}

		return value;
	});
};

/**
 * Decorator to automatically normalize an array of coupon codes to uppercase
 *
 * Use this decorator on DTO properties that receive arrays of coupon codes.
 * All codes in the array will be automatically normalized to uppercase before validation.
 *
 * @example
 * class MyDto {
 *   @NormalizeCodes()
 *   @IsArray()
 *   codes: string[];
 * }
 */
export const NormalizeCodes = () => {
	return Transform(({ value }) => {
		if (Array.isArray(value)) {
			return CodeNormalizer.normalizeCodes(value);
		}

		return value;
	});
};
