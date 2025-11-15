import { Controller, Get, Post, Body, Param, Delete, ParseUUIDPipe, UseGuards, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiParam } from '@nestjs/swagger';
import { CouponBooksService } from './coupon-books.service';
import {
	CreateCouponBookDto,
	CouponBookResponseDto,
	PaginatedCouponBooksResponseDto,
	PaginatedCouponsResponseDto,
	PaginationQueryDto,
	UploadCodesDto,
	UploadCodesResponseDto,
	GenerateCodesDto
} from './dto';
import { ApiKeyGuard } from '@/guards';
import { ApiApiKeyEndpoint, ApiPaginationQuery } from '@/modules/common/swagger/decorators';
import { SkipJwt } from '@/decorators';

/**
 * Coupon Books Controller
 *
 * Manages coupon book CRUD operations and code management.
 *
 * All endpoints require API Key authentication (x-api-key header).
 * These are administrative operations for configuring and managing coupon books.
 *
 * All endpoints return only data - ResponseTransformInterceptor wraps it.
 * Errors are thrown as exceptions - HttpExceptionFilter handles them.
 */
@ApiTags('coupon-books')
@Controller('coupon-books')
@SkipJwt()
@UseGuards(ApiKeyGuard)
export class CouponBooksController {
	constructor(private readonly couponBooksService: CouponBooksService) {}

	/**
	 * Create a new coupon book
	 *
	 * @param dto - Coupon book creation data
	 * @returns Created coupon book
	 */
	@Post()
	@HttpCode(HttpStatus.CREATED)
	@ApiApiKeyEndpoint({
		summary: 'Create a new coupon book',
		description: 'Creates a new coupon book with configurable parameters. Can be configured for auto-generation or manual code upload.',
		requestDto: CreateCouponBookDto,
		responseDto: CouponBookResponseDto,
		statusCode: HttpStatus.CREATED,
		responseDescription: 'Coupon book created successfully',
		standardErrors: {
			conflict: true
		}
	})
	async createCouponBook(@Body() dto: CreateCouponBookDto): Promise<CouponBookResponseDto> {
		return this.couponBooksService.createCouponBook(dto);
	}

	/**
	 * Get all coupon books (paginated)
	 *
	 * @param query - Pagination query parameters
	 * @returns Paginated list of coupon books with basic info (id, name, isActive)
	 */
	@Get()
	@HttpCode(HttpStatus.OK)
	@ApiPaginationQuery()
	@ApiApiKeyEndpoint({
		summary: 'Get all coupon books (paginated)',
		description: 'Retrieves a paginated list of coupon books with basic information (id, name, isActive). Use query parameters for pagination.',
		responseDto: PaginatedCouponBooksResponseDto
	})
	async getAllCouponBooks(@Query() query: PaginationQueryDto): Promise<PaginatedCouponBooksResponseDto> {
		return this.couponBooksService.getAllCouponBooks(query);
	}

	/**
	 * Get all coupons for a coupon book (paginated)
	 *
	 * @param bookId - Coupon book ID
	 * @param query - Pagination query parameters
	 * @returns Paginated list of coupons
	 */
	@Get(':bookId/coupons')
	@ApiPaginationQuery()
	@ApiApiKeyEndpoint({
		summary: 'Get coupons by book ID (paginated)',
		description: 'Retrieves a paginated list of coupons for a specific coupon book. Use query parameters for pagination.',
		responseDto: PaginatedCouponsResponseDto
	})
	@HttpCode(HttpStatus.OK)
	@ApiParam({ name: 'bookId', description: 'Coupon book UUID' })
	async getCouponsByBookId(@Param('bookId', ParseUUIDPipe) bookId: string, @Query() query: PaginationQueryDto): Promise<PaginatedCouponsResponseDto> {
		return this.couponBooksService.getCouponsByBookId(bookId, query);
	}

	/**
	 * Get a specific coupon book
	 *
	 * @param bookId - Coupon book ID
	 * @returns Coupon book with statistics
	 */
	@Get(':bookId')
	@ApiApiKeyEndpoint({
		summary: 'Get coupon book details',
		description: 'Retrieves a specific coupon book with detailed statistics',
		responseDto: CouponBookResponseDto
	})
	@HttpCode(HttpStatus.OK)
	@ApiParam({ name: 'bookId', description: 'Coupon book UUID' })
	async getCouponBook(@Param('bookId', ParseUUIDPipe) bookId: string): Promise<CouponBookResponseDto> {
		return this.couponBooksService.getCouponBook(bookId);
	}

	/**
	 * Upload custom codes to a coupon book
	 *
	 * @param bookId - Coupon book ID
	 * @param dto - Codes to upload
	 * @returns Upload statistics
	 */
	@Post(':bookId/codes')
	@HttpCode(HttpStatus.CREATED)
	@ApiApiKeyEndpoint({
		summary: 'Upload custom codes',
		description: 'Uploads a list of custom coupon codes to a book. Max 10,000 codes per request. Duplicates are skipped.',
		requestDto: UploadCodesDto,
		responseDto: UploadCodesResponseDto,
		statusCode: HttpStatus.CREATED,
		responseDescription: 'Codes uploaded successfully',
		standardErrors: {
			conflict: true
		}
	})
	@ApiParam({ name: 'bookId', description: 'Coupon book UUID' })
	async uploadCodes(@Param('bookId', ParseUUIDPipe) bookId: string, @Body() dto: UploadCodesDto): Promise<UploadCodesResponseDto> {
		return this.couponBooksService.uploadCodes(bookId, dto);
	}

	/**
	 * Auto-generate codes for a coupon book
	 *
	 * @param bookId - Coupon book ID
	 * @param dto - Generation parameters
	 * @returns Generation statistics
	 */
	@Post(':bookId/codes/generate')
	@HttpCode(HttpStatus.CREATED)
	@ApiApiKeyEndpoint({
		summary: 'Generate codes automatically',
		description: 'Auto-generates coupon codes based on the book pattern. Codes are cryptographically random.',
		requestDto: GenerateCodesDto,
		responseDto: UploadCodesResponseDto,
		statusCode: HttpStatus.CREATED,
		responseDescription: 'Codes generated successfully',
		standardErrors: {
			conflict: true
		}
	})
	@ApiParam({ name: 'bookId', description: 'Coupon book UUID' })
	async generateCodes(@Param('bookId', ParseUUIDPipe) bookId: string, @Body() dto: GenerateCodesDto): Promise<UploadCodesResponseDto> {
		return this.couponBooksService.generateCodes(bookId, dto);
	}

	/**
	 * Deactivate a coupon book
	 *
	 * @param bookId - Coupon book ID
	 * @returns Updated book
	 */
	@Delete(':bookId')
	@ApiApiKeyEndpoint({
		summary: 'Deactivate coupon book',
		description: 'Deactivates a coupon book (soft delete). Coupons can no longer be assigned or redeemed.',
		responseDto: CouponBookResponseDto,
		standardErrors: {
			conflict: true
		}
	})
	@HttpCode(HttpStatus.OK)
	@ApiParam({ name: 'bookId', description: 'Coupon book UUID' })
	async deactivateCouponBook(@Param('bookId', ParseUUIDPipe) bookId: string): Promise<CouponBookResponseDto> {
		return this.couponBooksService.deactivateCouponBook(bookId);
	}
}
