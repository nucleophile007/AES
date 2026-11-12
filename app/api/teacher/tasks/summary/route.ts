import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import { computeStudentInsights, isTaskOverdue } from '@/lib/tasks';

/**
 * Task summary for one of the mentor's students, used to pre-fill progress
 * reports. ?studentId=<id>&days=<period, default 30>
 */
export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user || !hasRole(user, 'teacher')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const teacher = await prisma.teacher.findUnique({ where: { email: user.email }, select: { id: true } });
  if (!teacher) return NextResponse.json({ success: false, error: 'Teacher not found' }, { status: 404 });

  const params = new URL(request.url).searchParams;
  const studentId = Number(params.get('studentId'));
  const daysParam = Number(params.get('days') ?? 30);
  const days = Number.isInteger(daysParam) && daysParam > 0 && daysParam <= 365 ? daysParam : 30;
  if (!Number.isInteger(studentId)) {
    return NextResponse.json({ success: false, error: 'studentId is required' }, { status: 400 });
  }
  const linked = await prisma.teacherStudent.findFirst({ where: { teacherId: teacher.id, studentId }, select: { id: true } });
  if (!linked) return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });

  const since = new Date(Date.now() - days * 864e5);
  const rows = await prisma.studentTask.findMany({
    where: {
      studentId,
      task: { creatorId: teacher.id, isCancelled: false },
      OR: [{ completedAt: { gte: since } }, { status: { not: 'COMPLETED' } }, { createdAt: { gte: since } }],
    },
    select: {
      status: true,
      startedAt: true,
      submittedAt: true,
      completedAt: true,
      reviewedAt: true,
      updatedAt: true,
      student: { select: { name: true } },
      task: { select: { title: true, deadline: true } },
    },
    orderBy: { task: { deadline: { sort: 'asc', nulls: 'last' } } },
  });

  const completed = rows.filter((r) => r.status === 'COMPLETED' && r.completedAt && r.completedAt >= since);
  const open = rows.filter((r) => r.status !== 'COMPLETED');
  const [insight] = computeStudentInsights(
    rows.map((r) => ({
      studentId,
      studentName: r.student.name,
      status: r.status,
      deadline: r.task.deadline,
      submittedAt: r.submittedAt,
      completedAt: r.completedAt,
      reviewedAt: r.reviewedAt,
      startedAt: r.startedAt,
      updatedAt: r.updatedAt,
    }))
  );

  const fmt = (d: Date | null) => (d ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'no deadline');
  return NextResponse.json({
    success: true,
    days,
    completionRate: insight ? insight.completionRate : null,
    onTimeRate: insight ? insight.onTimeRate : null,
    milestonesText: completed.map((r) => `• ${r.task.title} (completed ${fmt(r.completedAt)})`).join('\n'),
    nextStepsText: open
      .map((r) => `• ${r.task.title} — due ${fmt(r.task.deadline)}${isTaskOverdue(r.task.deadline, r.status) ? ' (overdue)' : ''}`)
      .join('\n'),
    counts: { completed: completed.length, open: open.length },
  });
}
