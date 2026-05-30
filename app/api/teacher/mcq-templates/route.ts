import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasRole } from '@/lib/auth';

const TEST_CONFIG_START = '[MCQ_TEST_CONFIG_V1]';
const TEST_CONFIG_END = '[/MCQ_TEST_CONFIG_V1]';
const LEGACY_TEMPLATE_START = '[MCQ_TEMPLATE_CONFIG_V1]';
const LEGACY_TEMPLATE_END = '[/MCQ_TEMPLATE_CONFIG_V1]';

const encodeDescription = (summary: string, config: unknown) => {
  const encoded = Buffer.from(JSON.stringify(config), 'utf8').toString('base64');
  return `${summary || ''}\n\n${TEST_CONFIG_START}${encoded}${TEST_CONFIG_END}`;
};

const decodeDescription = (description: string | null) => {
  const value = description || '';
  const candidates: Array<[string, string]> = [
    [TEST_CONFIG_START, TEST_CONFIG_END],
    [LEGACY_TEMPLATE_START, LEGACY_TEMPLATE_END],
  ];

  let summary = value.trim();
  let encoded = '';
  let found = false;

  for (const [startMarker, endMarker] of candidates) {
    const start = value.indexOf(startMarker);
    const end = value.indexOf(endMarker);
    if (start === -1 || end === -1 || end <= start) continue;
    summary = value.slice(0, start).trim();
    encoded = value.slice(start + startMarker.length, end).trim();
    found = true;
    break;
  }

  if (!found) {
    return { summary, config: null as unknown };
  }

  try {
    const json = Buffer.from(encoded, 'base64').toString('utf8');
    return { summary, config: JSON.parse(json) };
  } catch {
    return { summary, config: null as unknown };
  }
};

const getTeacher = async (userEmail: string) => {
  return prisma.teacher.findUnique({ where: { email: userEmail } });
};

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    if (!hasRole(user, 'teacher')) return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const teacherEmail = searchParams.get('teacherEmail');
    if (teacherEmail && teacherEmail.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 403 });
    }

    const teacher = await getTeacher(user.email);
    if (!teacher) return NextResponse.json({ success: false, error: 'Teacher not found' }, { status: 404 });

    const resources = await prisma.resource.findMany({
      where: {
        teacherId: teacher.id,
        type: 'mcq_template',
      },
      orderBy: { updatedAt: 'desc' },
    });

    const tests = resources.map((resource) => {
      const parsed = decodeDescription(resource.description);
      return {
        id: resource.id,
        title: resource.title,
        summary: parsed.summary,
        config: parsed.config,
        fileUrl: resource.fileUrl,
        fileName: resource.fileName,
        createdAt: resource.createdAt,
        updatedAt: resource.updatedAt,
      };
    });

    return NextResponse.json(
      { success: true, tests, templates: tests },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Error fetching tests:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch tests' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    if (!hasRole(user, 'teacher')) return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 403 });

    const teacher = await getTeacher(user.email);
    if (!teacher) return NextResponse.json({ success: false, error: 'Teacher not found' }, { status: 404 });

    const data = await request.json();
    const title = String(data.title || '').trim();
    const summary = String(data.summary || '').trim();
    const pdfUrl = String(data.pdfUrl || '').trim();
    const pdfName = String(data.pdfName || '').trim();
    const config = data.config;

    if (!title) {
      return NextResponse.json({ success: false, error: 'Test title is required' }, { status: 400 });
    }
    if (!pdfUrl) {
      return NextResponse.json({ success: false, error: 'PDF URL is required' }, { status: 400 });
    }
    if (!config || typeof config !== 'object') {
      return NextResponse.json({ success: false, error: 'Test config is required' }, { status: 400 });
    }

    const resource = await prisma.resource.create({
      data: {
        title,
        description: encodeDescription(summary, config),
        type: 'mcq_template',
        fileUrl: pdfUrl,
        fileName: pdfName || null,
        fileSize: null,
        linkUrl: null,
        program: 'General',
        subject: 'General',
        grade: 'General',
        teacherId: teacher.id,
        isPublic: false,
      },
    });

    return NextResponse.json({ success: true, test: resource, template: resource });
  } catch (error) {
    console.error('Error creating test:', error);
    return NextResponse.json({ success: false, error: 'Failed to create test' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    if (!hasRole(user, 'teacher')) return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 403 });

    const teacher = await getTeacher(user.email);
    if (!teacher) return NextResponse.json({ success: false, error: 'Teacher not found' }, { status: 404 });

    const data = await request.json();
    const id = Number(data.id);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ success: false, error: 'Test id is required' }, { status: 400 });
    }

    const existing = await prisma.resource.findFirst({ where: { id, teacherId: teacher.id, type: 'mcq_template' } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Test not found' }, { status: 404 });
    }

    const title = data.title !== undefined ? String(data.title || '').trim() : existing.title;
    const summary = data.summary !== undefined ? String(data.summary || '').trim() : decodeDescription(existing.description).summary;
    const pdfUrl = data.pdfUrl !== undefined ? String(data.pdfUrl || '').trim() : (existing.fileUrl || '');
    const pdfName = data.pdfName !== undefined ? String(data.pdfName || '').trim() : (existing.fileName || '');
    const config = data.config !== undefined ? data.config : decodeDescription(existing.description).config;

    if (!title) {
      return NextResponse.json({ success: false, error: 'Test title is required' }, { status: 400 });
    }
    if (!pdfUrl) {
      return NextResponse.json({ success: false, error: 'PDF URL is required' }, { status: 400 });
    }
    if (!config || typeof config !== 'object') {
      return NextResponse.json({ success: false, error: 'Test config is required' }, { status: 400 });
    }

    const updated = await prisma.resource.update({
      where: { id },
      data: {
        title,
        description: encodeDescription(summary, config),
        fileUrl: pdfUrl,
        fileName: pdfName || null,
      },
    });

    return NextResponse.json({ success: true, test: updated, template: updated });
  } catch (error) {
    console.error('Error updating test:', error);
    return NextResponse.json({ success: false, error: 'Failed to update test' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    if (!hasRole(user, 'teacher')) return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 403 });

    const teacher = await getTeacher(user.email);
    if (!teacher) return NextResponse.json({ success: false, error: 'Teacher not found' }, { status: 404 });

    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get('id'));
    if (!Number.isFinite(id)) {
      return NextResponse.json({ success: false, error: 'Test id is required' }, { status: 400 });
    }

    const existing = await prisma.resource.findFirst({
      where: { id, teacherId: teacher.id, type: 'mcq_template' },
      include: {
        assignmentLinks: {
          select: { id: true },
        },
      },
    });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Test not found' }, { status: 404 });
    }

    await prisma.resource.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: existing.assignmentLinks.length > 0
        ? 'Test deleted and detached from linked assignments.'
        : 'Test deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting test:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete test' }, { status: 500 });
  }
}
