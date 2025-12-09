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
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const rating = typeof body.rating === "number" ? body.rating : null;

    if (!message || message.length < 5) {
      return NextResponse.json({ success: false, error: "Message too short" }, { status: 400 });
    }

    const fb = await prisma.feedback.create({
      data: {
        parentId: user.id,
        parentName: user.name ?? "",
        parentEmail: user.email ?? "",
        message,
        rating,
      },
    });

    return NextResponse.json({ success: true, feedback: fb }, { status: 201 });
  } catch (error) {
    console.error("Error creating feedback:", error);
    return NextResponse.json({ success: false, error: "Failed to create feedback" }, { status: 500 });
  }
}
