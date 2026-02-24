import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/events - Get all events (with filters)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const isFeatured = searchParams.get("isFeatured");
    const isPublished = searchParams.get("isPublished");

    const where: any = {};

    if (status) where.status = status;
    if (category) where.category = category;
    if (isFeatured) where.isFeatured = isFeatured === "true";
    if (isPublished !== null) where.isPublished = isPublished === "true";

    const events = await prisma.generalEvent.findMany({
      where,
      include: {
        _count: {
          select: { registrations: true },
        },
      },
      orderBy: {
        eventDate: "asc",
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

// POST /api/events - Create a new event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      title,
      description,
      category,
      eventDate,
      eventTime,
      location,
      image,
      maxParticipants,
      registrationDeadline,
      status,
      isPublished,
      isFeatured,
      targetAudience,
      requirements,
      agenda,
      speakers,
      tags,
      contactEmail,
      contactPhone,
      createdBy,
    } = body;

    const event = await prisma.generalEvent.create({
      data: {
        title,
        description,
        category,
        eventDate: new Date(eventDate),
        eventTime,
        location,
        image,
        maxParticipants,
        registrationDeadline: registrationDeadline
          ? new Date(registrationDeadline)
          : null,
        status: status || "upcoming",
        isPublished: isPublished || false,
        isFeatured: isFeatured || false,
        targetAudience,
        requirements,
        agenda,
        speakers,
        tags: tags || [],
        contactEmail,
        contactPhone,
        createdBy,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
