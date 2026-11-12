import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import { sendAcademicNotification } from '@/lib/academic-notifications';
import { canMentorPerform, type MentorReviewAction } from '@/lib/tasks';
import { publishTaskEvent } from '@/lib/task-server';

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    if (!hasRole(user, 'teacher')) {
      return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 403 });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { email: user.email },
      select: { id: true, name: true, email: true },
    });

    if (!teacher) {
      return NextResponse.json({ success: false, error: 'Teacher not found' }, { status: 404 });
    }

    const body = await request.json();
    const { studentTaskId, action, feedback } = body;

    const parsedStudentTaskId = Number(studentTaskId);
    if (!Number.isFinite(parsedStudentTaskId)) {
      return NextResponse.json({ success: false, error: 'Invalid studentTaskId' }, { status: 400 });
    }

    if (!['APPROVE', 'REQUEST_CHANGES', 'REOPEN'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be APPROVE, REQUEST_CHANGES, or REOPEN.' },
        { status: 400 }
      );
    }

    const studentTask = await prisma.studentTask.findUnique({
      where: { id: parsedStudentTaskId },
      include: {
        task: true,
        student: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!studentTask) {
      return NextResponse.json({ success: false, error: 'Student task not found' }, { status: 404 });
    }

    if (studentTask.task.creatorId !== teacher.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized: not your task' }, { status: 403 });
    }

    if (studentTask.task.isCancelled) {
      return NextResponse.json(
        { success: false, error: 'This task is cancelled. Reactivate it before reviewing.' },
        { status: 409 }
      );
    }

    if (!canMentorPerform(action as MentorReviewAction, studentTask.status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot ${String(action).toLowerCase().replace('_', ' ')} a task that is ${studentTask.status.toLowerCase().replace(/_/g, ' ')}.`,
        },
        { status: 409 }
      );
    }

    if (action === 'REQUEST_CHANGES' && (typeof feedback !== 'string' || !feedback.trim())) {
      return NextResponse.json(
        { success: false, error: 'Please explain what needs to change.' },
        { status: 400 }
      );
    }

    const now = new Date();
    let newStatus: string;
    let activityAction: string;
    let activityDetails: string;

    if (action === 'APPROVE') {
      newStatus = 'COMPLETED';
      activityAction = 'APPROVED';
      activityDetails = feedback
        ? `Task approved by mentor ${teacher.name}. Feedback: ${feedback}`
        : `Task approved by mentor ${teacher.name}`;
    } else if (action === 'REQUEST_CHANGES') {
      newStatus = 'CHANGES_REQUESTED';
      activityAction = 'CHANGES_REQUESTED';
      activityDetails = feedback
        ? `Changes requested by mentor ${teacher.name}: ${feedback}`
        : `Changes requested by mentor ${teacher.name}`;
    } else {
      // REOPEN
      newStatus = 'IN_PROGRESS';
      activityAction = 'REOPENED';
      activityDetails = feedback
        ? `Task reopened by mentor ${teacher.name}: ${feedback}`
        : `Task reopened by mentor ${teacher.name}`;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const res = await tx.studentTask.update({
        where: { id: parsedStudentTaskId },
        data: {
          status: newStatus,
          mentorFeedback: feedback ? feedback.trim() : studentTask.mentorFeedback,
          reviewedAt: now,
          reviewedById: teacher.id,
          completedAt: action === 'APPROVE' ? (studentTask.completedAt || now) : null,
        },
      });

      await tx.taskActivity.create({
        data: {
          studentTaskId: parsedStudentTaskId,
          action: activityAction,
          details: activityDetails,
          performedById: teacher.id,
          performedByRole: 'teacher',
          performedByName: teacher.name,
        },
      });

      return res;
    });

    publishTaskEvent(
      { teacherIds: [teacher.id], studentIds: [studentTask.studentId] },
      { type: 'task.changed', taskId: studentTask.taskId, studentTaskId: parsedStudentTaskId, actorRole: 'teacher' }
    );

    // Notify student asynchronously
    try {
      void sendAcademicNotification({
        recipients: [{ email: studentTask.student.email, name: studentTask.student.name }],
        subject: `Task Update: ${studentTask.task.title}`,
        heading: action === 'APPROVE' ? 'Task Approved!' : action === 'REQUEST_CHANGES' ? 'Changes Requested on Task' : 'Task Reopened',
        message: `Your mentor ${teacher.name} has reviewed your task "${studentTask.task.title}". Status: ${newStatus.replace('_', ' ')}.`,
        details: [
          ...(feedback ? [{ label: 'Mentor Feedback', value: feedback }] : []),
          { label: 'Status', value: newStatus.replace('_', ' ') },
        ],
        actionLabel: 'View Task in Dashboard',
        actionUrl: `${process.env.NEXT_PUBLIC_APP_URL || ''}/student-dashboard?tab=tasks`,
      }).catch((err) => console.error('Email notify error:', err));
    } catch (e) {
      console.warn('Could not trigger review email:', e);
    }

    return NextResponse.json({
      success: true,
      studentTask: updated,
    });
  } catch (error) {
    console.error('Error reviewing student task:', error);
    return NextResponse.json({ success: false, error: 'Internal server error reviewing task' }, { status: 500 });
  }
}

