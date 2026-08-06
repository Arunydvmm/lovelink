import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient | null = null;

declare const globalThis: {
  prismaGlobal: PrismaClient | null;
};

function initializePrisma(): PrismaClient {
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    const errorMsg = `
❌ CRITICAL ERROR: DATABASE_URL not set in environment

This is required for LoveLink to function. To fix:

1. Go to: https://dashboard.render.com
2. Select service: lovelink
3. Click "Environment" tab
4. Add key: DATABASE_URL
5. Value: [Your PostgreSQL connection string from Neon/Render]
6. Click "Save Changes"
7. Go to service page → Click ⋯ → Manual Deploy → Deploy latest commit

If you need help getting DATABASE_URL:
- Go to Services → lovelink-db (PostgreSQL service)
- Click "Info" tab
- Copy "Internal Database URL"
- Paste into DATABASE_URL in lovelink service Environment
    `.trim();
    
    console.error(errorMsg);
    throw new Error('DATABASE_URL environment variable is not set. See logs above for instructions.');
  }

  console.log('📦 Initializing Prisma Client...');
  
  if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient({
      log: ['error', 'warn'],
      errorFormat: 'pretty',
    });
    console.log('✅ Prisma Client initialized for production');
  } else {
    if (!globalThis.prismaGlobal) {
      globalThis.prismaGlobal = new PrismaClient({
        log: ['query', 'error', 'warn', 'info'],
        errorFormat: 'pretty',
      });
      console.log('✅ Prisma Client initialized for development');
    }
    prisma = globalThis.prismaGlobal;
  }

  return prisma;
}

// Initialize Prisma immediately on module load
try {
  prisma = initializePrisma();
} catch (error) {
  console.error('Failed to initialize Prisma:', error);
  // Don't throw - let server start so user can see the error message
  // The health check will fail and that's the signal something is wrong
}

export default prisma!;
