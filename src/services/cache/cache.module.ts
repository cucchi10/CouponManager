import { Global, Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import { CacheConfigService } from './cache-config.service';
import { CACHE_BASE, CACHE_BUCKETS } from './cache-config.constants';

@Global()
@Module({
	providers: [
		CacheConfigService,
		{
			provide: CACHE_BASE,
			useFactory: async (cacheConfig: CacheConfigService) => {
				return await cacheConfig.createAndVerifyBaseClient();
			},
			inject: [CacheConfigService]
		},
		{
			provide: CACHE_BUCKETS,
			useFactory: async (cacheConfig: CacheConfigService, base) => {
				return await cacheConfig.createBuckets(base);
			},
			inject: [CacheConfigService, CACHE_BASE]
		},
		CacheService
	],
	exports: [CacheService]
})
export class CacheModule {}
