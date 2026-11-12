import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import { parseTemplateInput } from '@/lib/task-templates';

type RouteContext = { params: Promise<{ id: string }> };

async function findOwnTemplate(request: NextRequest, params: RouteContext['params']) {
  const user = await getUserFromRequest(request);
  if (!user || !hasRole(user, 'teacher')) return null;
  const teacher = await prisma.teacher.findUnique({ where: { email: user.email }, select: { id: true } });
  const id = Number((await params).id);
  if (!teacher || !Number.isInteger(id)) return null;
  return prisma.taskTemplate.findFirst({ where: { id, teacherId: teacher.id }, select: { id: true } });
}

const notFound = () => NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 });

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const template = await findOwnTemplate(request, params);
    if (!template) return notFound();
    const parsed = parseTemplateInput(await request.json(), true);
    if (!parsed.ok) return NextResponse.json({ success: false, error: parsed.error }, { status: 400 });
    const updated = await prisma.taskTemplate.update({ where: { id: template.id }, data: parsed.data });
    return NextResponse.json({ success: true, template: updated });
  } catch (error: unknown) {
    if ((error as { code?: string })?.code === 'P2002') {
      return NextResponse.json({ success: false, error: 'You already have a template with that name' }, { status: 409 });
    }
    console.error('Update task template error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const template = await findOwnTemplate(request, params);
  if (!template) return notFound();
  // Tasks created from it keep their content; templateId is set to null.
  await prisma.taskTemplate.delete({ where: { id: template.id } });
  return NextResponse.json({ success: true });
}
