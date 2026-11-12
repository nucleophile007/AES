import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, R2_CONFIG, getR2PublicUrl } from '@/lib/r2';
import { getUserFromRequest } from '@/lib/auth';
import { isAllowedTaskUpload } from '@/lib/tasks';

const MAX_SIZE = 25 * 1024 * 1024; // 25MB
// Inline data URIs are stored in the database, so keep the dev fallback small.
const MAX_INLINE_DEV_SIZE = 2 * 1024 * 1024; // 2MB

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    if (user.role !== 'teacher' && user.role !== 'student') {
      return NextResponse.json({ success: false, error: 'Unauthorized role' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ success: false, error: 'The selected file is empty' }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, error: 'File size exceeds 25MB limit' }, { status: 400 });
    }

    if (!isAllowedTaskUpload(file.name, file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unsupported file type. Upload a PDF, image (PNG/JPG/WebP/GIF/HEIC), or Office/text document.',
        },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileKey = `tasks/${user.role}/${user.id}/${timestamp}_${sanitizedName}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const r2Configured = Boolean(R2_CONFIG.bucket && R2_CONFIG.publicUrl && process.env.R2_ACCESS_KEY_ID);

    let publicUrl: string;

    if (r2Configured) {
      try {
        await r2Client.send(
          new PutObjectCommand({
            Bucket: R2_CONFIG.bucket,
            Key: fileKey,
            Body: buffer,
            ContentType: file.type,
            ContentLength: file.size,
            Metadata: {
              userId: String(user.id),
              userRole: user.role,
              originalFileName: sanitizedName,
              uploadedAt: new Date().toISOString(),
            },
          })
        );
      } catch (uploadError) {
        console.error('Task file upload to R2 failed:', uploadError);
        return NextResponse.json(
          { success: false, error: 'File storage is temporarily unavailable. Please try again.' },
          { status: 502 }
        );
      }
      publicUrl = getR2PublicUrl(fileKey);
    } else if (process.env.NODE_ENV !== 'production') {
      // Local development without R2: inline small files only.
      if (file.size > MAX_INLINE_DEV_SIZE) {
        return NextResponse.json(
          { success: false, error: 'File storage is not configured; local uploads are limited to 2MB.' },
          { status: 400 }
        );
      }
      publicUrl = `data:${file.type};base64,${buffer.toString('base64')}`;
    } else {
      console.error('Task upload attempted but R2 storage is not configured');
      return NextResponse.json(
        { success: false, error: 'File uploads are not available right now.' },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      fileUrl: publicUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });
  } catch (error) {
    console.error('Task file upload error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error uploading file' }, { status: 500 });
  }
}
