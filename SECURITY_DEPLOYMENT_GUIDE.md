# Security Implementation - Deployment Guide

## ✅ What Was Added

### 1. Prisma Schema Updates
Added two new security logging models in `prisma/schema.prisma`:

```prisma
model SecurityLog {
  id        Int      @id @default(autoincrement())
  event     String   
  userId    Int
  userRole  String   
  success   Boolean
  ipAddress String
  userAgent String
  metadata  Json?    
  createdAt DateTime @default(now())

  @@index([userId, event])
  @@index([createdAt])
}

model FailedActivation {
  id        Int      @id @default(autoincrement())
  token     String
  ipAddress String
  userAgent String
  reason    String   
  metadata  Json?    
  createdAt DateTime @default(now())

  @@index([token])
  @@index([ipAddress])
  @@index([createdAt])
}
```

### 2. Documentation Created
- ✅ `ACTIVATION_SECURITY_GUIDE.md` - Complete security implementation guide
- ✅ `VERCEL_R2_DEBUG.md` - R2 troubleshooting guide
- ✅ `R2_FINAL_FIX.md` - R2 upload fix details

---

## 🚀 Deployment Steps

### Step 1: Generate and Apply Database Migration

```bash
# Create the migration
npx prisma migrate dev --name add_security_logging_tables

# Or if you want to do it manually:
# 1. Create migration file
npx prisma migrate dev --create-only --name add_security_logging_tables

# 2. Review the generated SQL in prisma/migrations/

# 3. Apply the migration
npx prisma migrate deploy
```

### Step 2: Regenerate Prisma Client

```bash
npx prisma generate
```

### Step 3: Commit All Changes

```bash
git add -A
git commit -m "Add security logging tables and documentation"
git push origin student-dashboard
```

### Step 4: Deploy to Production (Vercel)

The migration will run automatically on Vercel, OR you can run it manually:

```bash
# In Vercel dashboard, add this to your build command:
npx prisma migrate deploy && next build
```

---

## 📋 Migration SQL Preview

When you run the migration, it will create these tables:

```sql
-- CreateTable
CREATE TABLE "SecurityLog" (
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

-- CreateTable
CREATE TABLE "FailedActivation" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FailedActivation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SecurityLog_userId_event_idx" ON "SecurityLog"("userId", "event");

-- CreateIndex
CREATE INDEX "SecurityLog_createdAt_idx" ON "SecurityLog"("createdAt");

-- CreateIndex
CREATE INDEX "FailedActivation_token_idx" ON "FailedActivation"("token");

-- CreateIndex
CREATE INDEX "FailedActivation_ipAddress_idx" ON "FailedActivation"("ipAddress");

-- CreateIndex
CREATE INDEX "FailedActivation_createdAt_idx" ON "FailedActivation"("createdAt");
```

---

## ⚠️ Important Notes

### About the Security Tables

1. **SecurityLog**: Tracks all security-related events
   - Account activations
   - Login attempts
   - Password resets
   - Permission changes
   
2. **FailedActivation**: Logs failed activation attempts
   - Helps detect brute force attacks
   - Identifies compromised tokens
   - Provides audit trail

### Data Retention

Consider adding a cleanup job to prevent these tables from growing too large:

```typescript
// Run this monthly via cron job
await prisma.securityLog.deleteMany({
  where: {
    createdAt: {
      lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // 90 days ago
    }
  }
})

await prisma.failedActivation.deleteMany({
  where: {
    createdAt: {
      lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
    }
  }
})
```

---

## 🔍 Testing the Security Features

### 1. Test Security Logging

After deploying, check if logs are being created:

```typescript
// In your API route or console
const logs = await prisma.securityLog.findMany({
  take: 10,
  orderBy: { createdAt: 'desc' }
})
console.log('Recent security events:', logs)
```

### 2. Test Failed Activation Tracking

Try using an invalid token and check the FailedActivation table:

```typescript
const failedAttempts = await prisma.failedActivation.findMany({
  where: {
    ipAddress: 'YOUR_IP'
  },
  orderBy: { createdAt: 'desc' }
})
console.log('Failed attempts:', failedAttempts)
```

---

## 🎯 Next Steps (Future Implementation)

The activation API and password validation utilities are documented but not yet created. To implement them:

1. **Create Rate Limiting**:
   - Install Upstash Redis: `npm install @upstash/redis @upstash/ratelimit`
   - Add Redis URL to Vercel env vars
   - Implement rate limiting middleware

2. **Create Activation API**:
   - Implement `/app/api/auth/activate/route.ts` with all security features
   - Add password strength validation utility

3. **Update Frontend**:
   - Add password strength indicator
   - Show real-time validation feedback

---

## 📊 Monitoring Dashboard (Future)

Consider building an admin dashboard to view security logs:

```typescript
// /app/admin/security/page.tsx
export default async function SecurityDashboard() {
  const recentLogs = await prisma.securityLog.findMany({
    take: 100,
    orderBy: { createdAt: 'desc' }
  })
  
  const failedAttempts = await prisma.failedActivation.groupBy({
    by: ['ipAddress'],
    _count: true,
    orderBy: { _count: { ipAddress: 'desc' } },
    take: 10
  })
  
  return (
    <div>
      <h1>Security Dashboard</h1>
      {/* Display logs and stats */}
    </div>
  )
}
```

---

## ✅ Checklist

Before deploying to production:

- [ ] Run `npx prisma migrate dev --name add_security_logging_tables`
- [ ] Run `npx prisma generate`
- [ ] Test locally that new tables exist
- [ ] Commit and push changes
- [ ] Verify R2_ENDPOINT is set in Vercel (already documented)
- [ ] Deploy to Vercel
- [ ] Check Vercel logs for successful migration
- [ ] Test activation flow in production

---

## 🆘 Troubleshooting

### Migration Fails

If migration fails, you can apply it manually:

1. Copy the SQL from the migration file
2. Connect to your Supabase database
3. Run the SQL commands manually

### Tables Already Exist

If you get "table already exists" error:

```bash
npx prisma db push --skip-generate
```

This will sync your schema without creating a migration.

---

## Summary

✅ **Schema Updated**: SecurityLog and FailedActivation models added  
✅ **Documentation Complete**: All guides created  
⏳ **Next**: Run migration and deploy  

**Current State**: Code is ready, just needs database migration and deployment!
