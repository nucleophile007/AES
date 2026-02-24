import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/events/[id] - Fetch a specific event by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const eventId = parseInt(id);

    if (isNaN(eventId)) {
      return NextResponse.json(
        { error: "Invalid event ID" },
        { status: 400 }
      );
    }

    const event = await prisma.generalEvent.findUnique({
      where: {
        id: eventId,
        isPublished: true, // Only return published events
      },
      include: {
        registrations: {
          select: {
            id: true,
            registrationStatus: true,
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

    // Calculate available spots
    const confirmedRegistrations = event.registrations.filter(
      (reg) => reg.registrationStatus === "confirmed" || reg.registrationStatus === "registered"
    ).length;

    const availableSpots = event.maxParticipants
      ? event.maxParticipants - confirmedRegistrations
      : null;

    const formattedEvent = {
      id: event.id,
      title: event.title,
      description: event.description,
      category: event.category,
      eventDate: event.eventDate.toISOString(),
      eventTime: event.eventTime,
      location: event.location,
      image: event.image || "/hero.png",
      maxParticipants: event.maxParticipants,
      availableSpots,
      registrationDeadline: event.registrationDeadline?.toISOString(),
      status: event.status,
      isFeatured: event.isFeatured,
      targetAudience: event.targetAudience,
      requirements: event.requirements,
      agenda: event.agenda,
      speakers: event.speakers,
      tags: event.tags,
      registrationFormConfig: event.registrationFormConfig,
      customFields: event.customFields,
      registrationFee: event.registrationFee,
      earlyBirdFee: event.earlyBirdFee,
      earlyBirdDeadline: event.earlyBirdDeadline?.toISOString(),
      requiresPayment: event.requiresPayment,
      contactEmail: event.contactEmail,
      contactPhone: event.contactPhone,
    };

    return NextResponse.json(formattedEvent);
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}
