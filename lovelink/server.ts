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
  app.use(secureHeadersMiddleware);
  app.use(securityMonitoringMiddleware);

  // ============================================
  // RATE LIMITING
  // ============================================

  app.use(generalLimiter);

  // ============================================
  // HEALTH CHECK
  // ============================================

  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      time: new Date().toISOString(),
      environment: config.env,
      uptime: process.uptime(),
    });
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

    // Verify SMTP connection
    try {
      const { emailService } = await import('./src/lib/email/EmailService');
      const smtpVerified = await emailService.verify();
      if (smtpVerified) {
        console.log('📧 DNSExit SMTP connection verified');
      } else {
        console.warn('⚠️ DNSExit SMTP connection failed - emails may not send');
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
