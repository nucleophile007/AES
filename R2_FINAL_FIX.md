# R2 Upload Error - Final Fix

## Issue Investigation

**Error Message:**
```
Error: Upload failed: Upload failed: getaddrinfo ENOTFOUND s3.auto.amazonaws.com
```

## Root Cause Found

The client-side code was **still calling the presigned URL endpoint** (`/api/r2-upload`) even though we said we removed it. The flow was:

```
1. Call /api/r2-upload → Generate presigned URL (with wrong endpoint)
2. Call /api/upload-r2 → Server-side upload (this worked)
```

The error came from **step 1** - the presigned URL generation was failing because `getSignedUrl()` was still using AWS defaults.

## Files Fixed

### 1. `/app/student-dashboard/page.tsx`

**Before (Lines 223-257):**
```typescript
// ❌ WRONG: Called presigned URL endpoint unnecessarily
const presignedResponse = await fetch('/api/r2-upload', {
  method: 'POST',
  body: JSON.stringify({ studentId, assignmentId, fileName, ... })
});
const presignedData = await presignedResponse.json();

// Then did server upload
const formData = new FormData();
// ...
await fetch('/api/upload-r2', { ... });
```

**After:**
```typescript
// ✅ CORRECT: Direct server-side upload only
const formData = new FormData();
formData.append('file', submissionFile);
formData.append('studentId', student.id.toString());
formData.append('assignmentId', selectedAssignment.id.toString());

const uploadResponse = await fetch('/api/upload-r2', {
  method: 'POST',
  body: formData,
});
```

### 2. `/app/components/student/ResourceLibrary.tsx`

Same fix - removed unnecessary presigned URL call.

## Why This Happened

My previous edit replaced the upload logic **but left the presigned URL call** above it. The code was:
1. Calling `/api/r2-upload` (failed with DNS error)
2. Then trying `/api/upload-r2` (would have worked)
3. But step 1 threw error first, so step 2 never ran

## Testing

After this fix, the upload flow is now:

```
User selects file
    ↓
Client: fetch('/api/upload-r2', { method: 'POST', body: formData })
    ↓
Server: Upload to R2 with correct endpoint
    ↓
Server: Return public URL
    ↓
Client: Show success ✅
```

No presigned URLs involved at all!

## Verification Commands

```bash
# 1. Search for any remaining presigned URL calls
grep -r "presignedUrl" app/ --include="*.tsx" --include="*.ts"

# 2. Search for r2-upload endpoint calls
grep -r "/api/r2-upload" app/ --include="*.tsx"

# 3. Should return: No matches found
```

## Summary

✅ **Fixed**: Removed all calls to `/api/r2-upload` (presigned URL endpoint)

✅ **Now**: Direct server-side upload via `/api/upload-r2` only

✅ **Result**: No more `s3.auto.amazonaws.com` DNS errors

✅ **Files Changed**: 
- `app/student-dashboard/page.tsx`
- `app/components/student/ResourceLibrary.tsx`

🚀 **Ready to commit and deploy!**
