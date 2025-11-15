import { IsObject, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for redeeming a coupon
 * User ID is extracted from JWT token
 */
export class RedeemCouponDto {
	@ApiPropertyOptional({
		description: 'Additional metadata about the redemption (order ID, amount, etc.)',
		example: {
			orderId: 'order-456',
			purchaseAmount: 100.5,
			appliedDiscount: 20.1
		}
	})
	@IsObject()
	@IsOptional()
	metadata?: Record<string, any>;
}
