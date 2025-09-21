# Cloudflare R2 Setup Guide for AES

## 🎯 Overview
Your AES application now supports Cloudflare R2 for file storage, which is extremely cost-effective for small SaaS applications. R2 offers S3-compatible API with zero egress fees.

## 📁 Files Created/Modified

### New Files:
- `lib/r2.ts` - R2 client configuration and utilities
- `app/api/r2-upload/route.ts` - Presigned URL generation endpoint
- `.env.r2.example` - Environment variables template

### Modified Files:
- `app/student-dashboard/page.tsx` - Updated to use R2 uploads
- `app/api/upload/route.ts` - Deprecated in favor of R2 uploads

## 🚀 Setup Instructions

### 1. Create Cloudflare R2 Bucket
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) > R2 Object Storage
2. Create a new bucket (e.g., `aes-student-files`)
3. Note your bucket name and Account ID

### 2. Generate R2 API Token
1. Go to "Manage R2 API tokens"
2. Create a new token with:
   - **Permissions**: Object Read and Write
   - **Specify bucket**: Your bucket name
   - **Token name**: `aes-r2-token`
3. Copy the Access Key ID and Secret Access Key

### 3. Configure Public Access (Optional)
1. Go to your bucket settings
2. Enable "Public access" if you want direct file access
3. Note the public URL format: `https://pub-{bucket-id}.r2.dev`

### 4. Set Environment Variables
Create or update your `.env.local` file with:

```env
# Cloudflare R2 Configuration
R2_ACCESS_KEY_ID=your_access_key_here
R2_SECRET_ACCESS_KEY=your_secret_key_here
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_BUCKET_NAME=aes-student-files
R2_PUBLIC_URL=https://pub-your-bucket-id.r2.dev
```

**Replace:**
- `your_access_key_here` - Your R2 Access Key ID
- `your_secret_key_here` - Your R2 Secret Access Key  
- `your-account-id` - Your Cloudflare Account ID
- `aes-student-files` - Your bucket name
- `your-bucket-id` - Your bucket's public ID

## 🔧 How It Works

### Upload Flow:
1. Student selects a file in the dashboard
2. Frontend requests a presigned URL from `/api/r2-upload`
3. Backend validates file and generates secure presigned URL
4. Frontend uploads file directly to R2 using presigned URL
5. File URL is stored in the database submission record

### Benefits:
- **Secure**: Files upload directly to R2, not through your server
- **Fast**: No server bottleneck for file uploads
- **Cheap**: R2 is 66% cheaper than S3 with zero egress fees
- **Scalable**: Direct browser-to-R2 uploads

## 💰 Pricing (As of 2024)

### Free Tier:
- 10 GB storage/month
- 1 million Class A operations/month  
- 10 million Class B operations/month

### Paid Pricing:
- **Storage**: $0.015/GB/month (vs S3's $0.023/GB)
- **Class A ops** (uploads): $4.50/million
- **Class B ops** (downloads): $0.36/million
- **Data transfer**: **FREE** (vs S3's $0.09/GB egress)

### Example Monthly Cost for Small SaaS:
- 5GB storage: $0.075
- 1,000 uploads: $0.0045
- 10,000 downloads: $0.0036
- **Total: ~$0.08/month** 🎉

## 🔒 Security Features

- **Presigned URLs**: Time-limited (15 minutes) upload URLs
- **File validation**: Type and size checking before upload
- **Unique naming**: Prevents file conflicts and overwrites
- **Metadata**: Tracks student/assignment info with each file

## 📊 File Organization

Files are stored with this structure:
```
submissions/
├── {studentId}/
│   ├── {assignmentId}/
│   │   ├── {timestamp}_{filename}
│   │   └── {timestamp}_{filename}
│   └── {assignmentId}/
└── {studentId}/
```

## 🛠 Troubleshooting

### Common Issues:

1. **Environment variables not loaded**
   - Restart your dev server after adding `.env.local`
   - Check variable names match exactly

2. **CORS errors**
   - R2 handles CORS automatically for presigned URLs
   - Ensure you're using PUT method for uploads

3. **File not accessible**
   - Check if bucket has public access enabled
   - Verify the public URL format in `R2_PUBLIC_URL`

4. **Upload fails**
   - Check file size (max 10MB)
   - Verify file type is allowed (PDF, DOC, DOCX, TXT, JPG, PNG)
   - Ensure presigned URL hasn't expired (15 minutes)

## 🔄 Migration from Local Storage

The old `/api/upload` endpoint is now deprecated. The new flow:

### Old Flow:
```
File → /api/upload → Server filesystem → Database
```

### New Flow:
```
File → /api/r2-upload (get URL) → Direct to R2 → Database
```

All existing functionality remains the same from the user perspective!

## 🎯 Next Steps

1. Set up your R2 bucket and get credentials
2. Add environment variables to `.env.local`
3. Test file uploads in the student dashboard
4. Monitor usage in Cloudflare dashboard
5. Consider setting up custom domain for cleaner URLs

Your file upload system is now production-ready and extremely cost-effective! 🚀