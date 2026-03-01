import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Enable caching for 5 minutes (revalidate every 5 minutes)
export const revalidate = 300; // 5 minutes in seconds
export const dynamic = 'force-static';

// API endpoint to fetch the latest upcoming published event
export async function GET() {
  try {
    const latestEvent = await prisma.generalEvent.findFirst({
      where: {
        isPublished: true,
        eventDate: {
          gte: new Date(), // Only future or today's events
        },
      },
      orderBy: {
        eventDate: "asc", // Get the nearest upcoming event
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        eventDate: true,
        eventTime: true,
        location: true,
        image: true,
        maxParticipants: true,
        registrationDeadline: true,
        status: true,
        isFeatured: true,
        targetAudience: true,
        requirements: true,
        agenda: true,
        speakers: true,
        tags: true,
        registrationFee: true,
        earlyBirdFee: true,
        earlyBirdDeadline: true,
        requiresPayment: true,
        contactEmail: true,
        contactPhone: true,
      },
    });
    
    if (!latestEvent) {
      return NextResponse.json(
        { error: "No upcoming events found" },
        { status: 404 }
      );
    }

    // Transform the data to match the expected format for the carousel
    const formattedEvent = {
      id: latestEvent.id,
      title: latestEvent.title,
      description: latestEvent.description,
      category: latestEvent.category,
      date: latestEvent.eventDate.toISOString().split('T')[0], // Format: YYYY-MM-DD
      time: latestEvent.eventTime,
      location: latestEvent.location,
      image: latestEvent.image || "/hero.png", // Fallback to default image
      maxParticipants: latestEvent.maxParticipants,
      registrationDeadline: latestEvent.registrationDeadline?.toISOString().split('T')[0],
      isFeatured: latestEvent.isFeatured,
      targetAudience: latestEvent.targetAudience,
      requirements: latestEvent.requirements,
      agenda: latestEvent.agenda,
      speakers: latestEvent.speakers,
      tags: latestEvent.tags,
      registrationFee: latestEvent.registrationFee,
      earlyBirdFee: latestEvent.earlyBirdFee,
      earlyBirdDeadline: latestEvent.earlyBirdDeadline?.toISOString().split('T')[0],
      requiresPayment: latestEvent.requiresPayment,
      contactEmail: latestEvent.contactEmail,
      contactPhone: latestEvent.contactPhone,
    };

    return NextResponse.json(formattedEvent, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error("Error fetching latest event:", error);
    return NextResponse.json(
      { error: "Failed to fetch latest event" },
      { status: 500 }
    );
  }
}
