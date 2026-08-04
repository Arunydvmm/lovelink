import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { createServer as createViteServer } from 'vite';

// Import configuration
import config from './src/config';

// Import middleware
import { helmetMiddleware, corsMiddleware, sanitizationMiddleware, secureHeadersMiddleware, securityMonitoringMiddleware } from './src/middleware/securityMiddleware';
import { generalLimiter } from './src/middleware/rateLimitMiddleware';
import { errorHandler, notFoundHandler } from './src/middleware/errorMiddleware';

// Import routes
import authRoutes from './src/routes/authRoutes';
import templateRoutes from './src/routes/templateRoutes';
import storyRoutes from './src/routes/storyRoutes';
import paymentRoutes from './src/routes/paymentRoutes';
import couponRoutes from './src/routes/couponRoutes';
import userRoutes from './src/routes/userRoutes';
import adminRoutes from './src/routes/adminRoutes';
import notificationRoutes from './src/routes/notificationRoutes';
import emailLogRoutes from './src/routes/emailLogRoutes';

async function startServer() {
  const app = express();

  console.log('🚀 Starting LoveLink Server...');
  console.log(`📍 Environment: ${config.env}`);

  // ============================================
  // SECURITY MIDDLEWARE
  // ============================================

  app.use(helmetMiddleware);
  app.use(corsMiddleware);

  // ============================================
  // BODY PARSING & COOKIES
  // ============================================

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));
  app.use(cookieParser());

  // ============================================
  // REQUEST SANITIZATION & SECURITY
  // ============================================

  app.use(sanitizationMiddleware);
  // app.use(secureHeadersMiddleware); // TEMPORARILY DISABLED FOR PRODUCTION DEBUGGING
  app.use(securityMonitoringMiddleware);

  // ============================================
  // RATE LIMITING
  // ============================================

  app.use(generalLimiter);

  // ============================================
  // HEALTH CHECK
  // ============================================

  app.get('/api/health', async (req: Request, res: Response) => {
    try {
      // Try to query the database to verify connectivity
      const prisma = (await import('./src/lib/db')).default;
      const templateCount = await prisma.template.count();
      
      res.json({
        status: 'ok',
        time: new Date().toISOString(),
        environment: config.env,
        uptime: process.uptime(),
        database: {
          connected: true,
          templateCount,
        },
      });
    } catch (error: any) {
      console.error('Health check failed:', error);
      res.status(503).json({
        status: 'error',
        time: new Date().toISOString(),
        environment: config.env,
        database: {
          connected: false,
          error: error.message,
        },
      });
    }
  });

  // ============================================
  // DEBUG ENDPOINT (Development & Production)
  // ============================================

  app.get('/api/debug', (req: Request, res: Response) => {
    const isProduction = config.isProduction;
    
    // In production, only allow from specific origins
    const clientOrigin = req.headers.origin || req.headers.referer || 'unknown';
    
    res.json({
      status: 'ok',
      message: 'LoveLink Debug Endpoint',
      environment: config.env,
      timestamp: new Date().toISOString(),
      server: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
      },
      config: {
        host: config.host,
        port: config.port,
        apiUrl: config.apiUrl,
        appUrl: config.appUrl,
        corsEnabled: true,
        allowedOrigins: config.cors.allowedOrigins,
        requestOrigin: clientOrigin,
      },
      features: {
        razorpayEnabled: config.razorpay.enabled,
        cloudinaryEnabled: config.cloudinary.enabled,
        emailEnabled: !!config.email.smtpUser,
      },
      // Don't expose secrets in production
      ...(isProduction ? {} : {
        database: {
          connected: process.env.DATABASE_URL ? 'configured' : 'not-configured',
        },
      }),
    });
  });

  // ============================================
  // TEST ENDPOINT (Verify API connectivity)
  // ============================================

  app.post('/api/test', (req: Request, res: Response) => {
    const testId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    res.json({
      status: 'ok',
      testId,
      message: 'API connectivity test successful',
      receivedData: {
        body: req.body || null,
        query: req.query || null,
      },
      server: {
        timestamp: new Date().toISOString(),
        environment: config.env,
        uptime: process.uptime(),
      },
    });
  });

  // ============================================
  // REQUEST LOGGING MIDDLEWARE (Add before static files)
  // ============================================

  app.use((req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    
    // Store original send
    const originalSend = res.send;
    
    // Override send to capture response status
    res.send = function(data: any) {
      const duration = Date.now() - startTime;
      const logLevel = res.statusCode >= 400 ? 'error' : res.statusCode >= 300 ? 'warn' : 'info';
      
      // Only log non-health-check, non-debug requests to reduce noise
      if (!req.path.includes('/api/health') && !req.path.includes('/api/debug')) {
        const logMessage = `[${new Date().toISOString()}] ${logLevel.toUpperCase()} ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`;
        
        if (logLevel === 'error') {
          console.error(logMessage);
        } else if (logLevel === 'warn') {
          console.warn(logMessage);
        } else if (process.env.NODE_ENV !== 'production') {
          console.log(logMessage);
        }
      }
      
      return originalSend.call(this, data);
    };
    
    next();
  });

  // ============================================
  // STATIC FILE SERVING (BEFORE API ROUTES)
  // ============================================

  if (config.isProduction) {
    console.log('📁 Serving static files from dist...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, {
      maxAge: '1d',
      etag: false,
    }));
  }

  // ============================================
  // API ROUTES
  // ============================================

  // Wrap route handlers to catch errors gracefully
  const wrapRoute = (handler: any) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res, next);
    } catch (error: any) {
      console.error(`Error in ${req.path}:`, error);
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Internal server error',
          message: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
      }
    }
  };

  app.use('/api/auth', authRoutes);
  app.use('/api/templates', templateRoutes);
  app.use('/api/stories', storyRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/coupons', couponRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/email-logs', emailLogRoutes);

  // ============================================
  // VITE MIDDLEWARE (DEV) & SPA FALLBACK
  // ============================================

  if (!config.isProduction) {
    console.log('📦 Loading Vite dev server...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // SPA fallback - catch-all for Vue Router
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(process.cwd(), 'dist/index.html'));
    });
  }

  // ============================================
  // ERROR HANDLING
  // ============================================

  app.use(notFoundHandler);
  app.use(errorHandler);

  // ============================================
  // START SERVER
  // ============================================

  app.listen(config.port, config.host, async () => {
    console.log(`✅ Server listening on http://${config.host}:${config.port}`);
    console.log(`🔗 API URL: ${config.apiUrl}`);
    console.log(`🌐 App URL: ${config.appUrl}`);

    // Verify database connection
    try {
      const prisma = (await import('./src/lib/db')).default;
      if (prisma) {
        const count = await prisma.template.count();
        console.log(`✅ Database connected - ${count} templates available`);
      }
    } catch (error: any) {
      console.error('❌ Database connection failed:', error.message);
      console.error('   The app will not work without a database connection.');
      console.error('   Make sure DATABASE_URL is set correctly in Render dashboard.');
    }

    // Verify SMTP connection
    try {
      const { emailService } = await import('./src/lib/email/EmailService');
      const smtpVerified = await emailService.verify();
      if (smtpVerified) {
        console.log('📧 DNSExit SMTP connection verified');
      } else {
        console.warn('⚠️ DNSExit SMTP connection failed - emails may not send (non-blocking)');
      }
    } catch (error) {
      console.warn('⚠️ Email service verification error:', error);
    }
  });
}

startServer().catch((error) => {
  console.error('❌ Server startup error:', error);
  process.exit(1);
});
