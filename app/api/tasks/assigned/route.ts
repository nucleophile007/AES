import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { assigneeRoleForUser, assigneeWhere } from '@/lib/task-actors';
import {
  buildStudentTaskWhere,
  countByStatus,
  getAssigneeTaskLookups,
  getAssigneeTaskMetrics,
  readTaskListQuery,
  studentTaskListInclude,
} from '@/lib/task-server';

const MAX_ROWS = 500;

/**
 * Board data for tasks assigned TO the signed-in user (a mentor or parent
 * receiving tasks from the admin team; students can use it too). Same response
 * shape as /api/student/tasks so the same workspace renders it. Read-only, so it
 * trusts the signed token's id like the other board endpoints.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    const assignee = { role: assigneeRoleForUser(user.role), id: user.id };

    // Assignees never see cancelled tasks.
    const query = { ...readTaskListQuery(new URL(request.url).searchParams), includeCancelled: false, studentId: null };
    const base = assigneeWhere(assignee);

    const [items, columnCounts, metrics, lookups] = await Promise.all([
      prisma.studentTask.findMany({
        where: buildStudentTaskWhere(base, query),
        include: studentTaskListInclude,
        orderBy: [{ task: { deadline: { sort: 'asc', nulls: 'last' } } }, { createdAt: 'desc' }],
        take: MAX_ROWS + 1,
      }),
      countByStatus(buildStudentTaskWhere(base, query, { searchStudents: false, ignoreStatus: true })),
      getAssigneeTaskMetrics(assignee),
      getAssigneeTaskLookups(assignee),
    ]);

    return NextResponse.json({
      success: true,
      items: items.slice(0, MAX_ROWS),
      truncated: items.length > MAX_ROWS,
      columnCounts,
      metrics,
      categories: lookups.categories,
      mentors: lookups.mentors,
      assigneeRole: assignee.role,
      assigneeId: assignee.id,
    });
  } catch (error) {
    console.error('Error fetching assigned tasks:', error);
    return NextResponse.json({ success: false, error: 'Internal server error fetching tasks' }, { status: 500 });
  }
}
