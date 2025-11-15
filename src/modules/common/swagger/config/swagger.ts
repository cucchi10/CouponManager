import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { API_KEY_HEADER, API_KEY_SECURITY_SCHEME, API_PREFIX, MONITORING_TOKEN_HEADER } from '@/config/app.constants';
import { AUTH_SCHEME_BEARER } from '@/modules/auth/auth.constants';

export class SwaggerConfig {
	static setup(app: INestApplication) {
		const cfg = new DocumentBuilder()
			.setTitle('NestJS Boilerplate API')
			.setDescription('Production-ready NestJS API with TypeORM, Redis, and comprehensive architecture')
			.setVersion('1.0.0')
			.addBearerAuth({ type: 'http', scheme: AUTH_SCHEME_BEARER, bearerFormat: 'JWT', description: 'Authorization: Bearer <token>' }, 'jwt')
			.addApiKey(
				{
					type: 'apiKey',
					name: MONITORING_TOKEN_HEADER,
					in: 'header',
					description: 'Monitoring token for internal health check endpoints'
				},
				MONITORING_TOKEN_HEADER
			)
			.addApiKey(
				{
					type: 'apiKey',
					name: API_KEY_HEADER,
					in: 'header',
					description: 'API key for service authentication'
				},
				API_KEY_SECURITY_SCHEME
			)
			.addServer('/', 'Default')
			.build();

		const document = SwaggerModule.createDocument(app, cfg, {
			ignoreGlobalPrefix: false,
			deepScanRoutes: true,
			operationIdFactory: (_controllerKey: string, methodKey: string) => methodKey
		});

		app.getHttpAdapter().get(`/${API_PREFIX}/docs-json`, (_req, res) => res.json(document));

		SwaggerModule.setup(`${API_PREFIX}/docs`, app, document, {
			jsonDocumentUrl: `/${API_PREFIX}/docs-json`,
			swaggerOptions: {
				persistAuthorization: true,
				docExpansion: 'none',
				defaultModelsExpandDepth: -1,
				defaultModelExpandDepth: 2,
				displayRequestDuration: true,
				filter: true,
				tagsSorter: 'alpha',
				operationsSorter: 'alpha',
				tryItOutEnabled: true,
				syntaxHighlight: { activated: true }
			},
			customSiteTitle: 'API Documentation'
		});
	}
}
