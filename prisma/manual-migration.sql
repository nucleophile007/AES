-- Migration: Add Security Logging Tables
-- Run this SQL in your Supabase SQL Editor

-- Create SecurityLog table
CREATE TABLE IF NOT EXISTS "SecurityLog" (
    "id" SERIAL NOT NULL,
    "event" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "userRole" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecurityLog_pkey" PRIMARY KEY ("id")
);

-- Create FailedActivation table
CREATE TABLE IF NOT EXISTS "FailedActivation" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FailedActivation_pkey" PRIMARY KEY ("id")
);

-- Create indexes for SecurityLog
CREATE INDEX IF NOT EXISTS "SecurityLog_userId_event_idx" ON "SecurityLog"("userId", "event");
CREATE INDEX IF NOT EXISTS "SecurityLog_createdAt_idx" ON "SecurityLog"("createdAt");

-- Create indexes for FailedActivation
CREATE INDEX IF NOT EXISTS "FailedActivation_token_idx" ON "FailedActivation"("token");
CREATE INDEX IF NOT EXISTS "FailedActivation_ipAddress_idx" ON "FailedActivation"("ipAddress");
CREATE INDEX IF NOT EXISTS "FailedActivation_createdAt_idx" ON "FailedActivation"("createdAt");

-- Verify tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('SecurityLog', 'FailedActivation');
