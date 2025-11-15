import { ApiProperty } from '@nestjs/swagger';

/**
 * Profile Response DTO
 *
 * User profile information from JWT token.
 */
export class ProfileResponseDto {
	@ApiProperty({
		description: 'User ID from JWT token',
		example: 'demo'
	})
	userId: string;

	@ApiProperty({
		description: 'JWT token ID',
		example: 'f47ac10b-58f2-4aaa-8942-c3d2f123e456'
	})
	tokenId: string;

	@ApiProperty({
		description: 'Token issued at timestamp (ISO 8601)',
		example: '2024-11-13T10:30:00.000Z'
	})
	issuedAt: string;

	@ApiProperty({
		description: 'Token expiration timestamp (ISO 8601)',
		example: '2024-11-13T11:30:00.000Z'
	})
	expiresAt: string;
}
