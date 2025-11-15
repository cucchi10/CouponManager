import { CouponAssignment } from './entities';

/**
 * Result of assigning a coupon in a transaction
 */
export interface AssignmentTransactionResult {
	assignment: CouponAssignment;
	couponCode: string;
}
