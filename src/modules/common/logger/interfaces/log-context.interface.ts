import { LogLevel } from '@/config/environment';

/**
 * Structure for logs as per observability requirements
 */
export interface ILogContext {
	timestamp: string;
	level: LogLevel;
	correlationId: string;
	requestId: string;
	bank: string;
	allyId: string;
	endpoint: string;
	httpMethod: string;
	httpStatus: number;
	latencyMs: number;
	retryCount: number;
	secretVersionId: string;
	result: 'success' | 'error';
	message: string;
	errorCode: string;
	stack: string;
	[key: string]: string | number | undefined;
}

/**
 * Base context that can be extended for specific operations
 */
export interface IBaseLogContext {
	bank?: string;
	allyId?: string;
	endpoint?: string;
	httpMethod?: string;
	retryCount?: number;
	secretVersionId?: string;
	[key: string]: any;
}
