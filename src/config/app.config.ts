import { INestApplication, ValidationPipe } from '@nestjs/common';
import { API_PREFIX } from './app.constants';
import { ValidationException } from '@/modules/common/validation';

export class AppConfig {
	static setup(app: INestApplication) {
		// Global prefix
		app.setGlobalPrefix(API_PREFIX);

		// CORS configuration
		app.enableCors({
			origin: true,
			credentials: true
		});

		// Global validation pipe
		app.useGlobalPipes(
			new ValidationPipe({
				transform: true,
				whitelist: true,
				forbidNonWhitelisted: true,
				forbidUnknownValues: true,
				enableDebugMessages: false,
				transformOptions: {
					enableImplicitConversion: true,
					exposeDefaultValues: true
				},
				validationError: {
					target: false,
					value: false
				},

				exceptionFactory: (errors) => new ValidationException(errors)
			})
		);
	}
}
