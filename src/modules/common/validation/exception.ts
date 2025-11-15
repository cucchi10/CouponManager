import { BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { VALIDATION_ERROR_CODE, VALIDATION_ERROR_MESSAGE } from './constants';
import { flattenValidationErrors } from './utils';

/**
 * Custom exception for validation errors.
 * Extends BadRequestException to provide consistent error response format.
 *
 * @example
 * throw new ValidationException(validationErrors);
 * // Response: { message: 'Validation error', code: 'VALIDATION_ERROR', details: [...] }
 */
export class ValidationException extends BadRequestException {
	constructor(errors: ValidationError[]) {
		super({
			message: VALIDATION_ERROR_MESSAGE,
			code: VALIDATION_ERROR_CODE,
			details: flattenValidationErrors(errors)
		});
	}
}
