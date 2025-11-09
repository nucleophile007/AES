# Database Migration Guide - Security Tables

## Current Situation
- ✅ Baseline migration marked as applied (0_init)
- ❌ Database connection intermittent through Prisma
- ⚠️ Need to add SecurityLog and FailedActivation tables

## Option 1: Manual SQL (Fastest - 2 minutes)

### Step 1: Go to Supabase Dashboard
1. Open: https://supabase.com/dashboard/project/[your-project-id]/sql
2. Click "New Query"

### Step 2: Run Migration SQL
Copy and paste from `prisma/manual-migration.sql`:

```sql
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

-- Create indexes
CREATE INDEX IF NOT EXISTS "SecurityLog_userId_event_idx" ON "SecurityLog"("userId", "event");
CREATE INDEX IF NOT EXISTS "SecurityLog_createdAt_idx" ON "SecurityLog"("createdAt");
CREATE INDEX IF NOT EXISTS "FailedActivation_token_idx" ON "FailedActivation"("token");
CREATE INDEX IF NOT EXISTS "FailedActivation_ipAddress_idx" ON "FailedActivation"("ipAddress");
CREATE INDEX IF NOT EXISTS "FailedActivation_createdAt_idx" ON "FailedActivation"("createdAt");
```

### Step 3: Verify
Run this query to confirm:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('SecurityLog', 'FailedActivation');
```

Should return 2 rows.

### Step 4: Update Migration History (Local)
When database connection is stable, run:
```bash
npx prisma migrate dev --name add_security_logging_tables --create-only
npx prisma migrate resolve --applied add_security_logging_tables
```

## Option 2: Deploy and Let Vercel Handle It (Automatic)

### How it works:
1. When you deploy to Vercel, the build process runs
2. Vercel will run `npx prisma generate`
3. On first request, Prisma will detect schema changes
4. Tables will be created automatically via `prisma db push` in production

### Steps:
1. **Add R2_ENDPOINT to Vercel**:
   - Go to: Vercel Dashboard → Settings → Environment Variables
   - Add: `R2_ENDPOINT` = `https://e6159c1af11ad8675b988602868e4ca3.r2.cloudflarestorage.com`
   - Apply to: Production, Preview, Development

2. **Deploy**: 
   ```bash
   git push origin student-dashboard
   ```

3. **Merge to main** (if needed):
   - Create PR from student-dashboard → main
   - Merge and deploy

4. **Monitor**: Check Vercel deployment logs for any Prisma errors

## Option 3: Wait and Retry (When Connection Stabilizes)

```bash
# Try again later when Supabase connection is stable
npx prisma migrate dev --name add_security_logging_tables
```

## Recommendation

**Use Option 1 (Manual SQL)** because:
- ✅ Fastest (2 minutes)
- ✅ No data loss risk
- ✅ You can verify immediately
- ✅ Independent of connection issues
- ✅ Works regardless of Prisma state

After running manual SQL, your activation API will work perfectly! 🚀

## What This Enables

Once tables exist, the activation system will:
- ✅ Log all activation attempts to `SecurityLog`
- ✅ Track failed attempts in `FailedActivation`
- ✅ Lock accounts after 5 failed attempts
- ✅ Rate limit by IP (5 attempts per 15 min)
- ✅ Enforce strong passwords (12+ chars, mixed case, numbers, special chars)
