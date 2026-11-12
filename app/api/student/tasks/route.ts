import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import {
  buildStudentTaskWhere,
  countByStatus,
  getStudentTaskLookups,
  getStudentTaskMetrics,
  readTaskListQuery,
  studentTaskListInclude,
} from '@/lib/task-server';

const MAX_ROWS = 500;

/**
 * Student board data. Read-only, so it trusts the signed token's student id
 * instead of looking the student up again (one fewer database round trip).
 * Categories and mentors are always included: they're cheap for one student
 * and the filter bar needs them.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    if (!hasRole(user, 'student')) return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 403 });
    const studentId = user.id;

    // Students never see cancelled tasks.
    const query = { ...readTaskListQuery(new URL(request.url).searchParams), includeCancelled: false, studentId: null };
    const base = { studentId };

    const [items, columnCounts, metrics, lookups] = await Promise.all([
      prisma.studentTask.findMany({
        where: buildStudentTaskWhere(base, query),
        include: studentTaskListInclude,
        orderBy: [{ task: { deadline: { sort: 'asc', nulls: 'last' } } }, { createdAt: 'desc' }],
        take: MAX_ROWS + 1,
      }),
      countByStatus(buildStudentTaskWhere(base, query, { searchStudents: false, ignoreStatus: true })),
      getStudentTaskMetrics(studentId),
      getStudentTaskLookups(studentId),
    ]);

    return NextResponse.json({
      success: true,
      items: items.slice(0, MAX_ROWS),
      truncated: items.length > MAX_ROWS,
      columnCounts,
      metrics,
      categories: lookups.categories,
      mentors: lookups.mentors,
      studentId,
    });
  } catch (error) {
    console.error('Error fetching student tasks:', error);
    return NextResponse.json({ success: false, error: 'Internal server error fetching tasks' }, { status: 500 });
  }
}
