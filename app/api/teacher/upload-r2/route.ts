import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, R2_CONFIG, generateResourceKey, validateFile, getR2PublicUrl } from '../../../../lib/r2';
import { getUserFromRequest, hasRole } from '../../../../lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    if (!hasRole(user, 'teacher')) {
      return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'document';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Missing file' },
        { status: 400 }
      );
    }

    // Validate file
    try {
      validateFile(file);
    } catch (validationError) {
      return NextResponse.json(
        { 
          success: false, 
          error: validationError instanceof Error ? validationError.message : 'File validation failed'
        },
        { status: 400 }
      );
    }

    // Generate unique file key for teacher resource
    const fileKey = generateResourceKey(
      user.id,
      type,
      file.name
    );

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload directly to R2 from server
    const putObjectCommand = new PutObjectCommand({
      Bucket: R2_CONFIG.bucket,
      Key: fileKey,
      Body: buffer,
      ContentType: file.type,
      ContentLength: file.size,
      Metadata: {
        teacherId: user.id.toString(),
        originalFileName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    });

    await r2Client.send(putObjectCommand);

    // Generate the public URL
    const publicUrl = getR2PublicUrl(fileKey);

    return NextResponse.json({
      success: true,
      fileUrl: publicUrl,
      fileName: file.name,
      fileSize: file.size,
      message: 'File uploaded successfully to R2',
    });

  } catch (error) {
    console.error('R2 teacher upload failed:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Upload failed'
      },
      { status: 500 }
    );
  }
}
