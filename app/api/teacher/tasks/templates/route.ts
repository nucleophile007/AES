import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import { parseTemplateInput } from '@/lib/task-templates';
import type { Prisma } from '@/generated/prisma';

async function getTeacherId(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user || !hasRole(user, 'teacher')) return null;
  const teacher = await prisma.teacher.findUnique({ where: { email: user.email }, select: { id: true } });
  return teacher?.id ?? null;
}

export async function GET(request: NextRequest) {
  const teacherId = await getTeacherId(request);
  if (!teacherId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const templates = await prisma.taskTemplate.findMany({
    where: { teacherId },
    orderBy: [{ usageCount: 'desc' }, { name: 'asc' }],
  });
  return NextResponse.json({ success: true, templates });
}

export async function POST(request: NextRequest) {
  try {
    const teacherId = await getTeacherId(request);
    if (!teacherId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const parsed = parseTemplateInput(await request.json(), false);
    if (!parsed.ok) return NextResponse.json({ success: false, error: parsed.error }, { status: 400 });

    const template = await prisma.taskTemplate.create({
      data: { ...(parsed.data as Prisma.TaskTemplateUncheckedCreateInput), teacherId },
    });
    return NextResponse.json({ success: true, template });
  } catch (error: unknown) {
    if ((error as { code?: string })?.code === 'P2002') {
      return NextResponse.json({ success: false, error: 'You already have a template with that name' }, { status: 409 });
    }
    console.error('Create task template error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
