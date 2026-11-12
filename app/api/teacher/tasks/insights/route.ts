import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import { averageReviewHours, computeStudentInsights, isTaskStuck } from '@/lib/tasks';

/**
 * Per-student completion / on-time rates, stuck items and review turnaround.
 * Optional ?days=N limits to tasks created in the last N days (default 90).
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || !hasRole(user, 'teacher')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const teacher = await prisma.teacher.findUnique({ where: { email: user.email }, select: { id: true } });
    if (!teacher) return NextResponse.json({ success: false, error: 'Teacher not found' }, { status: 404 });

    const daysParam = Number(new URL(request.url).searchParams.get('days') ?? 90);
    const days = Number.isInteger(daysParam) && daysParam > 0 && daysParam <= 730 ? daysParam : 90;
    const since = new Date(Date.now() - days * 864e5);

    const rows = await prisma.studentTask.findMany({
      where: { task: { creatorId: teacher.id, isCancelled: false, createdAt: { gte: since } } },
      select: {
        id: true,
        studentId: true,
        status: true,
        startedAt: true,
        submittedAt: true,
        completedAt: true,
        reviewedAt: true,
        updatedAt: true,
        student: { select: { name: true } },
        task: { select: { id: true, title: true, deadline: true, category: true } },
      },
    });

    const flat = rows.map((r) => ({
      studentId: r.studentId,
      studentName: r.student.name,
      status: r.status,
      deadline: r.task.deadline,
      submittedAt: r.submittedAt,
      completedAt: r.completedAt,
      reviewedAt: r.reviewedAt,
      startedAt: r.startedAt,
      updatedAt: r.updatedAt,
    }));

    const now = new Date();
    const stuck = rows
      .filter((r) => isTaskStuck(r, now))
      .map((r) => ({
        studentTaskId: r.id,
        taskId: r.task.id,
        title: r.task.title,
        studentName: r.student.name,
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
    return NextResponse.json({
      success: true,
      days,
      summary: {
        total: rows.length,
        completed,
        completionRate: rows.length ? completed / rows.length : 0,
        avgReviewHours: averageReviewHours(flat),
        stuck: stuck.length,
      },
      students: computeStudentInsights(flat, now),
      categories: Array.from(byCategory.entries())
        .map(([category, v]) => ({ category, ...v }))
        .sort((a, b) => b.total - a.total),
      stuck,
    });
  } catch (error) {
    console.error('Task insights error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
