import { Logger } from '@nestjs/common';
import { EnvKey } from './config/environment';
import { createApp } from './config/app.bootstrap';
import { EnvironmentService } from './modules/common/environment/environment.service';

async function bootstrap() {
	const logger = new Logger('Bootstrap Server');

	const app = await createApp();

	const env = app.get(EnvironmentService);
	const port = env.getOrThrow<number>(EnvKey.PORT);
	const scope = env.getScope();

	await app.listen(port);

	logger.log(`Server is up and running on port ${port} in ${scope} scope`);
}

bootstrap();
