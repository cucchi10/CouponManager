import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	OneToMany,
	JoinColumn,
	Index,
	VersionColumn
} from 'typeorm';
import { CouponBook } from '../../books/entities';
import { CouponAssignment } from './coupon-assignment.entity';
import { CouponStatus } from '../../shared/enums';

/**
 * Coupon Entity
 *
 * Represents an individual coupon code within a coupon book.
 * Uses optimistic locking (version) to prevent race conditions.
 *
 * Features:
 * - Unique code across all books
 * - Status tracking (available, assigned, locked, redeemed, expired)
 * - Optimistic locking for concurrent updates
 * - Relation to assignments for multi-redemption support
 */
@Entity('coupons')
@Index(['couponBookId', 'status'])
@Index(['status'])
export class Coupon {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ type: 'uuid', name: 'coupon_book_id' })
	couponBookId: string;

	@Column({ type: 'varchar', length: 32, unique: true })
	code: string;

	@Column({
		type: 'enum',
		enum: CouponStatus,
		default: CouponStatus.AVAILABLE
	})
	status: CouponStatus;

	/**
	 * Version column for optimistic locking
	 * Automatically incremented by TypeORM on each update
	 * Used to detect concurrent modifications
	 */
	@VersionColumn({ default: 1 })
	version: number;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: Date;

	/**
	 * Relation to coupon book
	 */
	@ManyToOne(() => CouponBook, (book) => book.coupons, {
		onDelete: 'CASCADE'
	})
	@JoinColumn({ name: 'coupon_book_id' })
	couponBook: CouponBook;

	/**
	 * Relation to assignments (for multi-redemption tracking)
	 */
	@OneToMany(() => CouponAssignment, (assignment) => assignment.coupon)
	assignments: CouponAssignment[];
}
