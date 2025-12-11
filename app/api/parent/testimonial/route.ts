import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== "parent") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const content = typeof body.content === "string" ? body.content.trim() : "";
    const videoLink = typeof body.videoLink === "string" ? body.videoLink.trim() : null;

    if (!content || content.length < 10) {
      return NextResponse.json({ success: false, error: "Testimonial content must be at least 10 characters" }, { status: 400 });
    }

    // Find a student associated with this parent
    const student = await prisma.student.findFirst({
      where: {
        parentEmail: user.email,
        isActivated: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!student) {
      return NextResponse.json({ success: false, error: "No student found associated with this parent account" }, { status: 404 });
    }

    // Create testimonial
    const testimonial = await prisma.testimonial.create({
      data: {
        studentId: student.id,
        content,
        authorType: "parent",
        authorName: user.name ?? student.parentName ?? "Parent",
        videoLink: videoLink || null,
        isApproved: false,
        isVisible: false,
      },
      include: {
        Student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({ success: true, testimonial }, { status: 201 });
  } catch (error) {
    console.error("Error creating testimonial:", error);
    return NextResponse.json({ success: false, error: "Failed to create testimonial" }, { status: 500 });
  }
}


