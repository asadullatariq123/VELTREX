import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'DUPLICATE_RESOURCE'
  | 'DATABASE_ERROR'
  | 'WEATHER_PROVIDER_UNAVAILABLE'
  | 'SATELLITE_PROVIDER_UNAVAILABLE'
  | 'PROVIDER_UNAVAILABLE'
  | 'RATE_LIMITED'
  | 'TOO_MANY_REQUESTS'
  | 'SIMULATION_ACTIVE'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'INVALID_TOKEN'
  | 'INTERNAL_ERROR';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: ErrorCode;

  constructor(message: string, statusCode: number = 500, errorCode: ErrorCode = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// Sanitize message string to prevent internal path, DB schema, or credential leaks
function sanitizeErrorMessage(msg: string): string {
  if (!msg) return 'An unexpected error occurred.';
  let sanitized = msg;
  // Replace file paths
  sanitized = sanitized.replace(/([A-Z]:\\[^:\s\n]+|\/[^:\s\n]+)/gi, '[REDACTED_PATH]');
  // Replace database connection strings or keys
  sanitized = sanitized.replace(/(postgres|mysql|mongodb):\/\/[^\s]+/gi, '[REDACTED_URI]');
  sanitized = sanitized.replace(/(key|secret|password|token)=([^\s&]+)/gi, '$1=[REDACTED]');
  return sanitized;
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || err.status || 500;
  const errorCode: ErrorCode = err.errorCode || err.code || (statusCode === 404 ? 'NOT_FOUND' : statusCode === 400 ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR');
  
  let rawMessage = err.message || 'An unexpected internal error occurred.';
  
  // Database internal error sanitization
  if (rawMessage.includes('prisma') || rawMessage.includes('Can\'t reach database server')) {
    rawMessage = 'Database service is temporarily unavailable or in offline fallback mode.';
  }

  const cleanMessage = sanitizeErrorMessage(rawMessage);

  console.error(`[API ERROR] ${req.method} ${req.originalUrl} (${statusCode}) [${errorCode}]: ${cleanMessage}`);

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: cleanMessage,
      ...(env.NODE_ENV === 'development' && err.stack ? { debugStack: sanitizeErrorMessage(err.stack) } : {}),
    },
  });
};
