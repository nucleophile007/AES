import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@/generated/prisma';
import { authenticateAdminRequest, MAX_ADMIN_ASSIGNEES, privateJson } from '@/lib/task-admin';

/**
 * People an admin can assign tasks to, for the "Assign to" picker.
 *   ?role=STUDENT|TEACHER|PARENT (required)
 *   ?q=            name/email search
 *   ?program=      students in a program (STUDENT only)
 *   ?teacherId=    students linked to a mentor (STUDENT only)
 *   ?studentIds=1,2  parents of these students (PARENT only)
 *   ?all=1         return every match (up to the assignment limit) for "select all"
 *   ?programs=1    also return the list of student programs
 */
export async function GET(request: NextRequest) {
  const auth = authenticateAdminRequest(request);
  if (auth.error) return auth.error;
  try {
    const sp = request.nextUrl.searchParams;
    const role = sp.get('role');
    const q = sp.get('q')?.trim().slice(0, 100) || '';
    const take = sp.get('all') === '1' ? MAX_ADMIN_ASSIGNEES : 50;
    const search = q
      ? { OR: [{ name: { contains: q, mode: 'insensitive' as const } }, { email: { contains: q, mode: 'insensitive' as const } }] }
      : {};

    const programs =
      sp.get('programs') === '1'
        ? (await prisma.student.findMany({ distinct: ['program'], select: { program: true }, orderBy: { program: 'asc' } }))
            .map((p) => p.program)
            .filter(Boolean)
        : undefined;

    if (role === 'STUDENT') {
      const where: Prisma.StudentWhereInput = { ...search };
      const program = sp.get('program');
      if (program) where.program = program;
      const teacherId = Number(sp.get('teacherId'));
      if (Number.isInteger(teacherId) && teacherId > 0) where.teacherLinks = { some: { teacherId } };
      const [people, total] = await Promise.all([
        prisma.student.findMany({
          where,
          select: { id: true, name: true, email: true, grade: true, program: true, parentAccountId: true },
          orderBy: { name: 'asc' },
          take,
        }),
        prisma.student.count({ where }),
      ]);
      return privateJson({ success: true, people, total, programs });
    }

    if (role === 'TEACHER') {
      const where: Prisma.TeacherWhereInput = { ...search };
      const [people, total] = await Promise.all([
        prisma.teacher.findMany({ where, select: { id: true, name: true, email: true, programs: true }, orderBy: { name: 'asc' }, take }),
        prisma.teacher.count({ where }),
      ]);
      return privateJson({ success: true, people, total, programs });
    }

    if (role === 'PARENT') {
      const where: Prisma.ParentAccountWhereInput = { ...search };
      const studentIds = (sp.get('studentIds') || '')
        .split(',')
        .map(Number)
        .filter((n) => Number.isInteger(n) && n > 0)
        .slice(0, MAX_ADMIN_ASSIGNEES);
      if (studentIds.length) where.students = { some: { id: { in: studentIds } } };
      const [people, total] = await Promise.all([
        prisma.parentAccount.findMany({
          where,
          select: { id: true, name: true, email: true, students: { select: { id: true, name: true } } },
          orderBy: { name: 'asc' },
          take,
        }),
        prisma.parentAccount.count({ where }),
      ]);
      return privateJson({ success: true, people, total, programs });
    }

    return privateJson({ success: false, error: 'role must be STUDENT, TEACHER or PARENT' }, { status: 400 });
  } catch (error) {
    console.error('Admin task people search failed:', error);
    return privateJson({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
