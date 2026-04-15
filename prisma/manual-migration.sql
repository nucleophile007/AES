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

-- Create RefreshToken table for rotating refresh sessions
CREATE TABLE IF NOT EXISTS "RefreshToken" (
    "id" SERIAL NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "userRole" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");
CREATE INDEX IF NOT EXISTS "RefreshToken_userId_userRole_idx" ON "RefreshToken"("userId", "userRole");
CREATE INDEX IF NOT EXISTS "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");
CREATE INDEX IF NOT EXISTS "RefreshToken_revokedAt_idx" ON "RefreshToken"("revokedAt");

-- Verify tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('SecurityLog', 'FailedActivation', 'RefreshToken');
