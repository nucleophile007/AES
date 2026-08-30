import { NextResponse } from 'next/server';
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';
import { prisma } from '@/lib/prisma';
import { getApplicationUrl, parentAssignmentEmailsEnabled, sendAcademicNotification } from '@/lib/academic-notifications';

export const runtime = 'nodejs';

type ReminderKind = 'due-24h' | 'due-1h' | 'overdue';

async function handler(request: Request) {
  try {
    const payload = await request.json() as {
      assignmentId?: number;
      studentId?: number;
      expectedDueDate?: string;
      kind?: ReminderKind;
    };
    const assignmentId = Number(payload.assignmentId);
    const studentId = Number(payload.studentId);
    const expectedDueDate = payload.expectedDueDate ? new Date(payload.expectedDueDate) : null;
    const kind = payload.kind;

    if (!Number.isInteger(assignmentId) || !Number.isInteger(studentId) || !expectedDueDate || Number.isNaN(expectedDueDate.getTime()) || !kind || !['due-24h', 'due-1h', 'overdue'].includes(kind)) {
      return NextResponse.json({ success: false, error: 'Invalid reminder payload' }, { status: 400 });
    }

    const assignment = await prisma.assignment.findFirst({
      where: {
        id: assignmentId,
        isActive: true,
        OR: [
          { targetStudentId: studentId },
          { assignmentTargets: { some: { studentId } } },
        ],
      },
      include: {
        teacher: { select: { name: true, email: true } },
      },
    });
    if (!assignment) return NextResponse.json({ success: true, skipped: 'assignment-unavailable' });
    if (assignment.dueDate.getTime() !== expectedDueDate.getTime()) {
      return NextResponse.json({ success: true, skipped: 'due-date-changed' });
    }

    const submission = await prisma.submission.findUnique({
      where: { studentId_assignmentId: { studentId, assignmentId } },
      select: { id: true },
    });
    if (submission) return NextResponse.json({ success: true, skipped: 'already-submitted' });

    const now = Date.now();
    if (kind !== 'overdue' && assignment.dueDate.getTime() <= now) {
      return NextResponse.json({ success: true, skipped: 'deadline-passed' });
    }
    if (kind === 'overdue' && assignment.dueDate.getTime() > now) {
      return NextResponse.json({ success: true, skipped: 'not-overdue' });
    }

    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) return NextResponse.json({ success: true, skipped: 'student-unavailable' });

    const isOverdue = kind === 'overdue';
    const timingLabel = kind === 'due-24h' ? 'approximately 24 hours' : 'approximately 1 hour';
    const recipients = [
      { email: student.email, name: student.name },
      ...(isOverdue && parentAssignmentEmailsEnabled() ? [{ email: student.parentEmail, name: student.parentName }] : []),
    ];
    const notification = await sendAcademicNotification({
      recipients,
      subject: isOverdue ? `Assignment overdue: ${assignment.title}` : `Assignment due soon: ${assignment.title}`,
      heading: isOverdue ? 'Assignment deadline has passed' : 'Assignment deadline reminder',
      message: isOverdue
        ? `${assignment.title} has not been submitted. Please review it in the AES dashboard and contact ${assignment.teacher.name || 'your teacher'} if you need help.`
        : `${assignment.title} is due in ${timingLabel}. Please submit it before the deadline.`,
      details: [
        { label: 'Assignment', value: assignment.title },
        { label: 'Subject', value: assignment.subject },
        { label: 'Due', value: assignment.dueDate.toLocaleString('en-US', { timeZone: assignment.dueDateTimezone || 'America/Los_Angeles' }) },
      ],
      actionLabel: 'Open assignments',
      actionUrl: getApplicationUrl('/student-dashboard?tab=assignments'),
      replyTo: assignment.teacher.email,
    });

    if (notification.failed > 0) {
      throw new Error(`Failed to deliver ${notification.failed} assignment reminder email(s)`);
    }
    return NextResponse.json({ success: true, notification });
  } catch (error) {
    console.error('Assignment reminder job failed:', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Assignment reminder failed' }, { status: 500 });
  }
}

export const POST = verifySignatureAppRouter(handler);
