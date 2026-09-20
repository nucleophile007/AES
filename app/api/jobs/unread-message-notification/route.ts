import { NextResponse } from 'next/server';
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';
import { prisma } from '@/lib/prisma';
import { getApplicationUrl, sendAcademicNotification } from '@/lib/academic-notifications';

export const runtime = 'nodejs';
export const maxDuration = 60;

async function handler(req: Request) {
  try {
    const body = await req.json();
    const { messageId } = body;

    if (!messageId) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    // 1. Fetch message and check if it's still unread
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return NextResponse.json({ status: 'skipped', reason: 'Message not found' });
    }

    if (message.isRead) {
      return NextResponse.json({ status: 'skipped', reason: 'Message already read' });
    }

    // 2. Resolve recipient details
    let recipient: { email: string; name: string } | null = null;
    let dashboardPath = '/student-dashboard?tab=messages';

    if (message.recipientRole === 'teacher') {
      const teacher = await prisma.teacher.findUnique({
        where: { id: message.recipientId },
        select: { email: true, name: true },
      });
      if (teacher?.email) recipient = { email: teacher.email, name: teacher.name };
      dashboardPath = '/teacher-dashboard?tab=messages';
    } else if (message.recipientRole === 'student') {
      const student = await prisma.student.findUnique({
        where: { id: message.recipientId },
        select: { email: true, name: true },
      });
      if (student?.email) recipient = { email: student.email, name: student.name };
      dashboardPath = '/student-dashboard?tab=messages';
    } else if (message.recipientRole === 'parent') {
      const parent = await prisma.parentAccount.findUnique({
        where: { id: message.recipientId },
        select: { email: true, name: true },
      });
      if (parent?.email) recipient = { email: parent.email, name: parent.name };
      dashboardPath = '/parent-dashboard?tab=messages';
    }

    if (!recipient?.email) {
      return NextResponse.json({ status: 'skipped', reason: 'Recipient email not found' });
    }

    // 3. Resolve sender details
    let senderName = 'Your mentor/student';
    if (message.senderRole === 'teacher') {
      const sender = await prisma.teacher.findUnique({
        where: { id: message.senderId },
        select: { name: true },
      });
      if (sender?.name) senderName = sender.name;
    } else if (message.senderRole === 'student') {
      const sender = await prisma.student.findUnique({
        where: { id: message.senderId },
        select: { name: true },
      });
      if (sender?.name) senderName = sender.name;
    } else if (message.senderRole === 'parent') {
      const sender = await prisma.parentAccount.findUnique({
        where: { id: message.senderId },
        select: { name: true },
      });
      if (sender?.name) senderName = sender.name;
    }

    // 4. Check total unread messages from this sender to recipient
    const unreadCount = await prisma.message.count({
      where: {
        senderId: message.senderId,
        senderRole: message.senderRole,
        recipientId: message.recipientId,
        recipientRole: message.recipientRole,
        isRead: false,
      },
    });

    const senderRoleLabel = message.senderRole.charAt(0).toUpperCase() + message.senderRole.slice(1);
    const previewContent = message.content.length > 140
      ? `${message.content.substring(0, 140)}...`
      : message.content;

    // 5. Dispatch notification email
    const notification = await sendAcademicNotification({
      recipients: [recipient],
      subject: `New message from ${senderName} on ACHARYA`,
      heading: 'You have an unread message',
      message: `${senderName} (${senderRoleLabel}) sent you a message on the ACHARYA platform.`,
      details: [
        { label: 'From', value: `${senderName} (${senderRoleLabel})` },
        { label: 'Message Preview', value: `"${previewContent}"` },
        { label: 'Sent at', value: message.createdAt.toLocaleString('en-US') },
        ...(unreadCount > 1 ? [{ label: 'Total Unread Messages', value: String(unreadCount) }] : []),
      ],
      actionLabel: 'Open Messages & Reply',
      actionUrl: getApplicationUrl(dashboardPath),
    });

    return NextResponse.json({
      success: true,
      status: 'sent',
      recipient: recipient.email,
      notification,
    });
  } catch (error) {
    console.error('Error processing unread message notification:', error);
    return NextResponse.json({ error: 'Failed to process unread message notification' }, { status: 500 });
  }
}

export const POST = verifySignatureAppRouter(handler);
