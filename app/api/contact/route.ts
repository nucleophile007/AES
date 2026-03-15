import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactFormSchema } from "@/lib/validation/contact";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = contactFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid contact form submission",
          issues: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      ?? request.headers.get("x-real-ip")
      ?? undefined;
    const userAgent = request.headers.get("user-agent") ?? undefined;

    const submission = await prisma.contactSubmission.create({
      data: {
        fullName: parsed.data.fullName,
        email: parsed.data.email,
        phone: parsed.data.phone,
        role: parsed.data.role,
        programInterest: parsed.data.programInterest,
        subject: parsed.data.subject,
        message: parsed.data.message,
        preferredContact: parsed.data.preferredContact ?? "email",
        studentName: parsed.data.studentName,
        studentGrade: parsed.data.studentGrade,
        ipAddress,
        userAgent,
      },
    });

    return NextResponse.json({ success: true, submissionId: submission.id });
  } catch (error) {
    console.error("Contact submission error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit contact form" },
      { status: 500 }
    );
  }
}
