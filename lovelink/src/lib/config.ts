import path from 'path';

// ============================================
// ENVIRONMENT VALIDATION
// ============================================

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'NODE_ENV',
];

const optionalEnvVars = [
  'PORT',
  'VITE_API_URL',
  'VITE_APP_URL',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'RAZORPAY_WEBHOOK_SECRET',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];

export const validateEnvironment = (): void => {
  const missingVars: string[] = [];

  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach((varName) => {
      console.error(`   - ${varName}`);
    });
    process.exit(1);
  }

  // Validate specific format requirements
  if (process.env.NODE_ENV && !['development', 'staging', 'production'].includes(process.env.NODE_ENV)) {
    console.error('❌ NODE_ENV must be "development", "staging", or "production"');
    process.exit(1);
  }

  if (process.env.PORT && isNaN(parseInt(process.env.PORT))) {
    console.error('❌ PORT must be a valid number');
    process.exit(1);
  }

  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('postgresql://')) {
    console.warn('⚠️ DATABASE_URL does not appear to be a PostgreSQL connection string');
  }

  console.log('✅ Environment validation passed');
};

// ============================================
// CONFIGURATION OBJECT
// ============================================

export const config = {
  // Environment
  env: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isStaging: process.env.NODE_ENV === 'staging',
  isProduction: process.env.NODE_ENV === 'production',

  // Server
  port: parseInt(process.env.PORT || '3000'),
  host: process.env.HOST || '0.0.0.0',
  apiUrl: process.env.VITE_API_URL || 'http://localhost:3000',
  appUrl: process.env.VITE_APP_URL || 'http://localhost:5173',

  // Database
  databaseUrl: process.env.DATABASE_URL || '',

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || '',
    refreshSecret: process.env.JWT_REFRESH_SECRET || '',
    expiresIn: process.env.JWT_EXPIRE || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
  },

  // Authentication
  auth: {
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL || `http://localhost:3000/auth/google/callback`,
  },

  // Razorpay
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
    enabled:
      !!process.env.RAZORPAY_KEY_ID &&
      !!process.env.RAZORPAY_KEY_SECRET &&
      !!process.env.RAZORPAY_WEBHOOK_SECRET,
  },

  // Email
  email: {
    smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
    smtpPort: parseInt(process.env.SMTP_PORT || '587'),
    smtpUser: process.env.SMTP_USER || '',
    smtpPass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'noreply@lovelink.app',
    fromName: process.env.SMTP_FROM_NAME || 'LoveLink',
  },

  // Cloudinary
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || 'unsigned_preset',
    enabled: !!process.env.CLOUDINARY_CLOUD_NAME,
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    loginMaxAttempts: parseInt(process.env.RATE_LIMIT_LOGIN_MAX || '5'),
    loginWindowMs: parseInt(process.env.RATE_LIMIT_LOGIN_WINDOW || '900000'),
  },

  // CORS
  cors: {
    allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000').split(','),
    credentials: true,
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
  },

  // Feature Flags
  features: {
    emailNotifications: process.env.FEATURE_EMAIL_NOTIFICATIONS !== 'false',
    twoFactorAuth: process.env.FEATURE_TWO_FACTOR_AUTH === 'true',
    analyticsTracking: process.env.FEATURE_ANALYTICS === 'true',
  },

  // Session
  session: {
    cookieName: 'authToken',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
};

// ============================================
// ENVIRONMENT PATHS
// ============================================

export const paths = {
  root: process.cwd(),
  src: path.join(process.cwd(), 'src'),
  dist: path.join(process.cwd(), 'dist'),
  public: path.join(process.cwd(), 'public'),
  logs: path.join(process.cwd(), 'logs'),
};

// ============================================
// FEATURE FLAGS
// ============================================

export const isFeatureEnabled = (featureName: string): boolean => {
  const featureKey = `FEATURE_${featureName.toUpperCase()}`;
  return process.env[featureKey] === 'true';
};

// ============================================
// DATABASE CONNECTION STRING
// ============================================

export const getDatabaseUrl = (): string => {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  // Construct from individual variables if provided
  if (
    process.env.DB_HOST &&
    process.env.DB_USER &&
    process.env.DB_PASSWORD &&
    process.env.DB_NAME
  ) {
    const port = process.env.DB_PORT || '5432';
    return `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${port}/${process.env.DB_NAME}`;
  }

  throw new Error('DATABASE_URL or database configuration is missing');
};

// ============================================
// SECRETS MANAGEMENT
// ============================================

export const getSecret = (secretName: string): string => {
  const value = process.env[secretName];

  if (!value) {
    console.warn(`⚠️ Secret "${secretName}" not found in environment`);
    return '';
  }

  return value;
};

export const requireSecret = (secretName: string): string => {
  const value = process.env[secretName];

  if (!value) {
    throw new Error(`Required secret "${secretName}" not found in environment`);
  }

  return value;
};

// ============================================
// DEBUG UTILITIES
// ============================================

export const printConfigSummary = (): void => {
  if (!config.isDevelopment) {
    return;
  }

  console.log('\n📋 Configuration Summary:');
  console.log(`  Environment: ${config.env}`);
  console.log(`  Server: ${config.host}:${config.port}`);
  console.log(`  API URL: ${config.apiUrl}`);
  console.log(`  App URL: ${config.appUrl}`);
  console.log(`  Database: ${config.databaseUrl.split('@')[1] || 'configured'}`);
  console.log(`  Razorpay: ${config.razorpay.enabled ? '✅ Enabled' : '❌ Disabled'}`);
  console.log(`  Cloudinary: ${config.cloudinary.enabled ? '✅ Enabled' : '❌ Disabled'}`);
  console.log(`  Email Service: ${config.email.smtpUser ? '✅ Enabled' : '❌ Disabled'}`);
  console.log();
};

export const printEnvironmentStatus = (): void => {
  console.log('\n🔍 Environment Status:');

  // Check required secrets
  const secrets = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
  secrets.forEach((secret) => {
    const status = process.env[secret] ? '✅' : '❌';
    console.log(`  ${status} ${secret}`);
  });

  // Check optional services
  console.log('\n  Optional Services:');
  console.log(
    `    ${config.razorpay.enabled ? '✅' : '❌'} Razorpay Payment Gateway`
  );
  console.log(`    ${config.cloudinary.enabled ? '✅' : '❌'} Cloudinary Media`);
  console.log(`    ${config.email.smtpUser ? '✅' : '❌'} Email Service`);
  console.log();
};
