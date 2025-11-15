import { applyDecorators, HttpStatus, Type } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiCreatedResponse, ApiExtraModels, ApiSecurity, ApiBody, getSchemaPath } from '@nestjs/swagger';
import { API_KEY_SECURITY_SCHEME } from '@/config/app.constants';
import { ApiStandardErrors } from './api-standard-error.decorators';
import { SuccessResponseDto } from '../dto';

type ApiKeyEndpointOptions<TRequest = unknown, TResponse = unknown> = {
	// Operation metadata
	summary: string;
	description: string;
	operationId?: string;

	// Request/Response DTOs
	requestDto?: Type<TRequest>;
	responseDto: Type<TResponse>;
	isArray?: boolean; // For array responses
	responseDescription?: string;
	useSuccessWrapper?: boolean; // Whether to wrap response in SuccessResponseDto (default: true)
	statusCode?: HttpStatus.OK | HttpStatus.CREATED; // HTTP status code (default: 200)

	// Error responses configuration
	standardErrors?: {
		forbidden?: boolean;
		unauthorized?: boolean;
		badRequest?: boolean;
		conflict?: boolean;
		internal?: boolean;
		businessError?: boolean;
		dependencyError?: boolean;
	};
};

/**
 * Decorator for endpoints that require API Key authentication
 *
 * Applies Swagger documentation with API Key security, operation details, and standard error responses.
 * Use this for administrative endpoints that require x-api-key header.
 */
export function ApiApiKeyEndpoint<TRequest = unknown, TResponse = unknown>(options: ApiKeyEndpointOptions<TRequest, TResponse>) {
	const {
		summary,
		description,
		operationId,
		requestDto,
		responseDto,
		isArray = false,
		responseDescription = 'Success',
		useSuccessWrapper = true,
		statusCode = 200,
		standardErrors
	} = options;

	const decorators: MethodDecorator[] = [];

	// Add API Key security requirement
	decorators.push(ApiSecurity(API_KEY_SECURITY_SCHEME));

	// Add responseDto to extraModels for $ref support
	decorators.push(ApiExtraModels(responseDto));

	// Add SuccessResponseDto if using wrapper
	if (useSuccessWrapper) {
		decorators.push(ApiExtraModels(SuccessResponseDto));
	}

	// Add requestDto to extraModels if provided
	if (requestDto) {
		decorators.push(ApiExtraModels(requestDto));
	}

	// Add ApiOperation
	decorators.push(
		ApiOperation({
			...(operationId && { operationId }),
			summary,
			description
		})
	);

	// Add ApiBody if requestDto is provided
	if (requestDto) {
		decorators.push(ApiBody({ type: requestDto }));
	}

	const isCreated = statusCode === HttpStatus.CREATED;

	// Choose response decorator based on statusCode
	const ResponseDecorator = isCreated ? ApiCreatedResponse : ApiOkResponse;
	const defaultDescription = isCreated ? 'Resource created successfully' : 'Success';

	// Add response decorator with or without wrapper
	if (useSuccessWrapper) {
		if (isArray) {
			decorators.push(
				ResponseDecorator({
					description: responseDescription || defaultDescription,
					schema: {
						allOf: [
							{ $ref: getSchemaPath(SuccessResponseDto) },
							{
								properties: {
									data: {
										type: 'array',
										items: { $ref: getSchemaPath(responseDto) }
									}
								}
							}
						]
					}
				})
			);
		} else {
			decorators.push(
				ResponseDecorator({
					description: responseDescription || defaultDescription,
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
		}
	} else {
		decorators.push(
			ResponseDecorator({
				description: responseDescription || defaultDescription,
				type: responseDto,
				...(isArray && { isArray: true })
			})
		);
	}

	// Add standard error responses
	decorators.push(
		ApiStandardErrors({
			forbidden: standardErrors?.forbidden ?? true, // API Key endpoints typically need forbidden
			unauthorized: standardErrors?.unauthorized ?? true, // API Key endpoints typically need unauthorized
			badRequest: standardErrors?.badRequest ?? true,
			conflict: standardErrors?.conflict ?? false,
			internal: standardErrors?.internal ?? true,
			businessError: standardErrors?.businessError ?? false,
			dependencyError: standardErrors?.dependencyError ?? false
		})
	);

	return applyDecorators(...decorators);
}
