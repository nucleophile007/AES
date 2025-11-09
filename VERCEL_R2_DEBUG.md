# Debugging R2 Upload Error in Vercel Production

## The Error
```
Error: Upload failed: Upload failed: getaddrinfo ENOTFOUND s3.auto.amazonaws.com
```

## Critical Checklist for Vercel

### 1. ✅ Verify Environment Variables in Vercel

Go to your Vercel project dashboard and check these variables:

```bash
R2_ENDPOINT=https://e6159c1af11ad8675b988602868e4ca3.r2.cloudflarestorage.com
R2_BUCKET_NAME=aes-student-files
R2_ACCESS_KEY_ID=44f8010012627b42829052805d85b697
R2_SECRET_ACCESS_KEY=c043ba798ef661ec402b908f0ef8887b82dcefabbc339b973701aafe1ca02dc4
R2_PUBLIC_URL=https://pub-6860df273959446786e5c3556348f4b4.r2.dev
```

**Important**: Make sure `R2_ENDPOINT` is set correctly in Vercel!

### 2. ✅ Force Redeploy in Vercel

Your latest code might not be deployed. Do this:

**Option A: Via Vercel Dashboard**
1. Go to https://vercel.com/dashboard
2. Find your project
3. Go to "Deployments" tab
4. Click on the latest deployment
5. Click "Redeploy" button
6. Select "Use existing Build Cache: No"

**Option B: Via Git Push**
```bash
# Make a small change to force redeploy
git commit --allow-empty -m "Force redeploy to Vercel"
git push origin student-dashboard
```

### 3. ✅ Check Which Code is Actually Deployed

Add logging to see what's happening:

In `/app/api/upload-r2/route.ts`, the code should log:
```
=== R2 Upload Debug ===
R2_ENDPOINT: https://e6159c1af11ad8675b988602868e4ca3.r2.cloudflarestorage.com
```

If you see this in Vercel logs, the code is correct. If not, redeploy.

### 4. ✅ Check Vercel Function Logs

1. Go to Vercel Dashboard → Your Project → Logs
2. Filter by `/api/upload-r2`
3. Look for the actual error message
4. Share the full log output

### 5. ✅ Verify the Build

Check if the latest commit is deployed:

1. Vercel Dashboard → Deployments
2. Click latest deployment
3. Check "Source" tab - should show commit `1db6aa8` or later
4. If not, trigger new deployment

---

## Most Likely Causes

### Cause 1: Environment Variable Not Set (80% likely)
**Symptom**: `R2_ENDPOINT` is undefined in production
**Solution**: Add it in Vercel dashboard → Settings → Environment Variables

### Cause 2: Old Build Cached (15% likely)
**Symptom**: Code changes not reflected
**Solution**: Redeploy without cache

### Cause 3: Code Not Merged to Production Branch (5% likely)
**Symptom**: Wrong branch deployed
**Solution**: Merge `student-dashboard` to `main` or configure Vercel to deploy from `student-dashboard`

---

## Quick Fix Commands

```bash
# 1. Check your current branch
git branch

# 2. Make sure latest code is pushed
git status

# 3. Force redeploy
git commit --allow-empty -m "Redeploy: Fix R2 endpoint configuration"
git push origin student-dashboard

# 4. Wait 2-3 minutes for Vercel to rebuild
```

---

## Verification Steps After Deploy

1. **Check Vercel Build Logs**
   - Should say "Building..."
   - Should complete without errors
   - Should show your latest commit hash

2. **Check Runtime Logs**
   - Go to Vercel → Logs
   - Try uploading a file
   - Look for these logs:
     ```
     ✅ R2_ENDPOINT: https://e6159c1af11ad8675b988602868e4ca3...
     ✅ File validation passed
     ✅ R2 upload successful
     ```

3. **If Still Failing**
   - Check for log: `R2_ENDPOINT: undefined` ← This means env var not set
   - Check for log: `forcePathStyle: false` ← This means old code deployed

---

## Emergency Debugging

If it's still failing after redeploy, add this temporary logging in `/app/api/upload-r2/route.ts`:

```typescript
export async function POST(request: NextRequest) {
  console.log('=== EMERGENCY DEBUG ===');
  console.log('R2_ENDPOINT:', process.env.R2_ENDPOINT);
  console.log('R2_BUCKET_NAME:', process.env.R2_BUCKET_NAME);
  console.log('forcePathStyle:', r2Client.config.forcePathStyle);
  console.log('Endpoint from client:', r2Client.config.endpoint);
  // ... rest of code
}
```

Then check Vercel logs for this output.

---

## The Fix Should Be Live

Your latest code (commit `1db6aa8`) has:
- ✅ `forcePathStyle: true` in `lib/r2.ts`
- ✅ No presigned URL calls in student dashboard
- ✅ Direct server-side upload only

**If Vercel is deploying this code correctly, it WILL work.**

The error you're seeing means either:
1. Old code is still deployed (need redeploy)
2. `R2_ENDPOINT` env var is not set in Vercel
3. Vercel is deploying from wrong branch

---

## Action Plan

1. **Right Now**: Check Vercel environment variables
2. **Then**: Force redeploy without cache
3. **Wait**: 2-3 minutes for build
4. **Test**: Upload a file
5. **If Still Fails**: Share Vercel function logs with me

Let me know what you see in the Vercel dashboard!
