import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouponBook } from './books/entities';
import { Coupon, CouponAssignment } from './coupons/entities';
import { CouponBooksService } from './books/coupon-books.service';
import { CouponsService } from './coupons/coupons.service';
import { CouponBooksController } from './books/coupon-books.controller';
import { CouponsController } from './coupons/coupons.controller';

/**
 * Coupons Module
 *
 * Provides a complete coupon book management system with:
 * - Coupon book creation and management
 * - Code upload and auto-generation
 * - Random and specific coupon assignment
 * - Temporary locking during checkout
 * - Redemption with concurrency control
 * - User coupon tracking
 *
 * Features:
 * - Multi-layer locking (Redis + Database)
 * - Optimistic locking for race condition prevention
 * - Configurable redemption limits
 * - Flexible metadata storage
 * - Comprehensive audit trail
 *
 * Database Entities:
 * - CouponBook: Collection of coupons with shared rules
 * - Coupon: Individual coupon code
 * - CouponAssignment: Tracks user assignments and redemptions
 *
 * Controllers:
 * - CouponBooksController: CRUD for coupon books and codes
 * - CouponsController: Assignment, locking, and redemption
 *
 * Services:
 * - CouponBooksService: Book and code management
 * - CouponsService: Assignment and redemption logic
 */
@Module({
	imports: [TypeOrmModule.forFeature([CouponBook, Coupon, CouponAssignment])],
	controllers: [CouponBooksController, CouponsController],
	providers: [CouponBooksService, CouponsService],
	exports: [CouponBooksService, CouponsService]
})
export class CouponsModule {}
