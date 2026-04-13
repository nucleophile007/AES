import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mailer";
import { qstash } from "@/lib/qstash";
import { contactFormSchema } from "@/lib/validation/contact";

const CONTACT_NOTIFICATION_TO = process.env.CONTACT_NOTIFICATION_TO ?? "davk312@gmail.com";

function formatField(value: string | null | undefined) {
  return value && value.trim().length > 0 ? value : "Not provided";
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

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

    const preferredContact = parsed.data.preferredContact ?? "email";
    const appBaseUrl = (
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000"
    ).replace(/\/$/, "");

    let notificationEmailQueued = false;
    let notificationEmailSent = false;

    try {
      await qstash.publishJSON({
        url: `${appBaseUrl}/api/jobs/contact-notification`,
        body: {
          submissionId: submission.id,
          fullName: parsed.data.fullName,
          email: parsed.data.email,
          phone: parsed.data.phone,
          role: parsed.data.role,
          programInterest: parsed.data.programInterest,
          preferredContact,
          studentName: parsed.data.studentName,
          studentGrade: parsed.data.studentGrade,
          subject: parsed.data.subject,
          message: parsed.data.message,
        },
        retries: 3,
      });
      notificationEmailQueued = true;
    } catch (queueError) {
      console.error("Failed to queue contact email job:", queueError);

      const textBody = [
        "New contact form submission",
        `Submission ID: ${submission.id}`,
        `Full Name: ${parsed.data.fullName}`,
        `Email: ${parsed.data.email}`,
        `Phone: ${formatField(parsed.data.phone)}`,
        `Role: ${formatField(parsed.data.role)}`,
        `Program Interest: ${formatField(parsed.data.programInterest)}`,
        `Preferred Contact: ${preferredContact}`,
        `Student Name: ${formatField(parsed.data.studentName)}`,
        `Student Grade: ${formatField(parsed.data.studentGrade)}`,
        `Subject: ${parsed.data.subject}`,
        "Message:",
        parsed.data.message,
      ].join("\n");

      const htmlBody = `
        <div style="font-family:Segoe UI,Arial,sans-serif;line-height:1.5;">
          <h2>New contact form submission</h2>
          <p><strong>Submission ID:</strong> ${submission.id}</p>
          <p><strong>Full Name:</strong> ${escapeHtml(parsed.data.fullName)}</p>
          <p><strong>Email:</strong> ${escapeHtml(parsed.data.email)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(formatField(parsed.data.phone))}</p>
          <p><strong>Role:</strong> ${escapeHtml(formatField(parsed.data.role))}</p>
          <p><strong>Program Interest:</strong> ${escapeHtml(formatField(parsed.data.programInterest))}</p>
          <p><strong>Preferred Contact:</strong> ${escapeHtml(preferredContact)}</p>
          <p><strong>Student Name:</strong> ${escapeHtml(formatField(parsed.data.studentName))}</p>
          <p><strong>Student Grade:</strong> ${escapeHtml(formatField(parsed.data.studentGrade))}</p>
          <p><strong>Subject:</strong> ${escapeHtml(parsed.data.subject)}</p>
          <p><strong>Message:</strong></p>
          <pre style="white-space:pre-wrap;background:#f6f6f6;padding:12px;border-radius:8px;">${escapeHtml(parsed.data.message)}</pre>
        </div>
      `.trim();

      try {
        await sendMail({
          to: CONTACT_NOTIFICATION_TO,
          subject: `New Contact Form: ${parsed.data.subject}`,
          html: htmlBody,
          text: textBody,
          replyTo: parsed.data.email,
        });
        notificationEmailSent = true;
      } catch (emailError) {
        notificationEmailSent = false;
        console.error("Contact notification email fallback error:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      notificationEmailQueued,
      notificationEmailSent,
    });
  } catch (error) {
    console.error("Contact submission error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit contact form" },
      { status: 500 }
    );
  }
}
