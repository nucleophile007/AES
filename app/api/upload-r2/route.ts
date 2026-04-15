import { NextRequest, NextResponse } from 'next/server';
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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const studentId = formData.get('studentId') as string;
    const assignmentId = formData.get('assignmentId') as string;

    const parsedStudentId = Number(studentId);
    const parsedAssignmentId = Number(assignmentId);

    if (!file || !studentId || !assignmentId) {
      return NextResponse.json(
        { success: false, error: 'Missing file, studentId, or assignmentId' },
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

    // Generate unique file key with submission number support
    const submissionNumber = formData.get('submissionNumber') as string || '1';
    const fileKey = generateFileKey(
      parsedStudentId,
      parsedAssignmentId,
      file.name, 
      parseInt(submissionNumber)
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
        studentId: studentId,
        assignmentId: assignmentId,
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
    console.error('R2 upload failed:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Upload failed'
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