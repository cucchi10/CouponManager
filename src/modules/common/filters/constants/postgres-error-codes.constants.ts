/**
 * PostgreSQL Error Codes
 *
 * Reference: https://www.postgresql.org/docs/current/errcodes-appendix.html
 */
export enum PostgresErrorCode {
	/** Unique violation - duplicate key value violates unique constraint */
	UNIQUE_VIOLATION = '23505',

	/** Transaction aborted - current transaction is aborted, commands ignored until end of transaction block */
	TRANSACTION_ABORTED = '25P02',

	/** Foreign key violation - insert or update on table violates foreign key constraint */
	FOREIGN_KEY_VIOLATION = '23503',

	/** Not null violation - null value in column violates not-null constraint */
	NOT_NULL_VIOLATION = '23502',

	/** Check violation - new row violates check constraint */
	CHECK_VIOLATION = '23514',

	/** Exclusion violation - violates exclusion constraint */
	EXCLUSION_VIOLATION = '23P01',

	/** Invalid text representation - invalid input syntax */
	INVALID_TEXT_REPRESENTATION = '22P02',

	/** Numeric value out of range */
	NUMERIC_VALUE_OUT_OF_RANGE = '22003',

	/** String data right truncated */
	STRING_DATA_RIGHT_TRUNCATED = '22001',

	/** Deadlock detected */
	DEADLOCK_DETECTED = '40P01',

	/** Lock not available - could not obtain lock on row in relation */
	LOCK_NOT_AVAILABLE = '55P03'
}
