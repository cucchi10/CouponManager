import { applyDecorators, Type } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiUnauthorizedResponse, ApiExtraModels, ApiSecurity, getSchemaPath } from '@nestjs/swagger';
import { MONITORING_TOKEN_HEADER } from '@/config/app.constants';
import { SuccessResponseDto } from '../dto';

type HealthEndpointOptions = {
	// Operation metadata
	summary: string;
	description: string;
	operationId?: string;

	// Response DTO
	responseDto: Type;

	// Response descriptions (optional customization)
	okDescription?: string;
	unauthorizedDescription?: string;
	useSuccessWrapper?: boolean; // Whether to wrap response in SuccessResponseDto (default: false, health endpoints typically skip transform)
};

/**
 * Decorator for health check endpoints with monitoring authentication
 *
 * Applies Swagger documentation with the essential responses for health checks
 */
export function ApiHealthEndpoint(options: HealthEndpointOptions) {
	const {
		summary,
		description,
		operationId,
		responseDto,
		okDescription = 'Health check result. HTTP 200 always returned, check statusCode in body (200=UP, 503=DOWN)',
		unauthorizedDescription = 'Missing or invalid monitoring token',
		useSuccessWrapper = false
	} = options;

	const decorators: MethodDecorator[] = [];

	// Add monitoring token authentication requirement (custom header)
	decorators.push(ApiSecurity(MONITORING_TOKEN_HEADER));

	// Add responseDto to extraModels for $ref support
	decorators.push(ApiExtraModels(responseDto));

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
				description: okDescription,
				content: {
					'application/json': {
						schema: {
							allOf: [
								{ $ref: getSchemaPath(SuccessResponseDto) },
								{
									properties: {
										data: { $ref: getSchemaPath(responseDto) }
									}
								}
							]
						},
						examples: {
							healthy: {
								summary: 'Service Healthy',
								value: {
									statusCode: 200,
									success: true,
									code: 'OK',
									data: {
										status: 'UP',
										statusCode: 200,
										code: 'OK',
										message: 'Service is healthy'
									},
									message: 'Request successful',
									path: '/api/client/health',
									method: 'GET',
									timestamp: new Date().toISOString(),
									correlationId: '550e8400-e29b-41d4-a716-446655440000'
								}
							},
							unhealthy: {
								summary: 'Service Unavailable',
								value: {
									statusCode: 200,
									success: true,
									code: 'OK',
									data: {
										code: 'SERVICE_UNAVAILABLE',
										statusCode: 503,
										message: 'Service Unavailable',
										status: 'DOWN'
									},
									message: 'Request successful',
									path: '/api/client/health',
									method: 'GET',
									timestamp: new Date().toISOString(),
									correlationId: '550e8400-e29b-41d4-a716-446655440000'
								}
							}
						}
					}
				}
			})
		);
	} else {
		// Add ApiOkResponse - Always returns HTTP 200, but body can indicate UP or DOWN
		decorators.push(
			ApiOkResponse({
				description: okDescription,
				content: {
					'application/json': {
						examples: {
							healthy: {
								summary: 'Service Healthy',
								value: {
									status: 'UP',
									statusCode: 200,
									code: 'OK',
									message: 'Service is healthy'
								}
							},
							unhealthy: {
								summary: 'Service Unavailable',
								value: {
									code: 'SERVICE_UNAVAILABLE',
									statusCode: 503,
									message: 'Service Unavailable',
									status: 'DOWN'
								}
							}
						}
					}
				}
			})
		);
	}

	// Add ApiUnauthorizedResponse
	decorators.push(
		ApiUnauthorizedResponse({
			description: unauthorizedDescription,
			content: {
				'application/json': {
					examples: {
						unauthorized: {
							summary: 'Invalid monitoring token',
							value: {
								statusCode: 401,
								success: false,
								error: 'UNAUTHORIZED',
								message: 'Invalid monitoring token',
								code: 'UNAUTHORIZED_ERROR',
								path: '/api/client/health',
								method: 'GET',
								timestamp: '2025-11-13T12:48:06.717Z',
								correlationId: 'e98cd5d4-4fca-42ea-b401-7de643192eab'
							}
						}
					}
				}
			}
		})
	);

	return applyDecorators(...decorators);
}
