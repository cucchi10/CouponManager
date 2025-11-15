import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Login DTO
 *
 * Data Transfer Object for user login.
 * This is a MOCK implementation for demonstration purposes.
 */
export class LoginDto {
	@ApiProperty({
		description: 'Username',
		example: 'demo',
		minLength: 3
	})
	@IsString()
	@IsNotEmpty()
	@MinLength(3)
	username: string;

	@ApiProperty({
		description: 'Password',
		example: 'demo123',
		minLength: 6
	})
	@IsString()
	@IsNotEmpty()
	@MinLength(6)
	password: string;
}
