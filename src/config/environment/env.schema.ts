import * as Joi from 'joi';
import { EnvKey, Environment, LogLevel } from './env.keys';

/**
 * Environment variables validation schema using Joi.
 * Organized by functional groups for better maintainability.
 */
export const envSchema = Joi.object({
	// ============================================
	// APPLICATION CONFIGURATION
	// ============================================
	[EnvKey.NODE_ENV]: Joi.string()
		.valid(...Object.values(Environment))
		.required()
		.messages({
			'any.required': `${EnvKey.NODE_ENV} es requerido`,
			'string.empty': `${EnvKey.NODE_ENV} no puede estar vacío`,
			'any.only': `${EnvKey.NODE_ENV} debe ser uno de: ${Object.values(Environment).join(', ')}`
		}),
	[EnvKey.SCOPE]: Joi.string()
		.valid(...Object.values(Environment))
		.required()
		.messages({
			'any.required': `${EnvKey.SCOPE} es requerido`,
			'string.empty': `${EnvKey.SCOPE} no puede estar vacío`,
			'any.only': `${EnvKey.SCOPE} debe ser uno de: ${Object.values(Environment).join(', ')}`
		}),

	[EnvKey.PORT]: Joi.number()
		.port()
		.required()
		.messages({
			'any.required': `${EnvKey.PORT} es requerido`,
			'number.base': `${EnvKey.PORT} debe ser un número`,
			'number.port': `${EnvKey.PORT} debe ser un puerto válido`
		}),
	[EnvKey.LOG_LEVEL]: Joi.string()
		.valid(...Object.values(LogLevel))
		.default(LogLevel.INFO)
		.messages({
			'any.only': `${EnvKey.LOG_LEVEL} debe ser uno de: ${Object.values(LogLevel).join(', ')}`
		}),

	// ============================================
	// JWT CONFIGURATION
	// ============================================
	[EnvKey.JWT_TTL_SEC]: Joi.number()
		.integer()
		.required()
		.messages({
			'any.required': `${EnvKey.JWT_TTL_SEC} es requerido`,
			'number.base': `${EnvKey.JWT_TTL_SEC} debe ser un número`,
			'number.integer': `${EnvKey.JWT_TTL_SEC} debe ser un número entero`
		}),

	[EnvKey.JWT_SECRET]: Joi.string()
		.when(EnvKey.SCOPE, { is: Environment.DEVELOPMENT, then: Joi.required() })
		.messages({
			'any.required': `${EnvKey.JWT_SECRET} es requerido`,
			'string.empty': `${EnvKey.JWT_SECRET} no puede estar vacío`
		}),

	// ============================================
	// CACHE CONFIGURATION (Redis)
	// Optional: comes from SECRET_NAME_CACHE in production, or local env in development
	// ============================================
	[EnvKey.CACHE_HOST]: Joi.string()
		.hostname()
		.when(EnvKey.SCOPE, { is: Environment.DEVELOPMENT, then: Joi.required() })
		.messages({
			'string.empty': `${EnvKey.CACHE_HOST} no puede estar vacío`,
			'string.hostname': `${EnvKey.CACHE_HOST} debe ser un hostname válido`
		}),

	[EnvKey.CACHE_PORT]: Joi.number()
		.port()
		.when(EnvKey.SCOPE, { is: Environment.DEVELOPMENT, then: Joi.required() })
		.messages({
			'number.base': `${EnvKey.CACHE_PORT} debe ser un número`,
			'number.port': `${EnvKey.CACHE_PORT} debe ser un puerto válido`
		}),

	[EnvKey.CACHE_PASSWORD]: Joi.string()
		.optional()
		.messages({
			'string.empty': `${EnvKey.CACHE_PASSWORD} no puede estar vacío`
		}),

	// ============================================
	// CACHE NAMESPACES
	// ============================================
	[EnvKey.CACHE_NAMESPACE_DEDUP]: Joi.string()
		.required()
		.messages({
			'any.required': `${EnvKey.CACHE_NAMESPACE_DEDUP} es requerido`,
			'string.empty': `${EnvKey.CACHE_NAMESPACE_DEDUP} no puede estar vacío`
		}),

	[EnvKey.CACHE_NAMESPACE_JWT_BLACKLIST]: Joi.string()
		.required()
		.messages({
			'any.required': `${EnvKey.CACHE_NAMESPACE_JWT_BLACKLIST} es requerido`,
			'string.empty': `${EnvKey.CACHE_NAMESPACE_JWT_BLACKLIST} no puede estar vacío`
		}),

	[EnvKey.CACHE_NAMESPACE_JWT_ACTIVE]: Joi.string()
		.required()
		.messages({
			'any.required': `${EnvKey.CACHE_NAMESPACE_JWT_ACTIVE} es requerido`,
			'string.empty': `${EnvKey.CACHE_NAMESPACE_JWT_ACTIVE} no puede estar vacío`
		}),

	[EnvKey.CACHE_NAMESPACE_CURSOR]: Joi.string()
		.required()
		.messages({
			'any.required': `${EnvKey.CACHE_NAMESPACE_CURSOR} es requerido`,
			'string.empty': `${EnvKey.CACHE_NAMESPACE_CURSOR} no puede estar vacío`
		}),

	[EnvKey.CACHE_NAMESPACE_LOCKS]: Joi.string()
		.required()
		.messages({
			'any.required': `${EnvKey.CACHE_NAMESPACE_LOCKS} es requerido`,
			'string.empty': `${EnvKey.CACHE_NAMESPACE_LOCKS} no puede estar vacío`
		}),

	// ============================================
	// CACHE TTLs
	// ============================================
	[EnvKey.CACHE_DEDUP_TTL_SEC]: Joi.number().integer().min(1).default(60),
	[EnvKey.CACHE_JWT_BLACKLIST_TTL_SEC]: Joi.number().integer().min(1).optional(),
	[EnvKey.CACHE_CURSOR_TTL_SEC]: Joi.number().integer().min(1).default(900),

	// ============================================
	// PAGINATION
	// ============================================
	[EnvKey.PAGINATION_CURSOR_TTL_SEC]: Joi.number()
		.integer()
		.required()
		.messages({
			'any.required': `${EnvKey.PAGINATION_CURSOR_TTL_SEC} es requerido`,
			'number.base': `${EnvKey.PAGINATION_CURSOR_TTL_SEC} debe ser un número`,
			'number.integer': `${EnvKey.PAGINATION_CURSOR_TTL_SEC} debe ser un número entero`
		}),

	[EnvKey.PAGINATION_MAX_LIMIT]: Joi.number()
		.integer()
		.min(1)
		.required()
		.messages({
			'any.required': `${EnvKey.PAGINATION_MAX_LIMIT} es requerido`,
			'number.base': `${EnvKey.PAGINATION_MAX_LIMIT} debe ser un número`,
			'number.integer': `${EnvKey.PAGINATION_MAX_LIMIT} debe ser un número entero`,
			'number.min': `${EnvKey.PAGINATION_MAX_LIMIT} debe ser al menos 1`
		}),

	// ============================================
	// EXTERNAL SERVICES (Optional - Add your own as needed)
	// ============================================

	// ============================================
	// GOOGLE CLOUD SECRET MANAGER
	// ============================================
	[EnvKey.SECRET_ALIAS]: Joi.string()
		.required()
		.messages({
			'any.required': `${EnvKey.SECRET_ALIAS} es requerido`,
			'string.empty': `${EnvKey.SECRET_ALIAS} no puede estar vacío`
		}),

	[EnvKey.SECRET_NAME_APP]: Joi.string()
		.required()
		.messages({
			'any.required': `${EnvKey.SECRET_NAME_APP} es requerido`,
			'string.empty': `${EnvKey.SECRET_NAME_APP} no puede estar vacío`
		}),

	[EnvKey.SECRET_NAME_CACHE]: Joi.string()
		.required()
		.messages({
			'any.required': `${EnvKey.SECRET_NAME_CACHE} es requerido`,
			'string.empty': `${EnvKey.SECRET_NAME_CACHE} no puede estar vacío`
		}),

	[EnvKey.SECRET_NAME_DB]: Joi.string()
		.required()
		.messages({
			'any.required': `${EnvKey.SECRET_NAME_DB} es requerido`,
			'string.empty': `${EnvKey.SECRET_NAME_DB} no puede estar vacío`
		}),

	// ============================================
	// APPLICATION SECRETS (from SECRET_NAME_APP)
	// Optional: comes from SECRET_NAME_APP in production
	// ============================================
	[EnvKey.API_KEY]: Joi.string()
		.when(EnvKey.SCOPE, { is: Environment.DEVELOPMENT, then: Joi.required() })
		.messages({
			'any.required': `${EnvKey.API_KEY} es requerido`,
			'string.empty': `${EnvKey.API_KEY} no puede estar vacío`
		}),

	[EnvKey.TOKEN_COMPARE_SECRET]: Joi.string()
		.when(EnvKey.SCOPE, { is: Environment.DEVELOPMENT, then: Joi.required() })
		.messages({
			'any.required': `${EnvKey.TOKEN_COMPARE_SECRET} es requerido`,
			'string.empty': `${EnvKey.TOKEN_COMPARE_SECRET} no puede estar vacío`
		}),

	[EnvKey.MONITORING_TOKEN]: Joi.string()
		.when(EnvKey.SCOPE, { is: Environment.DEVELOPMENT, then: Joi.required() })
		.messages({
			'any.required': `${EnvKey.MONITORING_TOKEN} es requerido`,
			'string.empty': `${EnvKey.MONITORING_TOKEN} no puede estar vacío`
		}),

	// ============================================
	// DATABASE CREDENTIALS
	// Optional: comes from SECRET_NAME_DB in production, or local env in development
	// ============================================
	[EnvKey.DB_HOST]: Joi.string()
		.hostname()
		.when(EnvKey.SCOPE, { is: Environment.DEVELOPMENT, then: Joi.required() })
		.messages({
			'string.empty': `${EnvKey.DB_HOST} no puede estar vacío`
		}),

	[EnvKey.DB_PORT]: Joi.number()
		.port()
		.when(EnvKey.SCOPE, { is: Environment.DEVELOPMENT, then: Joi.required() })
		.messages({
			'number.base': `${EnvKey.DB_PORT} debe ser un número`,
			'number.port': `${EnvKey.DB_PORT} debe ser un puerto válido`
		}),

	[EnvKey.DB_USERNAME]: Joi.string()
		.when(EnvKey.SCOPE, { is: Environment.DEVELOPMENT, then: Joi.required() })
		.messages({
			'any.required': `${EnvKey.DB_USERNAME} es requerido`,
			'string.empty': `${EnvKey.DB_USERNAME} no puede estar vacío`
		}),

	[EnvKey.DB_NAME]: Joi.string()
		.when(EnvKey.SCOPE, { is: Environment.DEVELOPMENT, then: Joi.required() })
		.messages({
			'string.empty': `${EnvKey.DB_NAME} no puede estar vacío`
		}),

	[EnvKey.DB_PASSWORD]: Joi.string()
		.when(EnvKey.SCOPE, { is: Environment.DEVELOPMENT, then: Joi.required() })
		.messages({
			'string.empty': `${EnvKey.DB_PASSWORD} no puede estar vacío`
		}),

	// ============================================
	// TIMEOUTS (milliseconds) - Optional
	// ============================================

	// Cache (Redis) Timeouts
	[EnvKey.TIMEOUT_CACHE_CONNECT_MS]: Joi.number()
		.integer()
		.min(0)
		.required()
		.messages({
			'any.required': `${EnvKey.TIMEOUT_CACHE_CONNECT_MS} es requerido`,
			'number.base': `${EnvKey.TIMEOUT_CACHE_CONNECT_MS} debe ser un número`,
			'number.integer': `${EnvKey.TIMEOUT_CACHE_CONNECT_MS} debe ser un número entero`,
			'number.min': `${EnvKey.TIMEOUT_CACHE_CONNECT_MS} debe ser al menos 0`
		}),

	[EnvKey.TIMEOUT_CACHE_READ_MS]: Joi.number()
		.integer()
		.min(0)
		.required()
		.messages({
			'any.required': `${EnvKey.TIMEOUT_CACHE_READ_MS} es requerido`,
			'number.base': `${EnvKey.TIMEOUT_CACHE_READ_MS} debe ser un número`,
			'number.integer': `${EnvKey.TIMEOUT_CACHE_READ_MS} debe ser un número entero`,
			'number.min': `${EnvKey.TIMEOUT_CACHE_READ_MS} debe ser al menos 0`
		}),

	// Secret Manager Timeouts
	[EnvKey.TIMEOUT_SECRET_MANAGER_CONNECT_MS]: Joi.number()
		.integer()
		.min(0)
		.required()
		.messages({
			'any.required': `${EnvKey.TIMEOUT_SECRET_MANAGER_CONNECT_MS} es requerido`,
			'number.base': `${EnvKey.TIMEOUT_SECRET_MANAGER_CONNECT_MS} debe ser un número`,
			'number.integer': `${EnvKey.TIMEOUT_SECRET_MANAGER_CONNECT_MS} debe ser un número entero`,
			'number.min': `${EnvKey.TIMEOUT_SECRET_MANAGER_CONNECT_MS} debe ser al menos 0`
		}),

	[EnvKey.TIMEOUT_SECRET_MANAGER_READ_MS]: Joi.number()
		.integer()
		.min(0)
		.required()
		.messages({
			'any.required': `${EnvKey.TIMEOUT_SECRET_MANAGER_READ_MS} es requerido`,
			'number.base': `${EnvKey.TIMEOUT_SECRET_MANAGER_READ_MS} debe ser un número`,
			'number.integer': `${EnvKey.TIMEOUT_SECRET_MANAGER_READ_MS} debe ser un número entero`,
			'number.min': `${EnvKey.TIMEOUT_SECRET_MANAGER_READ_MS} debe ser al menos 0`
		}),

	// ============================================
	// CIRCUIT BREAKER CONFIGURATION
	// ============================================
	[EnvKey.CIRCUIT_BREAKER_THRESHOLD]: Joi.number()
		.integer()
		.required()
		.messages({
			'any.required': `${EnvKey.CIRCUIT_BREAKER_THRESHOLD} es requerido`,
			'number.base': `${EnvKey.CIRCUIT_BREAKER_THRESHOLD} debe ser un número`,
			'number.integer': `${EnvKey.CIRCUIT_BREAKER_THRESHOLD} debe ser un número entero`
		}),

	[EnvKey.CIRCUIT_BREAKER_WINDOW_MS]: Joi.number()
		.integer()
		.min(0)
		.required()
		.messages({
			'any.required': `${EnvKey.CIRCUIT_BREAKER_WINDOW_MS} es requerido`,
			'number.base': `${EnvKey.CIRCUIT_BREAKER_WINDOW_MS} debe ser un número`,
			'number.integer': `${EnvKey.CIRCUIT_BREAKER_WINDOW_MS} debe ser un número entero`,
			'number.min': `${EnvKey.CIRCUIT_BREAKER_WINDOW_MS} debe ser al menos 0`
		}),

	[EnvKey.CIRCUIT_BREAKER_COOLDOWN_MS]: Joi.number()
		.integer()
		.min(0)
		.required()
		.messages({
			'any.required': `${EnvKey.CIRCUIT_BREAKER_COOLDOWN_MS} es requerido`,
			'number.base': `${EnvKey.CIRCUIT_BREAKER_COOLDOWN_MS} debe ser un número`,
			'number.integer': `${EnvKey.CIRCUIT_BREAKER_COOLDOWN_MS} debe ser un número entero`,
			'number.min': `${EnvKey.CIRCUIT_BREAKER_COOLDOWN_MS} debe ser al menos 0`
		}),

	[EnvKey.CIRCUIT_BREAKER_HALF_OPEN_REQUESTS]: Joi.number()
		.integer()
		.required()
		.messages({
			'any.required': `${EnvKey.CIRCUIT_BREAKER_HALF_OPEN_REQUESTS} es requerido`,
			'number.base': `${EnvKey.CIRCUIT_BREAKER_HALF_OPEN_REQUESTS} debe ser un número`,
			'number.integer': `${EnvKey.CIRCUIT_BREAKER_HALF_OPEN_REQUESTS} debe ser un número entero`
		})
});
