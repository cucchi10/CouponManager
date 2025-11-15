import { applyDecorators, Type } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiExtraModels, ApiBearerAuth, ApiBody, ApiParam, getSchemaPath } from '@nestjs/swagger';
import { ApiStandardErrors } from './api-standard-error.decorators';
import { SuccessResponseDto } from '../dto';

type JwtEndpointOptions<TRequest = unknown, TResponse = unknown> = {
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

	// Path parameters
	pathParams?: Array<{
		name: string;
		description: string;
		example?: string;
	}>;

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
 * Decorator for endpoints that require JWT authentication
 *
 * Applies Swagger documentation with JWT Bearer auth, operation details, and standard error responses.
 * Use this for user-facing endpoints that require JWT token.
 */
export function ApiJwtEndpoint<TRequest = unknown, TResponse = unknown>(options: JwtEndpointOptions<TRequest, TResponse>) {
	const {
		summary,
		description,
		operationId,
		requestDto,
		responseDto,
		isArray = false,
		responseDescription = 'Success',
		useSuccessWrapper = true,
		pathParams,
		standardErrors
	} = options;

	const decorators: MethodDecorator[] = [];

	// Add JWT Bearer authentication requirement
	decorators.push(ApiBearerAuth('jwt'));

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

	// Add path parameters if provided
	if (pathParams) {
		pathParams.forEach((param) => {
			decorators.push(
				ApiParam({
					name: param.name,
					description: param.description,
					...(param.example && { example: param.example })
				})
			);
		});
	}

	// Add ApiOkResponse with or without wrapper
	if (useSuccessWrapper) {
		if (isArray) {
			decorators.push(
				ApiOkResponse({
					description: responseDescription,
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
		}
	} else {
		decorators.push(
			ApiOkResponse({
				description: responseDescription,
				type: responseDto,
				...(isArray && { isArray: true })
			})
		);
	}

	// Add standard error responses
	decorators.push(
		ApiStandardErrors({
			forbidden: standardErrors?.forbidden ?? false,
			unauthorized: standardErrors?.unauthorized ?? true, // JWT endpoints typically need unauthorized
			badRequest: standardErrors?.badRequest ?? true,
			conflict: standardErrors?.conflict ?? false,
			internal: standardErrors?.internal ?? true,
			businessError: standardErrors?.businessError ?? false,
			dependencyError: standardErrors?.dependencyError ?? false
		})
	);

	return applyDecorators(...decorators);
}
