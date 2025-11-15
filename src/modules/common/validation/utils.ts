import { ValidationError } from 'class-validator';
import { IValidationError } from './interfaces';

/**
 * Flattens nested validation errors from class-validator into a simple array.
 * Handles nested objects and arrays by creating dot-notation paths.
 *
 * @param errors - Array of ValidationError from class-validator
 * @param parentPath - Parent path for nested properties (used in recursion)
 * @returns Array of flattened validation errors with path and constraints
 *
 * @example
 * // Input: { property: 'user', children: [{ property: 'email', constraints: {...} }] }
 * // Output: [{ path: 'user.email', constraints: ['email must be valid'] }]
 */
export function flattenValidationErrors(errors: ValidationError[], parentPath = ''): IValidationError[] {
	const out: IValidationError[] = [];

	for (const err of errors) {
		const propertyPath = parentPath ? `${parentPath}.${err.property}` : err.property;

		if (err.constraints && Object.keys(err.constraints).length) {
			out.push({
				path: propertyPath,
				constraints: Object.values(err.constraints)
			});
		}

		if (err.children && err.children.length) {
			out.push(...flattenValidationErrors(err.children, propertyPath));
		}
	}

	return out;
}
