-- ============================================
-- MIGRATION: DNSExit SMTP Support
-- Add smtpHost and smtpPort fields to EmailLog
-- ============================================

-- Add SMTP tracking fields to EmailLog table
ALTER TABLE "EmailLog" ADD COLUMN IF NOT EXISTS "smtpHost" TEXT;
ALTER TABLE "EmailLog" ADD COLUMN IF NOT EXISTS "smtpPort" INTEGER;

-- Update default provider to DNSExit
ALTER TABLE "EmailLog" ALTER COLUMN "provider" SET DEFAULT 'DNSExit';

-- Update existing records (if any)
UPDATE "EmailLog" SET "provider" = 'DNSExit' WHERE "provider" = 'gmail';
