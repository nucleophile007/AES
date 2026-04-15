import { NextRequest, NextResponse } from 'next/server';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, R2_CONFIG, generateFileKey, validateFile, getR2PublicUrl } from '../../../lib/r2';
import { getUserFromRequest, hasRole } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    if (!hasRole(user, 'student')) {
      return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 403 });
    }

    const body = await request.json();
    const { studentId, assignmentId, fileName, fileType, fileSize } = body;

    const parsedStudentId = Number(studentId);
    const parsedAssignmentId = Number(assignmentId);

    // Validate required fields
    if (!studentId || !assignmentId || !fileName || !fileType || !fileSize) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: studentId, assignmentId, fileName, fileType, fileSize' 
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(parsedStudentId) || parsedStudentId !== user.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 403 });
    }

    if (!Number.isFinite(parsedAssignmentId)) {
      return NextResponse.json({ success: false, error: 'Invalid assignmentId' }, { status: 400 });
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: parsedAssignmentId },
      select: { id: true, teacherId: true },
    });

    if (!assignment) {
      return NextResponse.json({ success: false, error: 'Assignment not found' }, { status: 404 });
    }

    const link = await prisma.teacherStudent.findFirst({
      where: {
        studentId: parsedStudentId,
        teacherId: assignment.teacherId,
      },
      select: { id: true },
    });

    if (!link) {
      return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 403 });
    }

    // Create a mock file object for validation
    const mockFile = {
      name: fileName,
      type: fileType,
      size: fileSize,
    } as File;

    // Validate file type and size
    try {
      validateFile(mockFile);
    } catch (validationError) {
      return NextResponse.json(
        { 
          success: false, 
          error: validationError instanceof Error ? validationError.message : 'File validation failed'
        },
        { status: 400 }
      );
    }

    // Generate unique file key for R2
    const fileKey = generateFileKey(parsedStudentId, parsedAssignmentId, fileName);

    // Create the PutObject command for R2
    const putObjectCommand = new PutObjectCommand({
      Bucket: R2_CONFIG.bucket,
      Key: fileKey,
      ContentType: fileType,
      ContentLength: fileSize,
      // Optional: Add metadata
      Metadata: {
        studentId: studentId.toString(),
        assignmentId: parsedAssignmentId.toString(),
        originalFileName: fileName,
        uploadedAt: new Date().toISOString(),
      },
    });

    // Generate presigned URL for upload (expires in 15 minutes)
    // IMPORTANT: Must specify region and endpoint for R2
    const presignedUrl = await getSignedUrl(r2Client, putObjectCommand, {
      expiresIn: 15 * 60, // 15 minutes
      // These are critical for R2 to work correctly
      unhoistableHeaders: new Set(['x-amz-content-sha256']),
    });

    console.log('Generated presigned URL:', presignedUrl);
    console.log('Expected endpoint:', process.env.R2_ENDPOINT);

    // Generate the public URL that will be accessible after upload
    const publicUrl = getR2PublicUrl(fileKey);

    return NextResponse.json({
      success: true,
      presignedUrl,
      publicUrl,
      fileKey,
      expiresIn: 15 * 60, // 15 minutes in seconds
      message: 'Presigned URL generated successfully',
    });

  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate presigned URL' 
      },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to check if a file exists in R2
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fileKey = searchParams.get('fileKey');

    if (!fileKey) {
      return NextResponse.json(
        { success: false, error: 'File key is required' },
        { status: 400 }
      );
    }

    // You could implement file existence check here if needed
    // For now, just return the public URL
    const publicUrl = getR2PublicUrl(fileKey);

    return NextResponse.json({
      success: true,
      publicUrl,
      exists: true, // You'd need to implement actual checking logic
    });

  } catch (error) {
    console.error('Error checking file:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check file' },
      { status: 500 }
    );
  }
}