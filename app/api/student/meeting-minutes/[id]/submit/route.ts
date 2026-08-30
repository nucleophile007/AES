import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validateMinutesText } from '@/lib/meeting-minutes';
import { getApplicationUrl, sendAcademicNotification } from '@/lib/academic-notifications';

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    if (!hasRole(user, 'student')) return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    const id = Number((await context.params).id);
    if (!Number.isInteger(id)) return NextResponse.json({ error: 'Invalid request ID' }, { status: 400 });
    const body = await request.json();
    const minutes = validateMinutesText(body.studentMinutes);
    const record = await prisma.meetingMinuteRequest.findFirst({
      where: { id, studentId: user.id },
      include: {
        student: { select: { name: true, email: true } },
        meeting: { include: { teacher: { select: { name: true, email: true } } } },
      },
    });
    if (!record) return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    if (record.status !== 'ASSIGNED') return NextResponse.json({ error: 'Meeting minutes cannot be changed after submission' }, { status: 409 });
    const updated = await prisma.meetingMinuteRequest.update({
      where: { id },
      data: { studentMinutes: minutes, submittedAt: new Date(), status: 'SUBMITTED', teacherFinalText: null, reviewedAt: null },
      include: { meeting: true },
    });
    const notification = await sendAcademicNotification({
      recipients: [{ email: record.meeting.teacher.email, name: record.meeting.teacher.name }],
      subject: `Meeting minutes submitted: ${record.meeting.title}`,
      heading: 'Meeting minutes are ready for review',
      message: `${record.student.name} submitted meeting minutes for ${record.meeting.title}.`,
      details: [
        { label: 'Student', value: record.student.name },
        { label: 'Meeting', value: record.meeting.title },
      ],
      actionLabel: 'Review meeting minutes',
      actionUrl: getApplicationUrl('/teacher-dashboard?tab=meeting-minutes'),
      replyTo: record.student.email,
    });
    return NextResponse.json({ success: true, request: updated, notification });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to submit meeting minutes';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
