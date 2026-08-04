import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { sanitizeInput, sanitizeObject, getSecureHeaders } from '../lib/security';

// ============================================
// HELMET SECURITY HEADERS
// ============================================

export const helmetMiddleware = helmet({
  contentSecurityPolicy: false, // DISABLE CSP COMPLETELY
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false,
  dnsPrefetchControl: false,
  frameguard: false,
  hsts: false,
  ieNoOpen: false,
  noSniff: false,
  referrerPolicy: false,
  xssFilter: false,
  permittedCrossDomainPolicies: false,
});

// ============================================
// CORS CONFIGURATION
// ============================================

const getConfiguredOrigins = (): string[] => {
  // Parse from environment variable - supports comma-separated origins
  if (process.env.ALLOWED_ORIGINS) {
    return process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());
  }

  // Production fallback - use app URL
  if (process.env.NODE_ENV === 'production' && process.env.VITE_APP_URL) {
    console.warn('⚠️ ALLOWED_ORIGINS not set - using VITE_APP_URL as fallback');
    return [process.env.VITE_APP_URL];
  }

  // Default development origins
  return [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
  ];
};

const allowedOrigins = getConfiguredOrigins();

// Log CORS configuration in development
if (process.env.NODE_ENV !== 'production') {
  console.log('🔐 CORS Origins:', allowedOrigins);
}

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or Curl requests)
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin matches any allowed origin or if it's production with dynamic URL
    const isAllowed = allowedOrigins.some(allowed => {
      // Exact match
      if (origin === allowed) return true;

      // Wildcard match for subdomains (e.g., *.onrender.com)
      if (allowed.includes('*')) {
        const regex = new RegExp('^' + allowed.replace(/\*/g, '.*') + '$');
        return regex.test(origin);
      }

      return false;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      // Log rejected origins for debugging
      console.warn(`⚠️ CORS rejected origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Request-ID'],
  optionsSuccessStatus: 200,
  maxAge: 86400,
});

// ============================================
// REQUEST SANITIZATION MIDDLEWARE
// ============================================

export const sanitizationMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }

  if (req.query && typeof req.query === 'object') {
    for (const [key, value] of Object.entries(req.query)) {
      if (typeof value === 'string') {
        req.query[key] = sanitizeInput(value);
      }
    }
  }

  if (req.params && typeof req.params === 'object') {
    for (const [key, value] of Object.entries(req.params)) {
      if (typeof value === 'string') {
        req.params[key] = sanitizeInput(value);
      }
    }
  }

  next();
};

// ============================================
// SECURITY HEADERS MIDDLEWARE
// ============================================

export const secureHeadersMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const headers = getSecureHeaders();

  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }

  // Additional security headers
  res.setHeader('X-Powered-By', 'LoveLink');
  res.setHeader('X-Request-ID', `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  // Disable caching for sensitive pages
  if (req.path.includes('/admin') || req.path.includes('/auth')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  next();
};

// ============================================
// CSRF PROTECTION MIDDLEWARE
// ============================================

const csrfTokens: Set<string> = new Set();

export const generateCSRFToken = (): string => {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  csrfTokens.add(token);
  return token;
};

export const csrfProtectionMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Skip CSRF check for GET requests and webhooks
  if (req.method === 'GET' || req.path === '/api/payments/webhook') {
    return next();
  }

  const token = req.headers['x-csrf-token'] as string;

  if (!token || !csrfTokens.has(token)) {
    // For development, allow requests without CSRF token
    if (process.env.NODE_ENV === 'development') {
      return next();
    }

    res.status(403).json({ error: 'Invalid CSRF token' });
    return;
  }

  // Remove used token
  csrfTokens.delete(token);

  next();
};

// ============================================
// INPUT VALIDATION MIDDLEWARE
// ============================================

export const validateContentType = (req: Request, res: Response, next: NextFunction): void => {
  if (
    ['POST', 'PUT', 'PATCH'].includes(req.method) &&
    !req.is('application/json') &&
    Object.keys(req.body).length > 0
  ) {
    res.status(415).json({ error: 'Content-Type must be application/json' });
    return;
  }

  next();
};

// ============================================
// RATE LIMITING BY PATH
// ============================================

export const getRateLimitConfig = (path: string) => {
  const configs: Record<string, { windowMs: number; max: number }> = {
    '/api/auth/login': { windowMs: 15 * 60 * 1000, max: 5 },
    '/api/auth/signup': { windowMs: 60 * 60 * 1000, max: 5 },
    '/api/auth/forgot-password': { windowMs: 60 * 60 * 1000, max: 3 },
    '/api/payments/create-order': { windowMs: 60 * 1000, max: 5 },
    '/api/payments/verify': { windowMs: 60 * 1000, max: 10 },
  };

  return configs[path] || { windowMs: 15 * 60 * 1000, max: 100 };
};

// ============================================
// SECURITY MONITORING
// ============================================

export const securityMonitoringMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log suspicious patterns
  const suspiciousPatterns = [
    /(\.\.|\/\/|\.\.\/)/,
    /(union|select|insert|update|delete|drop|exec|execute|script|javascript)/i,
    /(<script|javascript:|on\w+\s*=)/i,
  ];

  const checkString = `${req.path}${JSON.stringify(req.query)}${JSON.stringify(req.body)}`;

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(checkString)) {
      console.warn(`🚨 Suspicious request detected: ${req.path} from ${req.ip}`);

      // Log to audit
      if (req.userId) {
        (async () => {
          try {
            const prisma = (await import('../lib/db')).default;
            await prisma.auditLog.create({
              data: {
                userId: req.userId!,
                action: 'SUSPICIOUS_REQUEST',
                entity: 'SECURITY',
                entityId: req.path,
                ipAddress: req.ip,
                userAgent: req.get('user-agent'),
                status: 'SUSPICIOUS',
              },
            });
          } catch (error) {
            console.error('Failed to log suspicious request:', error);
          }
        })();
      }

      // In production, block suspicious requests
      if (process.env.NODE_ENV === 'production') {
        res.status(400).json({ error: 'Invalid request' });
        return;
      }
    }
  }

  next();
};

// ============================================
// API KEY VALIDATION (Optional)
// ============================================

export const validateAPIKey = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.headers['x-api-key'] as string;

  if (process.env.API_KEY && req.path.startsWith('/api/')) {
    // Only require API key for specific routes
    if (req.path.includes('/admin/') && !apiKey) {
      res.status(401).json({ error: 'API key required' });
      return;
    }

    if (apiKey && apiKey !== process.env.API_KEY) {
      res.status(401).json({ error: 'Invalid API key' });
      return;
    }
  }

  next();
};
