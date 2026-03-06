import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const rows = await prisma.testimonial.findMany({
      where: {
        beforeAfterApproved: true,
        beforeExpectations: {
          not: null,
        },
        afterChanges: {
          not: null,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!rows.length) {
      return NextResponse.json({
        success: true,
        story: null,
      });
    }

    // Pick random story
    const random =
      rows[Math.floor(Math.random() * rows.length)];

    return NextResponse.json({
      success: true,
      story: {
        studentName: random.studentName,
        before: random.beforeExpectations,
        after: random.afterChanges,
        school: random.school,
        grade: random.grade,
      },
    });
  } catch (error) {
    console.error("BeforeAfter API error:", error);
    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
