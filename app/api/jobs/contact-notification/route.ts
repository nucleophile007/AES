import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { sendMail } from "@/lib/mailer";

const CONTACT_NOTIFICATION_TO =
  process.env.CONTACT_NOTIFICATION_TO ?? "davk312@gmail.com";

function formatField(value: string | null | undefined) {
  return value && value.trim().length > 0 ? value : "Not provided";
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type ContactNotificationPayload = {
  submissionId: number;
  fullName: string;
  email: string;
  phone?: string;
  role?: string;
  programInterest?: string;
  preferredContact?: "email" | "phone" | "either";
  studentName?: string;
  studentGrade?: string;
  subject: string;
  message: string;
};

async function handler(request: Request) {
  try {
    const payload = (await request.json()) as ContactNotificationPayload;

    const preferredContact = payload.preferredContact ?? "email";

    const textBody = [
      "New contact form submission",
      `Submission ID: ${payload.submissionId}`,
      `Full Name: ${payload.fullName}`,
      `Email: ${payload.email}`,
      `Phone: ${formatField(payload.phone)}`,
      `Role: ${formatField(payload.role)}`,
      `Program Interest: ${formatField(payload.programInterest)}`,
      `Preferred Contact: ${preferredContact}`,
      `Student Name: ${formatField(payload.studentName)}`,
      `Student Grade: ${formatField(payload.studentGrade)}`,
      `Subject: ${payload.subject}`,
      "Message:",
      payload.message,
    ].join("\n");

    const htmlBody = `
      <div style="font-family:Segoe UI,Arial,sans-serif;line-height:1.5;">
        <h2>New contact form submission</h2>
        <p><strong>Submission ID:</strong> ${payload.submissionId}</p>
        <p><strong>Full Name:</strong> ${escapeHtml(payload.fullName)}</p>
        <p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(formatField(payload.phone))}</p>
        <p><strong>Role:</strong> ${escapeHtml(formatField(payload.role))}</p>
        <p><strong>Program Interest:</strong> ${escapeHtml(formatField(payload.programInterest))}</p>
        <p><strong>Preferred Contact:</strong> ${escapeHtml(preferredContact)}</p>
        <p><strong>Student Name:</strong> ${escapeHtml(formatField(payload.studentName))}</p>
        <p><strong>Student Grade:</strong> ${escapeHtml(formatField(payload.studentGrade))}</p>
        <p><strong>Subject:</strong> ${escapeHtml(payload.subject)}</p>
        <p><strong>Message:</strong></p>
        <pre style="white-space:pre-wrap;background:#f6f6f6;padding:12px;border-radius:8px;">${escapeHtml(payload.message)}</pre>
      </div>
    `.trim();

    await sendMail({
      to: CONTACT_NOTIFICATION_TO,
      subject: `New Contact Form: ${payload.subject}`,
      html: htmlBody,
      text: textBody,
      replyTo: payload.email,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Contact notification job failed:", error);
    return Response.json(
      { success: false, error: "Failed to send contact notification" },
      { status: 500 },
    );
  }
}

export const POST = verifySignatureAppRouter(handler);
