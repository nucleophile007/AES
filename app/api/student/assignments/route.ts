import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasRole } from '../../../../lib/auth';

// GET: Get assignments available to a student
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    if (!hasRole(user, 'student')) {
      return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const studentEmail = searchParams.get('studentEmail');
    const status = searchParams.get('status'); // available, submitted, overdue
    const subject = searchParams.get('subject');

    if (studentEmail && studentEmail.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 403 });
    }

    // Find student
    const student = await prisma.student.findUnique({
      where: { email: user.email },
      include: {
        teacherLinks: {
          include: {
            teacher: true
          }
        }
      }
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }

    // Get teacher IDs for this student
    const teacherIds = student.teacherLinks.map(link => link.teacherId);

    if (teacherIds.length === 0) {
      return NextResponse.json({
        success: true,
        assignments: []
      });
    }

    // Build assignment filters
    const assignmentFilters: any = {
      teacherId: { in: teacherIds },
      isActive: true,
      OR: [
        {
          assignmentTargets: {
            some: { studentId: student.id }
          }
        },
        { targetStudentId: student.id }
      ]
    };

    if (subject) {
      assignmentFilters.subject = subject;
    }

    // Get assignments with submissions and resources
    const assignments = await prisma.assignment.findMany({
      where: assignmentFilters,
      include: {
        teacher: {
          select: { id: true, name: true, email: true }
        },
        submissions: {
          where: { studentId: student.id },
          select: {
            id: true,
            content: true,
            fileUrl: true,
            fileName: true,
            submittedAt: true,
            grade: true,
            feedback: true,
            status: true,
            submissionNumber: true
          }
        },
        resources: {
          include: {
            resource: true
          }
        },
        _count: {
          select: {
            submissions: true
          }
        }
      },
      orderBy: {
        dueDate: 'asc'
      }
    });

    // Process assignments with submission status
    const now = new Date();
    const processedAssignments = assignments.map(assignment => {
      const submission = assignment.submissions[0] || null;
      const isOverdue = now > new Date(assignment.dueDate);
      const canSubmit = !submission || (submission && !submission.grade && (assignment.allowLateSubmission || !isOverdue));
      
      let assignmentStatus = 'available';
      if (submission) {
        if (submission.grade !== null) {
          assignmentStatus = 'graded';
        } else {
          assignmentStatus = 'submitted';
        }
      } else if (isOverdue && !assignment.allowLateSubmission) {
        assignmentStatus = 'overdue';
      }

      return {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        instructions: assignment.instructions,
        subject: assignment.subject,
        dueDate: assignment.dueDate,
        totalPoints: assignment.totalPoints,
        allowLateSubmission: assignment.allowLateSubmission,
        teacher: assignment.teacher,
        submission,
        resources: assignment.resources.map(ar => ar.resource),
        status: assignmentStatus,
        isOverdue,
        canSubmit,
        canResubmit: submission && !submission.grade && canSubmit,
        totalSubmissions: assignment._count.submissions
      };
    });

    // Filter by status if requested
    let filteredAssignments = processedAssignments;
    if (status) {
      filteredAssignments = processedAssignments.filter(a => {
        switch (status) {
          case 'available':
            return a.status === 'available';
          case 'submitted':
            return a.status === 'submitted' || a.status === 'graded';
          case 'overdue':
            return a.status === 'overdue';
          case 'pending':
            return a.status === 'submitted';
          case 'graded':
            return a.status === 'graded';
          default:
            return true;
        }
      });
    }

    return NextResponse.json({
      success: true,
      assignments: filteredAssignments,
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        program: student.program,
        grade: student.grade
      }
    });

  } catch (error) {
    console.error('Error fetching student assignments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
}