import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Enable caching for 10 minutes
export const revalidate = 600; // 10 minutes in seconds

export async function GET() {
  try {
    const now = new Date();

    // Fetch upcoming published events
    const upcomingEvents = await prisma.generalEvent.findMany({
      where: {
        isPublished: true,
        eventDate: {
          gte: now,
        },
      },
      orderBy: {
        eventDate: "asc",
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
        registrationFee: true,
        requiresPayment: true,
        isFeatured: true,
        _count: {
          select: {
            registrations: {
              where: {
                registrationStatus: {
                  in: ["confirmed", "registered"],
                },
              },
            },
          },
        },
      },
    });

    // Fetch past published events
    const pastEvents = await prisma.generalEvent.findMany({
      where: {
        isPublished: true,
        eventDate: {
          lt: now,
        },
      },
      orderBy: {
        eventDate: "desc",
      },
      take: 6, // Limit to 6 most recent past events
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        eventDate: true,
        eventTime: true,
        location: true,
        image: true,
      },
    });

    // Format upcoming events with available spots
    const formattedUpcoming = upcomingEvents.map((event) => {
      const confirmedCount = event._count.registrations;
      const availableSpots = event.maxParticipants
        ? event.maxParticipants - confirmedCount
        : null;

      return {
        id: event.id,
        title: event.title,
        description: event.description,
        category: event.category,
        date: event.eventDate.toISOString().split("T")[0],
        time: event.eventTime,
        location: event.location,
        image: event.image || "/hero.png",
        maxParticipants: event.maxParticipants,
        availableSpots,
        registrationFee: event.registrationFee,
        requiresPayment: event.requiresPayment,
        isFeatured: event.isFeatured,
      };
    });

    // Format past events
    const formattedPast = pastEvents.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      category: event.category,
      date: event.eventDate.toISOString().split("T")[0],
      time: event.eventTime,
      location: event.location,
      image: event.image || "/hero.png",
    }));

    return NextResponse.json({
      upcoming: formattedUpcoming,
      past: formattedPast,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
      },
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
