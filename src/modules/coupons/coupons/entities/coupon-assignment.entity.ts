import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { Coupon } from './coupon.entity';

/**
 * Coupon Assignment Entity
 *
 * Tracks the assignment of coupons to users and their redemption history.
 * Supports multiple redemptions per user (if configured at book level).
 *
 * Features:
 * - Tracks assignment timestamp
 * - Records lock status and expiration
 * - Counts redemptions per user
 * - Stores redemption metadata
 * - Unique constraint per user-coupon pair
 */
@Entity('coupon_assignments')
@Unique(['couponId', 'userId'])
@Index(['userId', 'couponId'])
@Index(['couponId'])
@Index(['userId', 'redeemedAt'])
export class CouponAssignment {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ type: 'uuid', name: 'coupon_id' })
	couponId: string;

	@Column({ type: 'varchar', length: 255, name: 'user_id' })
	userId: string;

	@CreateDateColumn({ name: 'assigned_at' })
	assignedAt: Date;

	/**
	 * Timestamp when coupon was locked (for temporary lock during checkout)
	 * NULL if not currently locked
	 */
	@Column({ type: 'timestamp', nullable: true, name: 'locked_at' })
	lockedAt: Date | null;

	/**
	 * When the current lock expires
	 * NULL if not locked or after lock expiration
	 */
	@Column({ type: 'timestamp', nullable: true, name: 'lock_expires_at' })
	lockExpiresAt: Date | null;

	/**
	 * Timestamp of most recent redemption
	 * NULL if never redeemed
	 */
	@Column({ type: 'timestamp', nullable: true, name: 'redeemed_at' })
	redeemedAt: Date | null;

	/**
	 * Number of times this user has redeemed this coupon
	 * Supports multiple redemptions if configured at book level
	 */
	@Column({ type: 'int', default: 0, name: 'redemption_count' })
	redemptionCount: number;

	/**
	 * Flexible metadata storage for redemption context
	 * Example: order ID, purchase amount, applied discount, etc.
	 */
	@Column({ type: 'jsonb', nullable: true })
	metadata: Record<string, any> | null;

	/**
	 * Relation to coupon
	 */
	@ManyToOne(() => Coupon, (coupon) => coupon.assignments, {
		onDelete: 'CASCADE'
	})
	@JoinColumn({ name: 'coupon_id' })
	coupon: Coupon;

	/**
	 * Virtual property: Check if lock is still valid
	 */
	get isLocked(): boolean {
		if (!this.lockedAt || !this.lockExpiresAt) {
			return false;
		}

		return new Date() < this.lockExpiresAt;
	}

	/**
	 * Virtual property: Check if lock has expired
	 */
	get isLockExpired(): boolean {
		if (!this.lockExpiresAt) {
			return false;
		}

		return new Date() >= this.lockExpiresAt;
	}
}
