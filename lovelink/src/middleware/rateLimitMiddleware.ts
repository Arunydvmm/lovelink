import rateLimit from 'express-rate-limit';
import { Request } from 'express';

// ============================================
// RATE LIMITERS (Memory Store - No Redis)
// ============================================

export const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    // Skip rate limiting for health checks
    return req.path === '/api/health';
  },
});

// Google OAuth rate limiting
export const googleAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Too many Google authentication attempts, please try again later',
  keyGenerator: (req: Request) => {
    return req.ip || 'unknown';
  },
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: 'API rate limit exceeded',
});

export const checkoutLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: 'Too many checkout attempts, please try again later',
  keyGenerator: (req: Request) => {
    return req.userId || req.ip || 'unknown';
  },
});

export const adminLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: 'Admin API rate limit exceeded',
  keyGenerator: (req: Request) => {
    return req.userId || req.ip || 'unknown';
  },
});
