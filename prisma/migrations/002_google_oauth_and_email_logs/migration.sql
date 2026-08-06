-- ============================================
-- MIGRATION: Google OAuth Only + Email Logs
-- ============================================

-- Remove password-based authentication fields from User table
ALTER TABLE "User" DROP COLUMN IF EXISTS "passwordHash";
ALTER TABLE "User" DROP COLUMN IF EXISTS "username";
ALTER TABLE "User" DROP COLUMN IF EXISTS "displayName";
ALTER TABLE "User" DROP COLUMN IF EXISTS "emailVerified";
ALTER TABLE "User" DROP COLUMN IF EXISTS "emailVerificationToken";
ALTER TABLE "User" DROP COLUMN IF EXISTS "passwordResetToken";
ALTER TABLE "User" DROP COLUMN IF EXISTS "passwordResetExpires";
ALTER TABLE "User" DROP COLUMN IF EXISTS "loginAttempts";
ALTER TABLE "User" DROP COLUMN IF EXISTS "lockUntil";
ALTER TABLE "User" DROP COLUMN IF EXISTS "twoFactorEnabled";
ALTER TABLE "User" DROP COLUMN IF EXISTS "twoFactorSecret";
ALTER TABLE "User" DROP COLUMN IF EXISTS "googleAccessToken";
ALTER TABLE "User" DROP COLUMN IF EXISTS "googleRefreshToken";
ALTER TABLE "User" DROP COLUMN IF EXISTS "oauthProvider";
ALTER TABLE "User" DROP COLUMN IF EXISTS "oauthProviderId";
ALTER TABLE "User" DROP COLUMN IF EXISTS "deletedAt";

-- Add name field if not exists
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "name" TEXT;

-- Make googleId required and unique
ALTER TABLE "User" ALTER COLUMN "googleId" SET NOT NULL;

-- Drop unused indexes
DROP INDEX IF EXISTS "User_username_key";
DROP INDEX IF EXISTS "User_emailVerificationToken_key";
DROP INDEX IF EXISTS "User_passwordResetToken_key";

-- ============================================
-- EMAIL LOGGING TABLE
-- ============================================

-- Create EmailType enum
DO $$ BEGIN
  CREATE TYPE "EmailType" AS ENUM ('PURCHASE_CONFIRMATION', 'PAYMENT_RECEIPT', 'SYSTEM_NOTIFICATION', 'CUSTOM');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create EmailStatus enum
DO $$ BEGIN
  CREATE TYPE "EmailStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'RETRY_SCHEDULED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create EmailLog table
CREATE TABLE IF NOT EXISTS "EmailLog" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT,
  "orderId" TEXT,
  "storyId" TEXT,
  "templateId" TEXT,
  "recipientEmail" TEXT NOT NULL,
  "senderEmail" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "emailType" "EmailType" NOT NULL,
  "status" "EmailStatus" NOT NULL DEFAULT 'PENDING',
  "provider" TEXT NOT NULL DEFAULT 'gmail',
  "providerMessageId" TEXT,
  "errorMessage" TEXT,
  "retryCount" INTEGER NOT NULL DEFAULT 0,
  "sentAt" TIMESTAMP(3),
  "failedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "EmailLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "EmailLog_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "EmailLog_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "EmailLog_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create indexes for EmailLog
CREATE INDEX IF NOT EXISTS "EmailLog_userId_idx" ON "EmailLog"("userId");
CREATE INDEX IF NOT EXISTS "EmailLog_orderId_idx" ON "EmailLog"("orderId");
CREATE INDEX IF NOT EXISTS "EmailLog_recipientEmail_idx" ON "EmailLog"("recipientEmail");
CREATE INDEX IF NOT EXISTS "EmailLog_status_idx" ON "EmailLog"("status");
CREATE INDEX IF NOT EXISTS "EmailLog_emailType_idx" ON "EmailLog"("emailType");
CREATE INDEX IF NOT EXISTS "EmailLog_createdAt_idx" ON "EmailLog"("createdAt");
