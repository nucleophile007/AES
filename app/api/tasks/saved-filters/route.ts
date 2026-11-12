import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { sanitizeFilterQuery } from '@/lib/tasks';

const MAX_SAVED = 20;

async function getOwner(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user || (user.role !== 'teacher' && user.role !== 'student')) return null;
  const owner =
    user.role === 'teacher'
      ? await prisma.teacher.findUnique({ where: { email: user.email }, select: { id: true } })
      : await prisma.student.findUnique({ where: { email: user.email }, select: { id: true } });
  return owner ? { ownerId: owner.id, ownerRole: user.role } : null;
}

const unauthorized = () => NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

export async function GET(request: NextRequest) {
  const owner = await getOwner(request);
  if (!owner) return unauthorized();
  const filters = await prisma.taskSavedFilter.findMany({ where: owner, orderBy: { name: 'asc' } });
  return NextResponse.json({ success: true, filters });
}

export async function POST(request: NextRequest) {
  const owner = await getOwner(request);
  if (!owner) return unauthorized();
  const body = await request.json();
  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 60) : '';
  const query = typeof body.query === 'string' ? sanitizeFilterQuery(body.query) : '';
  if (!name) return NextResponse.json({ success: false, error: 'Give the filter a name' }, { status: 400 });
  if (!query) return NextResponse.json({ success: false, error: 'Set at least one filter first' }, { status: 400 });

  const count = await prisma.taskSavedFilter.count({ where: owner });
  const existing = await prisma.taskSavedFilter.findUnique({
    where: { ownerRole_ownerId_name: { ownerRole: owner.ownerRole, ownerId: owner.ownerId, name } },
  });
  if (!existing && count >= MAX_SAVED) {
    return NextResponse.json({ success: false, error: `You can save up to ${MAX_SAVED} filters` }, { status: 400 });
  }
  const filter = await prisma.taskSavedFilter.upsert({
    where: { ownerRole_ownerId_name: { ownerRole: owner.ownerRole, ownerId: owner.ownerId, name } },
    create: { ...owner, name, query },
    update: { query },
  });
  return NextResponse.json({ success: true, filter });
}

export async function DELETE(request: NextRequest) {
  const owner = await getOwner(request);
  if (!owner) return unauthorized();
  const id = Number(new URL(request.url).searchParams.get('id'));
  if (!Number.isInteger(id)) return NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400 });
  const res = await prisma.taskSavedFilter.deleteMany({ where: { id, ...owner } });
  if (!res.count) return NextResponse.json({ success: false, error: 'Filter not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
