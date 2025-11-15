/**
 * Coupon Status Enum
 *
 * Represents the lifecycle states of a coupon code.
 */
export enum CouponStatus {
	/**
	 * Coupon is available for assignment
	 */
	AVAILABLE = 'available',

	/**
	 * Coupon has been assigned to a user but not locked/redeemed
	 */
	ASSIGNED = 'assigned',

	/**
	 * Coupon is temporarily locked during redemption attempt
	 * Lock expires automatically after configured duration
	 */
	LOCKED = 'locked',

	/**
	 * Coupon has been fully redeemed (no more uses available)
	 */
	REDEEMED = 'redeemed',

	/**
	 * Coupon has expired (past coupon book validity period)
	 */
	EXPIRED = 'expired'
}
