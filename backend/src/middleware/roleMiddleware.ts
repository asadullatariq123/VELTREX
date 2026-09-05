import { Request, Response, NextFunction } from 'express';
import { AuthenticatedUser } from './authMiddleware';

export const requireRoles = (allowedRoles: Array<AuthenticatedUser['role']>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required.',
        },
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Forbidden: Action requires one of the following roles: [${allowedRoles.join(', ')}].`,
        },
      });
    }

    next();
  };
};
