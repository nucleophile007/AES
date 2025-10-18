import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'student') {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    
    // Get student email from query parameter
    const url = new URL(request.url);
    const studentEmail = url.searchParams.get('studentEmail');
    
    if (!studentEmail) {
      return NextResponse.json({ success: false, error: "Student email is required" }, { status: 400 });
    }
    
    // Ensure user can only access their own data
    if (user.email !== studentEmail) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }
    
    // Find student in database
    const student = await prisma.student.findUnique({
      where: { email: studentEmail },
      include: {
        teacherLinks: {
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
                email: true,
                programs: true,
              }
            }
          }
        }
      }
    });
    
    if (!student) {
      return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
    }
    
    // Format mentors data
    const mentors = student.teacherLinks.map(link => ({
      id: link.teacher.id,
      name: link.teacher.name,
      email: link.teacher.email,
      program: link.program,
    }));
    
    return NextResponse.json({
      success: true,
      mentors
    });
    
  } catch (error) {
    console.error('Error fetching student mentors:', error);
    
    // Import the error handler dynamically to avoid circular dependencies
    const { handlePrismaError } = await import('../../../../lib/error-handlers');
    
    // Check if it's a Prisma error
    if (error instanceof Error && 
        (error.message.includes('prisma') || error.message.includes('PrismaClient'))) {
      return handlePrismaError(error);
    }
    
    return NextResponse.json(
      { success: false, error: "Failed to fetch mentors" },
      { status: 500 }
    );
  }
}