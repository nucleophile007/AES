import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'parent') {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const parentEmail = user.email;

    // Find all students for this parent
    const students = await prisma.student.findMany({
      where: { 
        parentEmail: parentEmail,
        isActivated: true 
      },
      include: {
        submissions: {
          where: { grade: { not: null } },
          orderBy: { submittedAt: 'desc' },
          take: 5,
          include: {
            assignment: {
              select: {
                title: true,
                subject: true,
                program: true,
                totalPoints: true
              }
            }
          }
        },
        enrollments: {
          where: { isActive: true },
          select: {
            program: true,
            subject: true
          }
        }
      }
    });

    // Calculate progress for each student
    const progressData = await Promise.all(
      students.map(async (student) => {
        // Get all assignments for this student's program
        const assignments = await prisma.assignment.findMany({
          where: {
            OR: [
              { program: student.program },
              { targetStudentId: student.id }
            ],
            isActive: true
          }
        });

        // Get submissions with grades
        const gradedSubmissions = await prisma.submission.findMany({
          where: {
            studentId: student.id,
            grade: { not: null }
          },
          include: {
            assignment: {
              select: { totalPoints: true }
            }
          }
        });

        // Calculate completion percentage
        const totalAssignments = assignments.length;
        const completedAssignments = gradedSubmissions.length;
        const completionPercent = totalAssignments > 0 
          ? Math.round((completedAssignments / totalAssignments) * 100)
          : 0;

        // Calculate average grade
        const averageGrade = gradedSubmissions.length > 0
          ? Math.round(
              gradedSubmissions.reduce((sum, sub) => {
                const percentage = (sub.grade! / sub.assignment.totalPoints) * 100;
                return sum + percentage;
              }, 0) / gradedSubmissions.length
            )
          : 0;

        // Recent milestones (recent submissions with grades)
        const recentMilestones = student.submissions.slice(0, 5).map(sub => ({
          title: `Completed: ${sub.assignment.title}`,
          date: sub.submittedAt.toISOString()
        }));

        return {
          studentId: student.id,
          studentName: student.name,
          program: student.program,
          completionPercent,
          averageGrade,
          totalAssignments,
          completedAssignments,
          recentMilestones
        };
      })
    );

    return NextResponse.json({
      success: true,
      progress: progressData
    });
  } catch (error) {
    console.error('Error fetching parent student progress:', error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch student progress" },
      { status: 500 }
    );
  }
}