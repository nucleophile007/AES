import { sendMail } from "@/lib/mailer";

export type NotificationRecipient = {
  email?: string | null;
  name?: string | null;
};

export function escapeEmailHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] || character);
}

export function uniqueRecipients(recipients: NotificationRecipient[]): Array<{ email: string; name: string }> {
  const unique = new Map<string, { email: string; name: string }>();
  for (const recipient of recipients) {
    const email = recipient.email?.trim().toLowerCase();
    if (email && !unique.has(email)) {
      unique.set(email, { email, name: recipient.name?.trim() || "there" });
    }
  }
  return Array.from(unique.values());
}

export function parentAssignmentEmailsEnabled(): boolean {
  return process.env.EMAIL_PARENTS_ON_ASSIGNMENTS !== "false";
}

export async function sendAcademicNotification(args: {
  recipients: NotificationRecipient[];
  subject: string;
  heading: string;
  message: string;
  details?: Array<{ label: string; value?: string | null }>;
  actionLabel?: string;
  actionUrl?: string;
  replyTo?: string | null;
}): Promise<{ attempted: number; sent: number; failed: number }> {
  const recipients = uniqueRecipients(args.recipients);
  const details = (args.details || []).filter((detail) => detail.value);

  const results = await Promise.allSettled(recipients.map((recipient) => {
    const detailText = details.map((detail) => `${detail.label}: ${detail.value}`).join("\n");
    const text = [
      `Hi ${recipient.name},`,
      "",
      args.message,
      detailText,
      args.actionUrl ? `${args.actionLabel || "View details"}: ${args.actionUrl}` : "",
    ].filter(Boolean).join("\n\n");

    const detailHtml = details.length > 0
      ? `<div style="margin:20px 0;padding:16px;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0">${details.map((detail) => `<p style="margin:6px 0"><strong>${escapeEmailHtml(detail.label)}:</strong> ${escapeEmailHtml(detail.value || "")}</p>`).join("")}</div>`
      : "";
    const actionHtml = args.actionUrl
      ? `<p style="margin:24px 0"><a href="${escapeEmailHtml(args.actionUrl)}" style="display:inline-block;padding:11px 18px;border-radius:8px;background:#facc15;color:#0f172a;text-decoration:none;font-weight:700">${escapeEmailHtml(args.actionLabel || "View details")}</a></p>`
      : "";

    return sendMail({
      to: recipient.email,
      subject: args.subject,
      replyTo: args.replyTo || undefined,
      text,
      html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:640px;margin:auto"><p>Hi ${escapeEmailHtml(recipient.name)},</p><h2 style="margin:12px 0;color:#0f172a">${escapeEmailHtml(args.heading)}</h2><p>${escapeEmailHtml(args.message)}</p>${detailHtml}${actionHtml}<p style="margin-top:28px;color:#64748b;font-size:13px">ACHARYA Educational Services</p></div>`,
    });
  }));

  const sent = results.filter((result) => result.status === "fulfilled").length;
  return { attempted: results.length, sent, failed: results.length - sent };
}

export function getApplicationUrl(path: string): string | undefined {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (!baseUrl) return undefined;
  return `${baseUrl.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}
