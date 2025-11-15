import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { AppConfig } from './app.config';
import { SwaggerConfig } from '@/modules/common/swagger/config/swagger';

export async function createApp() {
	const app = await NestFactory.create(AppModule, { bufferLogs: true });

	AppConfig.setup(app);

	SwaggerConfig.setup(app);

	return app;
}
