export enum Environment {
	DEVELOPMENT = 'development',
	STAGING = 'staging',
	PRODUCTION = 'production'
}

export enum LogLevel {
	DEBUG = 'debug',
	INFO = 'info',
	WARN = 'warn',
	ERROR = 'error',
	FATAL = 'fatal'
}

export enum EnvKey {
	// ============================================
	// APPLICATION CONFIGURATION
	// ============================================
	NODE_ENV = 'NODE_ENV',
	SCOPE = 'SCOPE',
	PORT = 'PORT',
	LOG_LEVEL = 'LOG_LEVEL',

	// ============================================
	// JWT CONFIGURATION
	// ============================================
	JWT_TTL_SEC = 'JWT_TTL_SEC',
	JWT_SECRET = 'JWT_SECRET',

	// ============================================
	// CACHE CONFIGURATION (Redis)
	// ============================================
	CACHE_HOST = 'CACHE_HOST',
	CACHE_PORT = 'CACHE_PORT',
	CACHE_PASSWORD = 'CACHE_PASSWORD',
	CACHE_NAMESPACE_DEDUP = 'CACHE_NAMESPACE_DEDUP',
	CACHE_NAMESPACE_JWT_BLACKLIST = 'CACHE_NAMESPACE_JWT_BLACKLIST',
	CACHE_NAMESPACE_JWT_ACTIVE = 'CACHE_NAMESPACE_JWT_ACTIVE',
	CACHE_NAMESPACE_CURSOR = 'CACHE_NAMESPACE_CURSOR',
	CACHE_NAMESPACE_LOCKS = 'CACHE_NAMESPACE_LOCKS',

	// ============================================
	// CACHE TTLs
	// ============================================
	CACHE_DEDUP_TTL_SEC = 'CACHE_DEDUP_TTL_SEC',
	CACHE_JWT_BLACKLIST_TTL_SEC = 'CACHE_JWT_BLACKLIST_TTL_SEC',
	CACHE_CURSOR_TTL_SEC = 'CACHE_CURSOR_TTL_SEC',

	// ============================================
	// PAGINATION
	// ============================================
	PAGINATION_CURSOR_TTL_SEC = 'PAGINATION_CURSOR_TTL_SEC',
	PAGINATION_MAX_LIMIT = 'PAGINATION_MAX_LIMIT',

	// ============================================
	// GOOGLE CLOUD SECRET MANAGER
	// ============================================
	SECRET_ALIAS = 'SECRET_ALIAS',
	SECRET_NAME_APP = 'SECRET_NAME_APP',
	SECRET_NAME_CACHE = 'SECRET_NAME_CACHE',
	SECRET_NAME_DB = 'SECRET_NAME_DB',

	// ============================================
	// APPLICATION SECRETS (from SECRET_NAME_APP)
	// ============================================
	API_KEY = 'API_KEY',
	TOKEN_COMPARE_SECRET = 'TOKEN_COMPARE_SECRET',
	MONITORING_TOKEN = 'MONITORING_TOKEN',

	// ============================================
	// DATABASE CREDENTIALS (from secret)
	// ============================================
	DB_HOST = 'DB_HOST',
	DB_PORT = 'DB_PORT',
	DB_USERNAME = 'DB_USERNAME',
	DB_NAME = 'DB_NAME',
	DB_PASSWORD = 'DB_PASSWORD',

	// ============================================
	// TIMEOUTS (milliseconds) - Optional
	// ============================================
	TIMEOUT_CACHE_CONNECT_MS = 'TIMEOUT_CACHE_CONNECT_MS',
	TIMEOUT_CACHE_READ_MS = 'TIMEOUT_CACHE_READ_MS',
	TIMEOUT_SECRET_MANAGER_CONNECT_MS = 'TIMEOUT_SECRET_MANAGER_CONNECT_MS',
	TIMEOUT_SECRET_MANAGER_READ_MS = 'TIMEOUT_SECRET_MANAGER_READ_MS',

	// ============================================
	// CIRCUIT BREAKER CONFIGURATION
	// ============================================
	CIRCUIT_BREAKER_THRESHOLD = 'CIRCUIT_BREAKER_THRESHOLD',
	CIRCUIT_BREAKER_WINDOW_MS = 'CIRCUIT_BREAKER_WINDOW_MS',
	CIRCUIT_BREAKER_COOLDOWN_MS = 'CIRCUIT_BREAKER_COOLDOWN_MS',
	CIRCUIT_BREAKER_HALF_OPEN_REQUESTS = 'CIRCUIT_BREAKER_HALF_OPEN_REQUESTS'
}
