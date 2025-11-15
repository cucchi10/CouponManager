import { applyDecorators, Type } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiExtraModels, ApiUnauthorizedResponse, getSchemaPath } from '@nestjs/swagger';
import { ApiStandardErrors } from './api-standard-error.decorators';
import { ErrorCode } from '@/modules/common/filters';
import { SuccessResponseDto } from '../dto';

type LoginEndpointOptions<TRequest = unknown, TResponse = unknown> = {
	// Operation metadata
	summary: string;
	description: string;
	operationId?: string;

	// Request/Response DTOs
	requestDto: Type<TRequest>;
	responseDto: Type<TResponse>;
	responseDescription?: string;
	useSuccessWrapper?: boolean; // Whether to wrap response in SuccessResponseDto (default: true)

	// Error responses configuration
	standardErrors?: {
		badRequest?: boolean;
		internal?: boolean;
	};
};

/**
 * Decorator for login endpoints
 *
 * Applies Swagger documentation with operation details, success response, and standard error responses.
 * Includes specific Unauthorized response for invalid credentials.
 */
export function ApiLoginEndpoint<TRequest = unknown, TResponse = unknown>(options: LoginEndpointOptions<TRequest, TResponse>) {
	const {
		summary,
		description,
		operationId,
		requestDto,
		responseDto,
		responseDescription = 'Login successful',
		useSuccessWrapper = true,
		standardErrors
	} = options;

	const decorators: MethodDecorator[] = [];

	// Add DTOs to extraModels for $ref support
	decorators.push(ApiExtraModels(requestDto, responseDto));

	// Add SuccessResponseDto if using wrapper
	if (useSuccessWrapper) {
		decorators.push(ApiExtraModels(SuccessResponseDto));
	}

	// Add ApiOperation
	decorators.push(
		ApiOperation({
			...(operationId && { operationId }),
			summary,
			description
		})
	);

	// Add ApiOkResponse with or without wrapper
	if (useSuccessWrapper) {
		decorators.push(
			ApiOkResponse({
				description: responseDescription,
				schema: {
					allOf: [
						{ $ref: getSchemaPath(SuccessResponseDto) },
						{
							properties: {
								data: { $ref: getSchemaPath(responseDto) }
							}
						}
					]
				}
			})
		);
	} else {
		decorators.push(
			ApiOkResponse({
				description: responseDescription,
				type: responseDto
			})
		);
	}

	// Add specific Unauthorized response for invalid credentials
	decorators.push(
		ApiUnauthorizedResponse({
			description: 'Invalid credentials',
			content: {
				'application/json': {
					examples: {
						invalidCredentials: {
							summary: 'Invalid credentials',
							value: {
								statusCode: 401,
								success: false,
								error: 'UNAUTHORIZED',
								message: 'Invalid credentials',
								code: ErrorCode.UNAUTHORIZED_ERROR,
								path: '/api/auth/login',
								method: 'POST',
								timestamp: new Date().toISOString(),
								correlationId: '550e8400-e29b-41d4-a716-446655440000'
							}
						}
					}
				}
			}
		})
	);

	// Add standard error responses (no unauthorized here, we have custom one above)
	decorators.push(
		ApiStandardErrors({
			forbidden: false,
			unauthorized: false, // Custom unauthorized response above
			badRequest: standardErrors?.badRequest ?? true,
			conflict: false,
			internal: standardErrors?.internal ?? true,
			businessError: false,
			dependencyError: false
		})
	);

	return applyDecorators(...decorators);
}
