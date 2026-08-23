import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validateMinutesText } from '@/lib/meeting-minutes';
import { sendMail } from '@/lib/mailer';

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    if (!hasRole(user, 'teacher')) return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    const id = Number((await context.params).id);
    if (!Number.isInteger(id)) return NextResponse.json({ error: 'Invalid request ID' }, { status: 400 });
    const body = await request.json();
    const approve = body.approve === true;
    const record = await prisma.meetingMinuteRequest.findFirst({
      where: { id, meeting: { teacher: { email: user.email } } },
      include: {
        meeting: { include: { teacher: { select: { name: true, email: true } } } },
        student: { include: { parentAccount: { select: { name: true, email: true } } } },
      },
    });
    if (!record) return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    if (record.status === 'ASSIGNED') return NextResponse.json({ error: 'The student has not submitted minutes yet' }, { status: 409 });
    const suppliedText = typeof body.teacherFinalText === 'string' ? body.teacherFinalText.trim() : '';
    const finalText = validateMinutesText(suppliedText || record.studentMinutes);
    const now = new Date();
    const updated = await prisma.meetingMinuteRequest.update({
      where: { id },
      data: { teacherFinalText: finalText, reviewedAt: now, ...(approve ? { status: 'APPROVED', approvedAt: now } : {}) },
      include: { student: { select: { id: true, name: true, email: true } }, meeting: true },
    });
    let notificationWarning: string | null = null;
    if (approve) {
      const parentEmail = record.student.parentAccount?.email || record.student.parentEmail;
      const recipients = Array.from(new Set([record.student.email, parentEmail].map((email) => email?.trim().toLowerCase()).filter((email): email is string => Boolean(email))));
      const meetingDate = record.meeting.startDateTime.toLocaleString('en-US', { timeZone: record.meeting.timezone });
      const text = [
        `Meeting: ${record.meeting.title}`,
        `Student: ${record.student.name}`,
        `Teacher: ${record.meeting.teacher.name}`,
        `When: ${meetingDate} (${record.meeting.timezone})`,
        '',
        'Approved meeting minutes:',
        finalText,
        '',
        'These minutes are also available in your AES dashboard.',
      ].join('\n');
      const results = await Promise.allSettled(recipients.map((email) => sendMail({
        to: email,
        subject: `Approved Meeting Minutes • ${record.meeting.title}`,
        text,
        html: `<div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a"><p>Meeting minutes for <strong>${escapeHtml(record.meeting.title)}</strong> have been approved by ${escapeHtml(record.meeting.teacher.name)}.</p><p><strong>Student:</strong> ${escapeHtml(record.student.name)}<br/><strong>When:</strong> ${escapeHtml(meetingDate)} (${escapeHtml(record.meeting.timezone)})</p><p><strong>Approved meeting minutes:</strong></p><div style="white-space:pre-wrap;background:#f8fafc;padding:12px;border-radius:8px">${escapeHtml(finalText)}</div><p>These minutes are also available in your AES dashboard.</p></div>`,
        replyTo: record.meeting.teacher.email,
      })));
      if (results.some((result) => result.status === 'rejected')) notificationWarning = 'Minutes were approved, but one or more email notifications could not be sent.';
    }
    return NextResponse.json({ success: true, request: updated, notificationWarning });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to review meeting minutes';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] || character);
}
