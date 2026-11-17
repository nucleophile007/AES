import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import { buildStudentTaskWhere, countByStatus, readTaskListQuery, studentTaskListInclude } from '@/lib/task-server';
import { adminTasksForMentorWhere } from '@/lib/task-actors';

const MAX_ROWS = 500;

/**
 * Read-only list for the mentor's "From admin" view: they can follow their
 * students' admin tasks but can't review, edit or comment on them.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    if (!hasRole(user, 'teacher')) {
      return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 403 });
    }
    const base = adminTasksForMentorWhere(user.id);
    const query = { ...readTaskListQuery(new URL(request.url).searchParams), includeCancelled: false };

    const [items, columnCounts] = await Promise.all([
      prisma.studentTask.findMany({
        where: buildStudentTaskWhere(base, query, { searchStudents: true }),
        include: studentTaskListInclude,
        orderBy: [{ task: { deadline: { sort: 'asc', nulls: 'last' } } }, { createdAt: 'desc' }],
        take: MAX_ROWS + 1,
      }),
      countByStatus(buildStudentTaskWhere(base, query, { searchStudents: true, ignoreStatus: true })),
    ]);

    return NextResponse.json({
      success: true,
      items: items.slice(0, MAX_ROWS),
      truncated: items.length > MAX_ROWS,
      columnCounts,
    });
  } catch (error) {
    console.error('Error fetching admin tasks for mentor:', error);
    return NextResponse.json({ success: false, error: 'Internal server error fetching tasks' }, { status: 500 });
  }
}
