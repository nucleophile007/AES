import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApplicationUrl, sendAcademicNotification } from "@/lib/academic-notifications";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      eventId,
      studentName,
      studentEmail,
      studentPhone,
      studentGrade,
      schoolName,
      parentName,
      parentEmail,
      parentPhone,
      specialRequirements,
      howDidYouHear,
      customFieldResponses,
      paymentAmount,
    } = body;

    // Validate required fields
    if (!eventId || !studentName || !studentEmail || !parentName || !parentEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if event exists and is published
    const event = await prisma.generalEvent.findUnique({
      where: { id: eventId },
      include: {
        registrations: {
          where: {
            registrationStatus: {
              in: ["confirmed", "registered"],
            },
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    if (!event.isPublished) {
      return NextResponse.json(
        { error: "Event is not open for registration" },
        { status: 403 }
      );
    }

    // Check if registration deadline has passed
    if (event.registrationDeadline && new Date() > event.registrationDeadline) {
      return NextResponse.json(
        { error: "Registration deadline has passed" },
        { status: 403 }
      );
    }

    // Check if event is full
    if (event.maxParticipants) {
      const confirmedCount = event.registrations.length;
      if (confirmedCount >= event.maxParticipants) {
        return NextResponse.json(
          { error: "Event is full. No more spots available." },
          { status: 403 }
        );
      }
    }

    // Check if user already registered
    const existingRegistration = await prisma.eventRegistration.findFirst({
      where: {
        eventId,
        studentEmail,
        registrationStatus: {
          notIn: ["cancelled"],
        },
      },
    });

    if (existingRegistration) {
      return NextResponse.json(
        { error: "You have already registered for this event" },
        { status: 409 }
      );
    }

    // Determine payment status
    const paymentStatus = event.requiresPayment ? "pending" : "waived";
    const registrationStatus = event.requiresPayment ? "pending" : "confirmed";

    // Create registration
    const registration = await prisma.eventRegistration.create({
      data: {
        eventId,
        studentName,
        studentEmail,
        studentPhone: studentPhone || null,
        studentGrade: studentGrade || null,
        schoolName: schoolName || null,
        parentName,
        parentEmail,
        parentPhone: parentPhone || null,
        specialRequirements: specialRequirements || null,
        howDidYouHear: howDidYouHear || null,
        customFieldResponses: customFieldResponses || null,
        registrationStatus,
        paymentStatus,
        paymentAmount: paymentAmount || 0,
      },
    });

    // TODO: If payment required, initiate payment process
    const eventDate = event.eventDate.toLocaleString('en-US');
    const familyNotification = await sendAcademicNotification({
      recipients: [
        { email: studentEmail, name: studentName },
        { email: parentEmail, name: parentName },
      ],
      subject: `Event registration received: ${event.title}`,
      heading: event.requiresPayment ? 'Event registration received' : 'Event registration confirmed',
      message: event.requiresPayment
        ? `We received the registration for ${studentName}. Complete payment to confirm the event spot.`
        : `${studentName} is registered for ${event.title}.`,
      details: [
        { label: 'Event', value: event.title },
        { label: 'Date', value: eventDate },
        { label: 'Time', value: event.eventTime },
        { label: 'Location', value: event.location },
        { label: 'Registration ID', value: String(registration.id) },
        { label: 'Status', value: registrationStatus },
      ],
      actionLabel: 'View events',
      actionUrl: getApplicationUrl('/events'),
    });
    const adminNotification = await sendAcademicNotification({
      recipients: [{ email: process.env.ADMIN_EMAIL, name: 'ACHARYA Admin' }],
      subject: `New event registration: ${event.title} — ${studentName}`,
      heading: 'New event registration',
      message: `${studentName} has registered for ${event.title}.`,
      details: [
        { label: 'Student', value: `${studentName} (${studentEmail})` },
        { label: 'Parent', value: `${parentName} (${parentEmail})` },
        { label: 'Event', value: event.title },
        { label: 'Registration ID', value: String(registration.id) },
        { label: 'Payment status', value: paymentStatus },
      ],
      replyTo: parentEmail,
    });

    // Schedule 24h prior event reminder if event date is in the future
    try {
      const eventDateTime = new Date(event.eventDate).getTime();
      const reminderTime = eventDateTime - 24 * 60 * 60 * 1000;
      if (reminderTime > Date.now()) {
        const { qstash } = await import('@/lib/qstash');
        const reminderUrl = getApplicationUrl('/api/jobs/event-reminders');
        if (reminderUrl) {
          await qstash.publishJSON({
            url: reminderUrl,
            body: {
              eventId: event.id,
              registrationId: registration.id,
            },
            notBefore: Math.floor(reminderTime / 1000),
            deduplicationId: `event-reminder-${event.id}-reg-${registration.id}`,
            retries: 2,
          });
        }
      }
    } catch (schedErr) {
      console.warn('[Event Registration] Reminder scheduling notice:', schedErr);
    }

    return NextResponse.json({
      success: true,
      registrationId: registration.id,
      message: event.requiresPayment
        ? "Registration submitted. Please complete payment to confirm your spot."
        : "Registration successful! You will receive a confirmation email shortly.",
      requiresPayment: event.requiresPayment,
      paymentAmount,
      notification: {
        attempted: familyNotification.attempted + adminNotification.attempted,
        sent: familyNotification.sent + adminNotification.sent,
        failed: familyNotification.failed + adminNotification.failed,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to process registration. Please try again." },
      { status: 500 }
    );
  }
}
