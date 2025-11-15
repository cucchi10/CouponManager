/**
 * Cache feature names for coupon operations
 * Used to identify different types of cache operations (locks, deduplication, etc.)
 */
export enum CacheFeature {
	COUPON_LOCK = 'coupon-lock',
	COUPON_REDEEM = 'coupon-redeem'
}
