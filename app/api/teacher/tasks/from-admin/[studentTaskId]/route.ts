import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import { adminTasksForMentorWhere, creatorInclude } from '@/lib/task-actors';

/** Read-only detail of an admin task given to one of this mentor's students (no comments). */
export async function GET(request: NextRequest, { params }: { params: Promise<{ studentTaskId: string }> }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    if (!hasRole(user, 'teacher')) {
      return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 403 });
    }
    const id = Number((await params).studentTaskId);
    if (!Number.isInteger(id)) return NextResponse.json({ success: false, error: 'Invalid task ID' }, { status: 400 });

    const task = await prisma.studentTask.findFirst({
      where: { id, ...adminTasksForMentorWhere(user.id) },
      include: {
        student: { select: { id: true, name: true, email: true, grade: true, program: true, schoolName: true } },
        task: {
          include: {
            ...creatorInclude,
            linkedAssignment: { select: { id: true, title: true, dueDate: true } },
            linkedResource: { select: { id: true, title: true, type: true, fileUrl: true } },
            linkedMeeting: { select: { id: true, title: true, startDateTime: true } },
          },
        },
        activities: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!task) return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    return NextResponse.json({ success: true, task, readOnly: true });
  } catch (error) {
    console.error('Error fetching admin task detail for mentor:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
