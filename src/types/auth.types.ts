import { Request } from 'express';
import { IJwtPayload } from '@/modules/auth/interfaces/jwt.interface';

/**
 * Request type extended with JWT payload
 *
 * Use this type when accessing the authenticated user from the request object
 * in controllers or middleware after JWT authentication.
 *
 * @example
 * async getProfile(@Request() req: RequestWithUser) {
 *   return { userId: req.user.sub };
 * }
 */
export interface RequestWithUser extends Request {
	user: IJwtPayload;
}
