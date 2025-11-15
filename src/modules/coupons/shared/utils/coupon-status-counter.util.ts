import { CouponStatus } from '../enums';

/**
 * Coupon Status Counter Utility
 *
 * Provides utilities for counting coupons by status.
 * Works with arrays of objects that have a `status` property.
 *
 * @example
 * const coupons = [
 *   { status: CouponStatus.ASSIGNED, ... },
 *   { status: CouponStatus.REDEEMED, ... }
 * ];
 * countByStatus(coupons, CouponStatus.REDEEMED)
 * // Returns: 1
 */
export class CouponStatusCounter {
	/**
	 * Count items in an array that match a specific status
	 *
	 * @param items - Array of items with a status property
	 * @param status - Status to count
	 * @returns Count of items with the specified status
	 */
	static countByStatus<T extends { status: CouponStatus }>(items: T[], status: CouponStatus): number {
		return items.filter((item) => item.status === status).length;
	}

	/**
	 * Count items in an array that do NOT match a specific status
	 *
	 * @param items - Array of items with a status property
	 * @param status - Status to exclude from count
	 * @returns Count of items without the specified status
	 */
	static countByNotStatus<T extends { status: CouponStatus }>(items: T[], status: CouponStatus): number {
		return items.filter((item) => item.status !== status).length;
	}

	/**
	 * Get count for a specific coupon status from SQL stats array
	 *
	 * Used when working with SQL query results where status and count come as strings.
	 *
	 * @param stats - Array of statistics from SQL query with status and count as strings
	 * @param status - Status to look for
	 * @returns Parsed count for the given status
	 *
	 * @example
	 * const stats = [
	 *   { status: 'available', count: '100' },
	 *   { status: 'assigned', count: '50' }
	 * ];
	 * getStatusCountFromStats(stats, CouponStatus.AVAILABLE)
	 * // Returns: 100
	 */
	static getStatusCountFromStats(stats: Array<{ status: string; count: string }>, status: CouponStatus): number {
		return parseInt(stats.find((s) => s.status === status)?.count || '0', 10);
	}
}
