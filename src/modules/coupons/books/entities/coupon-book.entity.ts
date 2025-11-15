import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Coupon } from '../../coupons/entities';

/**
 * Coupon Book Entity
 *
 * Represents a collection of coupons with shared configuration.
 * Each book can have thousands of individual coupon codes.
 *
 * Features:
 * - Configurable validity period
 * - Optional max redemptions per user
 * - Optional max assignments per user
 * - Support for code patterns (auto-generation)
 * - Support for uploaded codes
 * - Flexible metadata storage
 */
@Entity('coupon_books')
export class CouponBook {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ type: 'varchar', length: 255 })
	name: string;

	@Column({ type: 'text', nullable: true })
	description: string;

	@Column({ type: 'boolean', default: true })
	isActive: boolean;

	@Column({ type: 'timestamp', name: 'valid_from' })
	validFrom: Date;

	@Column({ type: 'timestamp', name: 'valid_until' })
	validUntil: Date;

	/**
	 * Maximum number of times a single user can redeem coupons from this book
	 * NULL = unlimited redemptions
	 */
	@Column({ type: 'int', nullable: true, name: 'max_redemptions_per_user' })
	maxRedemptionsPerUser: number | null;

	/**
	 * Maximum number of coupons a single user can be assigned from this book
	 * NULL = unlimited assignments
	 */
	@Column({ type: 'int', nullable: true, name: 'max_assignments_per_user' })
	maxAssignmentsPerUser: number | null;

	/**
	 * Pattern for auto-generating codes
	 * Example: "SUMMER{XXXX}" where X will be replaced with random characters
	 * NULL if codes are uploaded manually
	 */
	@Column({ type: 'varchar', length: 100, nullable: true, name: 'code_pattern' })
	codePattern: string | null;

	/**
	 * Maximum number of codes allowed in this book
	 * NULL = unlimited (for manual uploads without pattern)
	 * For books with pattern, this is the maximum that can be generated
	 */
	@Column({ type: 'int', nullable: true, name: 'max_codes' })
	maxCodes: number | null;

	/**
	 * Total number of codes currently in this book
	 * Updated when codes are generated or uploaded
	 */
	@Column({ type: 'int', name: 'total_codes', default: 0 })
	totalCodes: number;

	/**
	 * Flexible metadata storage for custom business rules
	 * Example: discount amount, applicable products, etc.
	 */
	@Column({ type: 'jsonb', nullable: true })
	metadata: Record<string, any> | null;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: Date;

	/**
	 * Relation to coupons
	 */
	@OneToMany(() => Coupon, (coupon) => coupon.couponBook)
	coupons: Coupon[];

	/**
	 * Virtual property: Check if book is currently valid
	 */
	get isValid(): boolean {
		const now = new Date();

		return this.isActive && now >= this.validFrom && now <= this.validUntil;
	}

	/**
	 * Virtual property: Check if book is expired
	 */
	get isExpired(): boolean {
		return new Date() > this.validUntil;
	}
}
