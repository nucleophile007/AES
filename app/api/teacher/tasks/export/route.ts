import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import { formatTaskKey, getChecklistProgress, isTaskOverdue, toCsv } from '@/lib/tasks';
import { buildStudentTaskWhere, readTaskListQuery } from '@/lib/task-server';

/** CSV of the mentor's task items, honouring the same filters as the board. */
export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user || !hasRole(user, 'teacher')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const teacher = await prisma.teacher.findUnique({ where: { email: user.email }, select: { id: true } });
  if (!teacher) return NextResponse.json({ success: false, error: 'Teacher not found' }, { status: 404 });

  const query = readTaskListQuery(new URL(request.url).searchParams);
  const rows = await prisma.studentTask.findMany({
    where: buildStudentTaskWhere({ task: { creatorId: teacher.id } }, query, { searchStudents: true }),
    include: { student: { select: { name: true, email: true } }, task: true },
    orderBy: [{ task: { createdAt: 'desc' } }, { student: { name: 'asc' } }],
    take: 5000,
  });

  const csv = toCsv(
    ['Key', 'Title', 'Category', 'Priority', 'Student', 'Student email', 'Status', 'Overdue', 'Deadline',
     'Checklist', 'Started', 'Submitted', 'Completed', 'Reviewed', 'Submission URL', 'Mentor feedback', 'Cancelled'],
    rows.map((r) => {
      const progress = getChecklistProgress(r.task.checklist, r.checklistDone);
      return [
        formatTaskKey(r.taskId),
        r.task.title,
        r.task.category,
        r.task.priority,
        r.student.name,
        r.student.email,
        r.status,
        isTaskOverdue(r.task.deadline, r.status) ? 'yes' : 'no',
        r.task.deadline,
        progress.total ? `${progress.done}/${progress.total}` : '',
        r.startedAt,
        r.submittedAt,
        r.completedAt,
        r.reviewedAt,
        r.submissionUrl,
        r.mentorFeedback,
        r.task.isCancelled ? 'yes' : 'no',
      ];
    })
  );

  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(`﻿${csv}`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="tasks-${date}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
