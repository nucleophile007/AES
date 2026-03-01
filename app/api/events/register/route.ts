import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    // TODO: Send confirmation email to student and parent
    // TODO: Send notification to admin
    // TODO: If payment required, initiate payment process

    return NextResponse.json({
      success: true,
      registrationId: registration.id,
      message: event.requiresPayment
        ? "Registration submitted. Please complete payment to confirm your spot."
        : "Registration successful! You will receive a confirmation email shortly.",
      requiresPayment: event.requiresPayment,
      paymentAmount,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to process registration. Please try again." },
      { status: 500 }
    );
  }
}
