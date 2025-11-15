import { Body, Controller, HttpCode, HttpStatus, Post, UnauthorizedException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SkipJwt } from '@/decorators';
import { ErrorCode } from '@/modules/common/filters';
import { TOKEN_TYPE } from './auth.constants';
import { LoginDto, LoginResponseDto } from './dto';
import { ApiLoginEndpoint } from '@/modules/common/swagger/decorators';

/**
 * Authentication Controller
 *
 * Handles user authentication and JWT token generation.
 */
@ApiTags('auth')
@Controller('auth')
@SkipJwt()
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	/**
	 * Login endpoint
	 *
	 * Validates user credentials and generates a JWT token.
	 *
	 * @example
	 * POST /api/auth/login
	 * Body: { "username": "demo", "password": "demo123" }
	 */
	@Post('login')
	@HttpCode(HttpStatus.OK)
	@ApiLoginEndpoint({
		summary: 'Login',
		description: 'Validates user credentials and generates a JWT token.\n\n**Default credentials:**\n- Username: `demo`\n- Password: `demo123`',
		requestDto: LoginDto,
		responseDto: LoginResponseDto
	})
	async login(@Body() loginDto: LoginDto) {
		const isValid = await this.authService.validateCredentials(loginDto.username, loginDto.password);

		if (!isValid) {
			throw new UnauthorizedException({
				message: 'Invalid credentials',
				code: ErrorCode.UNAUTHORIZED_ERROR
			});
		}

		const token = await this.authService.generateToken({
			sub: loginDto.username
		});

		return {
			accessToken: token,
			tokenType: TOKEN_TYPE
		};
	}
}
