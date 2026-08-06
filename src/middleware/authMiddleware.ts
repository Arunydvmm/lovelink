import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, hashSessionToken } from '../lib/auth';
import prisma from '../lib/db';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: {
        id: string;
        email: string;
        name: string;
        role: string;
      };
    }
  }
}

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================

const extractToken = (req: Request): string | null => {
  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookie
  if (req.cookies && req.cookies.access_token) {
    return req.cookies.access_token;
  }

  return null;
};

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);

    if (!token) {
      res.status(401).json({ error: 'No authentication token provided' });
      return;
    }

    const payload = verifyAccessToken(token);

    if (!payload) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      res.status(401).json({ error: 'User not found or inactive' });
      return;
    }

    // Attach user to request
    req.userId = user.id;
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name || user.email.split('@')[0],
      role: user.role,
    };

    next();
  } catch (error: any) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// ============================================
// OPTIONAL AUTHENTICATION
// ============================================

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);

    if (!token) {
      next();
      return;
    }

    const payload = verifyAccessToken(token);

    if (payload) {
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
        },
      });

      if (user && user.isActive) {
        req.userId = user.id;
        req.user = {
          id: user.id,
          email: user.email,
          name: user.name || user.email.split('@')[0],
          role: user.role,
        };
      }
    }

    next();
  } catch (error) {
    // For optional auth, continue even if token verification fails
    next();
  }
};

// ============================================
// ROLE-BASED AUTHORIZATION
// ============================================

export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
};

export const requireAdmin = requireRole('ADMIN', 'SUPER_ADMIN');

// ============================================
// SESSION VALIDATION MIDDLEWARE
// ============================================

export const validateSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sessionToken = req.cookies.session_token;

    if (!sessionToken) {
      res.status(401).json({ error: 'No session found' });
      return;
    }

    const hashedToken = hashSessionToken(sessionToken);

    const session = await prisma.session.findFirst({
      where: {
        token: hashedToken,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
          },
        },
      },
    });

    if (!session || !session.user.isActive) {
      res.status(401).json({ error: 'Invalid or expired session' });
      return;
    }

    // Attach user to request
    req.userId = session.user.id;
    req.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name || session.user.email.split('@')[0],
      role: session.user.role,
    };

    next();
  } catch (error: any) {
    console.error('Session validation error:', error);
    res.status(401).json({ error: 'Session validation failed' });
  }
};
