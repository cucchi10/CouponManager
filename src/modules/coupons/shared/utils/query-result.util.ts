/**
 * Query Result Utility
 *
 * Provides utilities for checking query results from database operations.
 * Useful for validating SQL query results before processing.
 *
 * @example
 * const result = await manager.query('SELECT * FROM users WHERE id = $1', [userId]);
 * if (QueryResultUtil.isEmpty(result)) {
 *   throw new NotFoundException('User not found');
 * }
 */
export class QueryResultUtil {
	/**
	 * Check if a query result is empty or null
	 *
	 * @param result - Query result (array or null/undefined)
	 * @returns True if result is null, undefined, or empty array
	 *
	 * @example
	 * const result = await manager.query('SELECT * FROM users');
	 * if (QueryResultUtil.isEmpty(result)) {
	 *   // Handle empty result
	 * }
	 */
	static isEmpty<T>(result: T[] | null | undefined): result is null | undefined {
		return !result || result.length === 0;
	}

	/**
	 * Check if a query result has data
	 *
	 * @param result - Query result (array or null/undefined)
	 * @returns True if result exists and has at least one element
	 *
	 * @example
	 * const result = await manager.query('SELECT * FROM users');
	 * if (QueryResultUtil.hasData(result)) {
	 *   const user = result[0];
	 * }
	 */
	static hasData<T>(result: T[] | null | undefined): result is T[] {
		return !this.isEmpty(result);
	}
}
