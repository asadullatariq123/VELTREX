import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { env } from '../config/env';

export interface AuthenticatedUser {
  userId: string;
  role: 'ADMIN' | 'DISTRICT AUTHORITY' | 'FIELD OFFICER' | 'COMMUNITY USER';
  email?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

// Simple Base64URL decoder helper
function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

// Simple Base64URL encoder helper
function base64UrlEncode(buffer: Buffer): string {
  return buffer.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

// Verify JWT token signature and expiration
export function verifyJwtToken(token: string): AuthenticatedUser | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;

    const expectedSignature = base64UrlEncode(
      crypto.createHmac('sha256', env.JWT_SECRET).update(`${headerB64}.${payloadB64}`).digest()
    );

    if (signatureB64 !== expectedSignature) {
      return null;
    }

    const payload = JSON.parse(base64UrlDecode(payloadB64));

    if (payload.exp && typeof payload.exp === 'number') {
      const nowSec = Math.floor(Date.now() / 1000);
      if (payload.exp < nowSec) {
        return null;
      }
    }

    return {
      userId: payload.userId || payload.sub || 'user-anon',
      role: payload.role || 'COMMUNITY USER',
      email: payload.email,
    };
  } catch (err) {
    return null;
  }
}

// Helper to generate safe JWT tokens for testing/auth
export function generateJwtToken(user: AuthenticatedUser, expiresInSec: number = 86400): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sub: user.userId,
    userId: user.userId,
    role: user.role,
    email: user.email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + expiresInSec,
  };

  const headerB64 = base64UrlEncode(Buffer.from(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(Buffer.from(JSON.stringify(payload)));
  const signatureB64 = base64UrlEncode(
    crypto.createHmac('sha256', env.JWT_SECRET).update(`${headerB64}.${payloadB64}`).digest()
  );

  return `${headerB64}.${payloadB64}.${signatureB64}`;
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication token required.',
      },
    });
  }

  const token = authHeader.substring(7).trim();
  const user = verifyJwtToken(token);

  if (!user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired authentication token.',
      },
    });
  }

  req.user = user;
  next();
};

export const optionalAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const user = verifyJwtToken(token);
    if (user) {
      req.user = user;
    }
  }
  next();
};
