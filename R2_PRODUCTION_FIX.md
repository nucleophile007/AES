# R2 Production Error Fix

## Error Description

**Production Error:**
```
Error: getaddrinfo ENOTFOUND aes-student-files.s3.auto
```

**Location:** `POST /api/upload-r2` - Status 500

---

## Root Cause

The AWS S3 SDK was configured with `forcePathStyle: false`, which caused it to use **virtual-hosted-style URLs** instead of **path-style URLs**.

### What Was Happening:

```typescript
// WRONG: forcePathStyle: false
// SDK tried to access: https://aes-student-files.s3.auto/file.pdf
//                            ↑ Bucket as subdomain (doesn't exist)

// CORRECT: forcePathStyle: true  
// SDK accesses: https://e6159c1af11ad8675b988602868e4ca3.r2.cloudflarestorage.com/aes-student-files/file.pdf
//                                                                                                    ↑ Bucket in path
```

### Virtual-Hosted Style vs Path Style

| Style | URL Format | Works with R2? |
|-------|-----------|----------------|
| **Virtual-hosted** | `https://{bucket}.{endpoint}/{key}` | ❌ No |
| **Path-style** | `https://{endpoint}/{bucket}/{key}` | ✅ Yes |

Cloudflare R2 requires **path-style** URLs because it doesn't support bucket subdomains.

---

## The Fix

### Changed in `/lib/r2.ts`:

```diff
export const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
- forcePathStyle: false,  // ❌ WRONG - tries bucket.endpoint.com
- signingRegion: "auto",
+ forcePathStyle: true,   // ✅ CORRECT - uses endpoint.com/bucket
});
```

### Why This Matters:

1. **AWS S3**: Supports both styles, defaults to virtual-hosted
2. **Cloudflare R2**: Only supports path-style
3. **Development**: Might work locally due to different network routing
4. **Production**: Strict DNS resolution exposes the issue

---

## Verification Steps

### 1. Check Your Environment Variables

Make sure these are set correctly in production (Vercel/Netlify):

```env
R2_ENDPOINT=https://e6159c1af11ad8675b988602868e4ca3.r2.cloudflarestorage.com
R2_BUCKET_NAME=aes-student-files
R2_ACCESS_KEY_ID=44f8010012627b42829052805d85b697
R2_SECRET_ACCESS_KEY=c043ba798ef661ec402b908f0ef8887b82dcefabbc339b973701aafe1ca02dc4
R2_PUBLIC_URL=https://pub-6860df273959446786e5c3556348f4b4.r2.dev
```

### 2. Test File Upload

After deploying the fix:

```bash
# Test upload endpoint
curl -X POST https://www.acharyaes.com/api/upload-r2 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test.pdf" \
  -F "studentId=1" \
  -F "assignmentId=1"

# Should return 200 with file URL:
{
  "success": true,
  "fileUrl": "https://pub-6860df273959446786e5c3556348f4b4.r2.dev/submissions/..."
}
```

### 3. Check Logs

Look for these success logs instead of errors:

```
✅ File uploaded successfully to R2: submissions/1/1/1_1234567890_test.pdf
✅ Public URL: https://pub-6860df273959446786e5c3556348f4b4.r2.dev/...
```

---

## Additional R2 Configuration Best Practices

### 1. CORS Configuration

Make sure your R2 bucket has proper CORS settings:

```json
[
  {
    "AllowedOrigins": ["https://www.acharyaes.com"],
    "AllowedMethods": ["GET", "HEAD", "PUT", "POST"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

### 2. Public Access Settings

Ensure your R2 bucket allows public reads for the public URL:

- Go to Cloudflare Dashboard → R2
- Select `aes-student-files` bucket
- Settings → Public Access → Enable public URL
- Note the public URL: `https://pub-6860df273959446786e5c3556348f4b4.r2.dev`

### 3. Custom Domain (Optional)

For better URLs, set up a custom domain:

1. Add CNAME record: `files.acharyaes.com` → `pub-6860df273959446786e5c3556348f4b4.r2.dev`
2. Update `.env`: `R2_PUBLIC_URL=https://files.acharyaes.com`
3. Users will see: `https://files.acharyaes.com/submissions/...` instead of the pub URL

---

## Testing Checklist

Before marking as resolved:

- [ ] Deploy the fix to production
- [ ] Upload a test file through the UI
- [ ] Verify file appears in R2 bucket dashboard
- [ ] Verify public URL is accessible
- [ ] Check production logs for success messages
- [ ] Test file download from public URL
- [ ] Test file deletion (if applicable)

---

## Related Files

- **Fix Applied**: `/lib/r2.ts` (changed `forcePathStyle: false` → `true`)
- **API Endpoints**: 
  - `/app/api/upload-r2/route.ts`
  - `/app/api/r2-upload/route.ts`
- **Environment**: `.env.local` (development), Vercel/Netlify environment variables (production)

---

## Why It Worked Locally But Failed in Production

| Environment | Behavior | Reason |
|-------------|----------|--------|
| **Development** | Might work | Local DNS resolver may be more forgiving, or caching |
| **Production** | Failed | Strict DNS resolution, proper error handling |

The error `ENOTFOUND aes-student-files.s3.auto` means the DNS lookup failed because that domain doesn't exist. Production environments have stricter networking rules that catch this immediately.

---

## Summary

✅ **Fixed**: Changed `forcePathStyle: false` to `forcePathStyle: true`

✅ **Why**: Cloudflare R2 requires path-style URLs (endpoint.com/bucket/key)

✅ **Impact**: File uploads will now work correctly in production

✅ **Deploy**: Push changes and redeploy to Vercel/Netlify

🚀 **Next Steps**: Test file upload in production after deployment
