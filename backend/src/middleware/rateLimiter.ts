import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const stores = new Map<string, Map<string, RateLimitStore>>();

export function createRateLimiter(options: {
  windowMs: number;
  max: number;
  message?: string;
  keyPrefix?: string;
}) {
  const windowMs = options.windowMs || 60000;
  const max = options.max || 100;
  const keyPrefix = options.keyPrefix || 'global';
  const errorMessage = options.message || 'Too many requests, please try again later.';

  if (!stores.has(keyPrefix)) {
    stores.set(keyPrefix, new Map<string, RateLimitStore>());
  }

  const prefixStore = stores.get(keyPrefix)!;

  // Periodically clean expired keys every 2 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of prefixStore.entries()) {
      if (now > data.resetTime) {
        prefixStore.delete(ip);
      }
    }
  }, 120000);

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();

    let record = prefixStore.get(ip);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs,
      };
      prefixStore.set(ip, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, max - record.count);
    const resetSec = Math.ceil((record.resetTime - now) / 1000);

    res.setHeader('X-RateLimit-Limit', max.toString());
    res.setHeader('X-RateLimit-Remaining', remaining.toString());
    res.setHeader('X-RateLimit-Reset', resetSec.toString());

    if (record.count > max) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'TOO_MANY_REQUESTS',
          message: errorMessage,
          retryAfterSeconds: resetSec,
        },
      });
    }

    next();
  };
}

export const apiRateLimiter = createRateLimiter({
  windowMs: 60000,
  max: 120,
  message: 'API rate limit exceeded. Max 120 requests per minute.',
  keyPrefix: 'api_general',
});

export const authRateLimiter = createRateLimiter({
  windowMs: 60000,
  max: 10,
  message: 'Too many authentication attempts. Please wait 1 minute.',
  keyPrefix: 'auth_strict',
});

export const uploadRateLimiter = createRateLimiter({
  windowMs: 60000,
  max: 15,
  message: 'Upload rate limit exceeded. Max 15 uploads per minute.',
  keyPrefix: 'file_upload',
});

export const alertGenRateLimiter = createRateLimiter({
  windowMs: 60000,
  max: 20,
  message: 'Alert generation rate limit exceeded.',
  keyPrefix: 'alert_gen',
});
