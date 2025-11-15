import { ApiProperty } from '@nestjs/swagger';
import { HealthStatus } from '../constants';

/**
 * Health check response DTO
 *
 * Standardized response containing health status and metadata.
 * Used for monitoring systems and load balancers.
 */
export class HealthResponseDto {
	@ApiProperty({
		description: 'Health status of the application',
		enum: HealthStatus,
		example: HealthStatus.UP,
		type: String
	})
	status: HealthStatus;

	@ApiProperty({
		description: 'HTTP status code',
		example: 200,
		type: Number
	})
	statusCode: number;

	@ApiProperty({
		description: 'Standardized success code',
		example: 'OK',
		type: String
	})
	code: string;

	@ApiProperty({
		description: 'Message describing the health status',
		example: 'Service is healthy',
		type: String
	})
	message: string;
}
