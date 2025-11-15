import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ClsModule } from 'nestjs-cls';

import { CommonModule } from './modules/common/common.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { CouponsModule } from './modules/coupons/coupons.module';

import { DatabaseConfigService } from './services/database/database-config.service';
import { HttpExceptionFilter } from './modules/common/filters';
import { CorrelationIdMiddleware } from './middleware';
import { ObservabilityInterceptor, ResponseTransformInterceptor } from './interceptors';
import { CacheModule } from './services/cache/cache.module';
import { JwtAuthGuard } from './guards';

@Module({
	imports: [
		ClsModule.forRoot({
			global: true,
			middleware: {
				mount: true
			}
		}),
		TypeOrmModule.forRootAsync({
			extraProviders: [DatabaseConfigService],
			inject: [DatabaseConfigService],
			useFactory: async (dbConfig: DatabaseConfigService) => dbConfig.getConfig()
		}),
		AuthModule,
		CacheModule,
		CommonModule,
		CouponsModule,
		HealthModule
	],
	providers: [
		{
			provide: APP_FILTER,
			useClass: HttpExceptionFilter
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: ObservabilityInterceptor
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: ResponseTransformInterceptor
		},
		{
			provide: APP_GUARD,
			useClass: JwtAuthGuard
		}
	]
})
export class AppModule implements NestModule {
	/**
	 * Configure middleware to run before guards, interceptors, and filters
	 * This ensures correlation ID is always available
	 */
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(CorrelationIdMiddleware).forRoutes('*');
	}
}
