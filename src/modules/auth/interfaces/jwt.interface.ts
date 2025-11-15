/**
 * JWT Payload Interface
 *
 * Defines the structure of the decoded JWT token payload.
 * Extend this interface with your own custom claims as needed.
 */
export interface IJwtPayload {
	/**
	 * Subject (typically user/client ID)
	 */
	sub: string;

	/**
	 * JWT ID (unique token identifier)
	 */
	jti: string;

	/**
	 * Issued at (timestamp)
	 */
	iat: number;

	/**
	 * Expiration time (timestamp)
	 */
	exp: number;

	/**
	 * Add your custom claims here
	 * For example:
	 * email?: string;
	 * role?: string;
	 * permissions?: string[];
	 */
}
