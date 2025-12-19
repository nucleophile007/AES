import nodemailer from "nodemailer";

function getSmtpPort(): number {
  const raw = process.env.SMTP_PORT ?? "587";
  const port = Number(raw);
  if (!Number.isFinite(port)) {
    throw new Error("Invalid SMTP_PORT");
  }
  return port;
}

export function getTransporter() {
  const port = getSmtpPort();

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    // 465 = implicit TLS, 587 = STARTTLS
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

export async function sendMail(args: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}) {
  const transporter = getTransporter();

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: args.to,
    subject: args.subject,
    html: args.html,
    text: args.text,
    replyTo: args.replyTo,
  });
}
