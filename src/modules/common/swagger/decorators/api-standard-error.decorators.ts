import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '@/modules/common/filters';

import { ERROR_DESCRIPTIONS } from '../constants/error-texts';
import { ApiError } from '../utils/api-error.utils';
import { STATUS_CODES } from 'http';

export function ApiStandardErrors(
	opts: {
		forbidden?: boolean;
		unauthorized?: boolean;
		badRequest?: boolean;
		conflict?: boolean;
		internal?: boolean;
		businessError?: boolean;
		dependencyError?: boolean;
	} = {}
) {
	const {
		forbidden = false,
		unauthorized = false,
		badRequest = false,
		conflict = false,
		internal = false,
		businessError = false,
		dependencyError = false
	} = opts;
	const decos: MethodDecorator[] = [];

	if (badRequest) {
		decos.push(
			ApiError({
				status: HttpStatus.BAD_REQUEST,
				description: ERROR_DESCRIPTIONS[HttpStatus.BAD_REQUEST],
				exampleName: 'ValidationError',
				example: { code: ErrorCode.VALIDATION_ERROR, message: 'clientId must be a valid UUID' }
			})
		);
	}

	if (unauthorized) {
		decos.push(
			ApiError({
				status: HttpStatus.UNAUTHORIZED,
				description: ERROR_DESCRIPTIONS[HttpStatus.UNAUTHORIZED],
				exampleName: 'Unauthorized',
				example: { code: ErrorCode.UNAUTHORIZED_ERROR, message: 'Invalid or expired token' }
			})
		);
	}

	if (forbidden) {
		decos.push(
			ApiError({
				status: HttpStatus.FORBIDDEN,
				description: ERROR_DESCRIPTIONS[HttpStatus.FORBIDDEN],
				exampleName: 'Forbidden',
				example: { code: ErrorCode.FORBIDDEN_ERROR, message: 'Invalid or unauthorized API key' }
			})
		);
	}

	if (conflict) {
		decos.push(
			ApiError({
				status: HttpStatus.CONFLICT,
				description: ERROR_DESCRIPTIONS[409],
				exampleName: 'Conflict',
				example: { code: ErrorCode.CONFLICT, message: 'Resource conflict detected' }
			})
		);
	}

	if (internal) {
		decos.push(
			ApiError({
				status: HttpStatus.INTERNAL_SERVER_ERROR,
				description: ERROR_DESCRIPTIONS[HttpStatus.INTERNAL_SERVER_ERROR],
				exampleName: 'InternalServerError',
				example: { code: ErrorCode.INTERNAL_ERROR, message: STATUS_CODES[HttpStatus.INTERNAL_SERVER_ERROR]! }
			})
		);
	}

	if (businessError) {
		decos.push(
			ApiError({
				status: HttpStatus.UNPROCESSABLE_ENTITY,
				description: ERROR_DESCRIPTIONS[HttpStatus.UNPROCESSABLE_ENTITY],
				exampleName: 'BusinessError',
				example: {
					code: ErrorCode.BUSINESS_ERROR,
					message: 'Transaction outside processing window',
					details: { window: 'T-1 to T+1' }
				}
			})
		);
	}

	if (dependencyError) {
		decos.push(
			ApiError({
				status: HttpStatus.FAILED_DEPENDENCY,
				description: ERROR_DESCRIPTIONS[HttpStatus.FAILED_DEPENDENCY],
				exampleName: 'DependencyError',
				example: {
					code: ErrorCode.DEPENDENCY_ERROR,
					message: 'External service unavailable after retries',
					details: { service: 'ExternalService', attempts: 3 }
				}
			})
		);
	}

	return applyDecorators(...decos);
}
