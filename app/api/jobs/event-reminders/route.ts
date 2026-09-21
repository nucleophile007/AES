import { NextResponse } from 'next/server';
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';
import { prisma } from '@/lib/prisma';
import { getApplicationUrl, sendAcademicNotification } from '@/lib/academic-notifications';

export const runtime = 'nodejs';
export const maxDuration = 60;

async function handler(req: Request) {
  try {
    let eventId: number | undefined;
    let registrationId: number | undefined;

    try {
      const body = await req.json();
      eventId = body.eventId ? Number(body.eventId) : undefined;
      registrationId = body.registrationId ? Number(body.registrationId) : undefined;
    } catch {
      // Allow trigger without body for scheduled cron execution
    }

    const now = new Date();
    const next48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    // If specific registration requested:
    if (registrationId) {
      const reg = await prisma.eventRegistration.findUnique({
        where: { id: registrationId },
        include: { event: true },
      });

      if (!reg || !['confirmed', 'registered'].includes(reg.registrationStatus)) {
        return NextResponse.json({ status: 'skipped', reason: 'Registration not found or unconfirmed' });
      }

      const event = reg.event;
      const eventDateFormatted = new Date(event.eventDate).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      const notification = await sendAcademicNotification({
        recipients: [
          { email: reg.studentEmail, name: reg.studentName },
          { email: reg.parentEmail, name: reg.parentName },
        ],
        subject: `Reminder: ${event.title} is tomorrow!`,
        heading: `Event Reminder: ${event.title}`,
        message: `This is a reminder that ${reg.studentName} is registered for ${event.title}, happening tomorrow. We look forward to seeing you there!`,
        details: [
          { label: 'Event', value: event.title },
          { label: 'Date', value: eventDateFormatted },
          { label: 'Time', value: event.eventTime },
          { label: 'Location', value: event.location },
          { label: 'Student', value: reg.studentName },
          ...(event.requirements ? [{ label: 'Requirements / Prep', value: event.requirements }] : []),
        ],
        actionLabel: 'View Event Details',
        actionUrl: getApplicationUrl('/events'),
      });

      return NextResponse.json({ success: true, count: 1, notification });
    }

    // Otherwise, scan upcoming events in the next 24-48 hours
    const eventsQuery: any = {
      isPublished: true,
      eventDate: {
        gte: now,
        lte: next48Hours,
      },
    };

    if (eventId) {
      eventsQuery.id = eventId;
    }

    const upcomingEvents = await prisma.generalEvent.findMany({
      where: eventsQuery,
      include: {
        registrations: {
          where: {
            registrationStatus: { in: ['confirmed', 'registered'] },
          },
        },
      },
    });

    let totalSent = 0;
    let totalAttempted = 0;

    for (const event of upcomingEvents) {
      const eventDateFormatted = new Date(event.eventDate).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      for (const reg of event.registrations) {
        const notif = await sendAcademicNotification({
          recipients: [
            { email: reg.studentEmail, name: reg.studentName },
            { email: reg.parentEmail, name: reg.parentName },
          ],
          subject: `Reminder: ${event.title} is tomorrow!`,
          heading: `Event Reminder: ${event.title}`,
          message: `This is a reminder that ${reg.studentName} is registered for ${event.title}, happening tomorrow. We look forward to having you join us!`,
          details: [
            { label: 'Event', value: event.title },
            { label: 'Date', value: eventDateFormatted },
            { label: 'Time', value: event.eventTime },
            { label: 'Location', value: event.location },
            { label: 'Student', value: reg.studentName },
            ...(event.requirements ? [{ label: 'Requirements / Prep', value: event.requirements }] : []),
          ],
          actionLabel: 'View Event Details',
          actionUrl: getApplicationUrl('/events'),
        });

        totalAttempted += notif.attempted;
        totalSent += notif.sent;
      }
    }

    return NextResponse.json({
      success: true,
      eventsProcessed: upcomingEvents.length,
      notifications: {
        attempted: totalAttempted,
        sent: totalSent,
      },
    });
  } catch (error) {
    console.error('Error sending event reminders:', error);
    return NextResponse.json({ error: 'Failed to process event reminders' }, { status: 500 });
  }
}

export const POST = verifySignatureAppRouter(handler);
