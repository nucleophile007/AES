import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getChecklistProgress, isTaskOverdue } from '@/lib/tasks';

/**
 * Read-only view of the parent's children's tasks. Comments and submission
 * contents stay between student and mentor; parents see progress only.
 */
export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  if (!hasRole(user, 'parent')) return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 403 });

  const normalizedEmail = user.email.trim().toLowerCase();
  const rows = await prisma.studentTask.findMany({
    where: {
      task: { isCancelled: false },
      student: {
        OR: [{ parentAccountId: user.id }, { parentEmail: { equals: normalizedEmail, mode: 'insensitive' } }],
      },
    },
    select: {
      id: true,
      status: true,
      startedAt: true,
      submittedAt: true,
      completedAt: true,
      mentorFeedback: true,
      checklistDone: true,
      student: { select: { id: true, name: true } },
      task: {
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          priority: true,
          deadline: true,
          checklist: true,
          creator: { select: { name: true } },
        },
      },
    },
    orderBy: [{ task: { deadline: { sort: 'asc', nulls: 'last' } } }],
    take: 500,
  });

  const tasks = rows.map((r) => ({
    id: r.id,
    taskId: r.task.id,
    studentId: r.student.id,
    studentName: r.student.name,
    title: r.task.title,
    description: r.task.description,
    category: r.task.category,
    priority: r.task.priority,
    deadline: r.task.deadline,
    mentorName: r.task.creator.name,
    status: r.status,
    isOverdue: isTaskOverdue(r.task.deadline, r.status),
    startedAt: r.startedAt,
    submittedAt: r.submittedAt,
    completedAt: r.completedAt,
    // Only approval feedback is shared; change requests stay between mentor and student.
    mentorFeedback: r.status === 'COMPLETED' ? r.mentorFeedback : null,
    checklist: getChecklistProgress(r.task.checklist, r.checklistDone),
  }));

  return NextResponse.json({ success: true, tasks });
}
