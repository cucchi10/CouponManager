import { ApiProperty } from '@nestjs/swagger';
import { TOKEN_TYPE } from '../auth.constants';

/**
 * Login Response DTO
 *
 * Response structure for successful login.
 */
export class LoginResponseDto {
	@ApiProperty({
		description: 'JWT access token',
		example:
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vIiwianRpIjoiZjQ3YWMxMGItNThmMi00YWFhLTg5NDItYzNkMmYxMjNlNDU2IiwiaWF0IjoxNjk5MjYwMDAwLCJleHAiOjE2OTkyNjM2MDB9.xxxxxx'
	})
	accessToken: string;

	@ApiProperty({
		description: 'Token type',
		example: TOKEN_TYPE
	})
	tokenType: string;
}
