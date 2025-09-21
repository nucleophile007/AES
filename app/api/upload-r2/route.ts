import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, R2_CONFIG, generateFileKey, validateFile, getR2PublicUrl } from '../../../lib/r2';

export async function POST(request: NextRequest) {
  console.log('=== R2 Upload Endpoint Hit ===');
  
  try {
    console.log('=== R2 Upload Debug ===');
    
    // Check environment variables
    console.log('R2_ENDPOINT:', process.env.R2_ENDPOINT);
    console.log('R2_BUCKET_NAME:', process.env.R2_BUCKET_NAME);
    console.log('R2_ACCESS_KEY_ID exists:', !!process.env.R2_ACCESS_KEY_ID);
    console.log('R2_SECRET_ACCESS_KEY exists:', !!process.env.R2_SECRET_ACCESS_KEY);
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const studentId = formData.get('studentId') as string;
    const assignmentId = formData.get('assignmentId') as string;

    console.log('File:', file?.name, 'Size:', file?.size);
    console.log('Student ID:', studentId, 'Assignment ID:', assignmentId);

    if (!file || !studentId || !assignmentId) {
      const error = 'Missing file, studentId, or assignmentId';
      console.error('Validation error:', error);
      return NextResponse.json(
        { success: false, error },
        { status: 400 }
      );
    }

    // Validate file
    try {
      validateFile(file);
      console.log('File validation passed');
    } catch (validationError) {
      console.error('File validation failed:', validationError);
      return NextResponse.json(
        { 
          success: false, 
          error: validationError instanceof Error ? validationError.message : 'File validation failed'
        },
        { status: 400 }
      );
    }

    // Generate unique file key with submission number support
    const submissionNumber = formData.get('submissionNumber') as string || '1';
    const fileKey = generateFileKey(
      parseInt(studentId), 
      parseInt(assignmentId), 
      file.name, 
      parseInt(submissionNumber)
    );
    console.log('Generated file key:', fileKey);

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log('File converted to buffer, size:', buffer.length);

    // Upload directly to R2 from server
    const putObjectCommand = new PutObjectCommand({
      Bucket: R2_CONFIG.bucket,
      Key: fileKey,
      Body: buffer,
      ContentType: file.type,
      ContentLength: file.size,
      Metadata: {
        studentId: studentId,
        assignmentId: assignmentId,
        originalFileName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    });

    console.log('Uploading to R2 bucket:', R2_CONFIG.bucket);
    await r2Client.send(putObjectCommand);
    console.log('R2 upload successful');

    // Generate the public URL
    const publicUrl = getR2PublicUrl(fileKey);
    console.log('Generated public URL:', publicUrl);

    return NextResponse.json({
      success: true,
      fileUrl: publicUrl,
      fileName: file.name,
      fileSize: file.size,
      message: 'File uploaded successfully to R2',
    });

  } catch (error) {
    console.error('=== R2 Upload Error ===');
    console.error('Error type:', typeof error);
    console.error('Error details:', error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Ensure we always return a valid error response
    const errorMessage = error instanceof Error ? error.message : 'Unknown upload error';
    
    return NextResponse.json(
      { 
        success: false, 
        error: `Upload failed: ${errorMessage}`,
        details: error instanceof Error ? error.stack : String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  // TODO: Implement file deletion from R2 if needed
  return NextResponse.json(
    { success: false, error: 'Delete operation not implemented yet' },
    { status: 501 }
  );
}