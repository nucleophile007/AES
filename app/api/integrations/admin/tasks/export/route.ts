import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatTaskKey, getChecklistProgress, isTaskOverdue, taskCreatorName, toCsv } from '@/lib/tasks';
import { readTaskListQuery } from '@/lib/task-server';
import { creatorInclude, readAssignee } from '@/lib/task-actors';
import { authenticateAdminRequest, buildAdminTaskWhere, readAdminScope } from '@/lib/task-admin';

/** CSV of every row matching the admin board's current scope and filters. */
export async function GET(request: NextRequest) {
  const auth = authenticateAdminRequest(request);
  if (auth.error) return auth.error;
  try {
    const sp = request.nextUrl.searchParams;
    const rows = await prisma.studentTask.findMany({
      where: buildAdminTaskWhere(readAdminScope(sp), readTaskListQuery(sp)),
      include: {
        student: { select: { id: true, name: true, email: true } },
        assigneeTeacher: { select: { id: true, name: true, email: true } },
        assigneeParent: { select: { id: true, name: true, email: true } },
        task: { include: creatorInclude },
      },
      orderBy: [{ task: { createdAt: 'desc' } }, { id: 'asc' }],
      take: 10_000,
    });

    const roleLabel: Record<string, string> = { STUDENT: 'Student', TEACHER: 'Mentor', PARENT: 'Parent' };
    const csv = toCsv(
      ['Key', 'Title', 'Category', 'Priority', 'Created by', 'Creator type', 'Assignee', 'Assignee email', 'Assignee type',
       'Status', 'Overdue', 'Deadline', 'Checklist', 'Started', 'Submitted', 'Completed', 'Reviewed', 'Submission URL',
       'Feedback', 'Cancelled'],
      rows.map((r) => {
        const a = readAssignee(r);
        const progress = getChecklistProgress(r.task.checklist, r.checklistDone);
        return [
          formatTaskKey(r.taskId),
          r.task.title,
          r.task.category,
          r.task.priority,
          taskCreatorName(r.task),
          r.task.creatorRole === 'ADMIN' ? 'Admin' : 'Mentor',
          a?.name ?? '',
          a?.email ?? '',
          roleLabel[r.assigneeRole] ?? r.assigneeRole,
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
        'Content-Disposition': `attachment; filename="all-tasks-${date}.csv"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error) {
    console.error('Admin task export failed:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
