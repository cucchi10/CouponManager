import { CORRELATION_ID_HEADER } from '@/config/app.constants';
import { Request } from 'express';

/**
 * Extension of Express Request with a typed correlation ID header in the headers property.
 *
 * Note: This interface previously added a direct `correlationId` property, but this was removed.
 * Correlation IDs are now accessed via the CorrelationService and continuation-local storage (CLS),
 * not directly on the request object. This interface only narrows the headers type to include the
 * correlation ID header.
 */
export interface RequestWithCorrelation extends Request {
	/**
	 * Request headers with typed correlation ID header
	 */
	headers: Request['headers'] & {
		[CORRELATION_ID_HEADER]?: string;
	};
}
