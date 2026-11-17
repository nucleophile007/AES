import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { averageReviewHours, computeStudentInsights, isTaskStuck } from '@/lib/tasks';
import { readAssignee } from '@/lib/task-actors';
import { adminScopeWhere, authenticateAdminRequest, privateJson, readAdminScope } from '@/lib/task-admin';

/**
 * Insights across the admin's scope (?source, ?creatorTeacherId, ?assigneeRole, ?days):
 * completion, review time, stuck items, per-assignee and per-category breakdowns.
 */
export async function GET(request: NextRequest) {
  const auth = authenticateAdminRequest(request);
  if (auth.error) return auth.error;
  try {
    const sp = request.nextUrl.searchParams;
    const daysParam = Number(sp.get('days'));
    const days = Number.isInteger(daysParam) && daysParam > 0 && daysParam <= 730 ? daysParam : 90;
    const since = new Date(Date.now() - days * 864e5);
    const scope = adminScopeWhere(readAdminScope(sp));

    const rows = await prisma.studentTask.findMany({
      where: { AND: [scope, { task: { isCancelled: false, createdAt: { gte: since } } }] },
      select: {
        id: true,
        assigneeRole: true,
        studentId: true,
        assigneeTeacherId: true,
        assigneeParentId: true,
        status: true,
        startedAt: true,
        submittedAt: true,
        completedAt: true,
        reviewedAt: true,
        updatedAt: true,
        student: { select: { id: true, name: true, email: true } },
        assigneeTeacher: { select: { id: true, name: true, email: true } },
        assigneeParent: { select: { id: true, name: true, email: true } },
        task: { select: { id: true, title: true, deadline: true, category: true, creatorRole: true } },
      },
      take: 20_000,
    });

    // computeStudentInsights groups by a numeric id; give each assignee (any role) its own key.
    const keys = new Map<string, { key: number; role: string; id: number }>();
    const flat = rows.map((r) => {
      const a = readAssignee(r);
      const k = `${r.assigneeRole}:${a?.id ?? 0}`;
      if (!keys.has(k)) keys.set(k, { key: keys.size + 1, role: r.assigneeRole, id: a?.id ?? 0 });
      return {
        studentId: keys.get(k)!.key,
        studentName: a?.name ?? 'Unknown',
        status: r.status,
        deadline: r.task.deadline,
        submittedAt: r.submittedAt,
        completedAt: r.completedAt,
        reviewedAt: r.reviewedAt,
        startedAt: r.startedAt,
        updatedAt: r.updatedAt,
      };
    });
    const byKey = new Map(Array.from(keys.values()).map((v) => [v.key, v]));

    const now = new Date();
    const stuck = rows
      .filter((r) => isTaskStuck(r, now))
      .map((r) => ({
        studentTaskId: r.id,
        taskId: r.task.id,
        title: r.task.title,
        assigneeName: readAssignee(r)?.name ?? 'Unknown',
        assigneeRole: r.assigneeRole,
        fromAdmin: r.task.creatorRole === 'ADMIN',
        status: r.status,
        since: r.updatedAt,
      }))
      .slice(0, 50);

    const byCategory = new Map<string, { total: number; completed: number }>();
    rows.forEach((r) => {
      const c = byCategory.get(r.task.category) ?? { total: 0, completed: 0 };
      c.total += 1;
      if (r.status === 'COMPLETED') c.completed += 1;
      byCategory.set(r.task.category, c);
    });

    const completed = rows.filter((r) => r.status === 'COMPLETED').length;
    return privateJson({
      success: true,
      days,
      summary: {
        total: rows.length,
        completed,
        completionRate: rows.length ? completed / rows.length : 0,
        avgReviewHours: averageReviewHours(flat),
        stuck: stuck.length,
      },
      assignees: computeStudentInsights(flat, now).map(({ studentId, ...rest }) => {
        const k = byKey.get(studentId);
        return { ...rest, assigneeRole: k?.role ?? 'STUDENT', assigneeId: k?.id ?? 0 };
      }),
      categories: Array.from(byCategory.entries())
        .map(([category, v]) => ({ category, ...v }))
        .sort((a, b) => b.total - a.total),
      stuck,
    });
  } catch (error) {
    console.error('Admin task insights failed:', error);
    return privateJson({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
