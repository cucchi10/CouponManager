import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { ErrorResponseDto } from '../dto';
import { EXAMPLE_CORRELATION_ID } from '../constants';
import { CORRELATION_ID_KEY } from '@/config/app.constants';
import { getStatusText, mapStatusToErrorCode } from '@/modules/common/filters';

type ApiErrorParams = {
	status: number;
	description: string;
	exampleName: string;
	example: Partial<Omit<ErrorResponseDto, 'success' | 'statusCode' | 'timestamp' | 'error' | 'correlationId'>> & {
		code?: string;
		message: string;
		path?: string;
		method?: string;
		[CORRELATION_ID_KEY]?: string;
	};
};

/**
 * Creates a standardized API error response decorator following RFC 7807
 * Uses the same logic as HttpExceptionFilter to ensure consistency
 *
 * @param status - HTTP status code
 * @param description - Error description for documentation
 * @param exampleName - Name of the example in Swagger UI
 * @param example - Example error response (statusCode, success, timestamp, error, and correlationId will be auto-generated)
 */
export function ApiError({ status, description, exampleName, example }: ApiErrorParams): MethodDecorator {
	const schemaRef = { $ref: getSchemaPath(ErrorResponseDto) };

	// Build complete error example with required fields using the same functions as HttpExceptionFilter
	const completeExample: ErrorResponseDto = {
		statusCode: status,
		success: false,
		error: getStatusText(status),
		message: example.message,
		code: example.code ?? mapStatusToErrorCode(status),
		...(example.details ? { details: example.details } : {}),
		path: example.path ?? '/api/endpoint',
		method: example.method ?? 'POST',
		timestamp: new Date().toISOString(),
		[CORRELATION_ID_KEY]: example[CORRELATION_ID_KEY] ?? EXAMPLE_CORRELATION_ID
	};

	return applyDecorators(
		ApiExtraModels(ErrorResponseDto),
		ApiResponse({
			status,
			description,
			content: {
				'application/json': {
					schema: schemaRef,
					examples: {
						[exampleName]: { value: completeExample }
					}
				}
			}
		})
	);
}
