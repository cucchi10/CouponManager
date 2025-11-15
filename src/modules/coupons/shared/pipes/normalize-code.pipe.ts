import { PipeTransform, Injectable } from '@nestjs/common';
import { CodeNormalizer } from '../utils';

/**
 * Pipe to normalize coupon code parameters from route paths
 *
 * Use this pipe with @Param() decorator to automatically normalize
 * coupon codes to uppercase.
 *
 * @example
 * @Get(':code/status')
 * async getStatus(@Param('code', NormalizeCodePipe) code: string) {
 *   // code is already normalized to uppercase
 * }
 */
@Injectable()
export class NormalizeCodePipe implements PipeTransform<string, string> {
	transform(value: string): string {
		if (typeof value === 'string' && value.length > 0) {
			return CodeNormalizer.normalizeCode(value);
		}

		return value;
	}
}
