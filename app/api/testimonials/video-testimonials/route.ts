import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/testimonials/video-testimonials - public list of visible video testimonials
export async function GET() {
  try {
    const videos = await prisma.videoTestimonial.findMany({
      where: { isVisible: true },
      select: {
        id: true,
        name: true,
        designation: true,
        program: true,
        description: true,
        videoUrl: true,
        mimeType: true,
      },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(
      { success: true, videos },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    );
  } catch (error) {
    console.error("Video Testimonials API error:", error);
    return NextResponse.json(
      { success: false, videos: [], error: "Failed to fetch video testimonials" },
      { status: 500 }
    );
  }
}
