import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2Client, R2_CONFIG, generateResourceKey, ALLOWED_FILE_TYPES } from '../../../lib/r2';
import { getUserFromRequest, hasRole } from '../../../lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });

    if (!hasRole(user, 'teacher')) {
      return NextResponse.json({ success: false, error: 'Only teachers may request upload URLs' }, { status: 403 });
    }

    const body = await request.json();
    const { fileName, contentType, fileSize, resourceType } = body as { fileName?: string; contentType?: string; fileSize?: number; resourceType?: string };

    if (!fileName || !contentType || typeof fileSize !== 'number') {
      return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
    }

    // Basic server-side validation: content type and size
    if (!ALLOWED_FILE_TYPES.includes(contentType as any)) {
      return NextResponse.json({ success: false, error: 'Disallowed content type' }, { status: 400 });
    }

    const MAX_TOTAL_SINGLE_FILE = 50 * 1024 * 1024; // 50MB per file
    if (fileSize > MAX_TOTAL_SINGLE_FILE) {
      return NextResponse.json({ success: false, error: 'File too large (max 50MB)' }, { status: 400 });
    }

    // Generate deterministic key for resource
    const key = generateResourceKey(user.id, resourceType || 'assignment', fileName);

    const command = new PutObjectCommand({
      Bucket: R2_CONFIG.bucket,
      Key: key,
      ContentType: contentType,
      Metadata: {
        uploadedBy: String(user.id),
        originalFileName: fileName,
        resourceType: resourceType || 'assignment',
      },
    });

    const presignedUrl = await getSignedUrl(r2Client, command, { expiresIn: 300 }); // 5 minutes

    const publicUrl = `${R2_CONFIG.publicUrl}/${key}`;

    return NextResponse.json({ success: true, url: presignedUrl, key, publicUrl });
  } catch (error) {
    console.error('Presign failed:', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Presign failed' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ success: true, message: 'R2 presign available' });
}
