import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest, hasRole } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    
    // Check if user is authorized (must be a teacher)
    if (!hasRole(user, 'teacher')) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }
    
    // Get studentEmail from query params
    const studentEmail = request.nextUrl.searchParams.get("studentEmail");
    
    if (!studentEmail) {
      return NextResponse.json({ error: "Student email is required" }, { status: 400 });
    }
    
    // Find student by email
    const student = await prisma.student.findFirst({
      where: { email: studentEmail },
    });
    
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    
    // Check if teacher is assigned to this student
    const teacherEmail = user.email;
    const teacher = await prisma.teacher.findFirst({
      where: { email: teacherEmail },
    });
    
    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }
    
    // Check if this teacher is assigned to the student
    const isTeacherAssigned = await prisma.teacherStudent.findFirst({
      where: {
        studentId: student.id,
        teacherId: teacher.id,
      },
    });
    
    if (!isTeacherAssigned) {
      return NextResponse.json({ error: "You are not assigned to this student" }, { status: 403 });
    }
    
    // Fetch student's assignments
    const assignments = await prisma.assignment.findMany({
      where: {
        OR: [
          // Assignment for student's program
          {
            program: student.program,
          },
          // Assignment explicitly assigned to this student
          {
            targetStudentId: student.id,
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    
    // Fetch student's submissions
    const submissions = await prisma.submission.findMany({
      where: {
        studentId: student.id,
      },
      orderBy: {
        submittedAt: "desc",
      },
    });
    
    return NextResponse.json({
      success: true,
      assignments,
      submissions,
    });
    
  } catch (error) {
    console.error("Error fetching student progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch student progress" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}