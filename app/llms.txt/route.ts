import { NextResponse } from "next/server";
import {
  buildAbsoluteUrl,
  coreServices,
  defaultDescription,
  siteName,
} from "@/lib/seo";

export function GET() {
  const lines = [
    `# ${siteName}`,
    "",
    "Purpose:",
    defaultDescription,
    "",
    "Primary audience:",
    "- Students in middle school and high school",
    "- Parents seeking academic support",
    "- Families preparing for SAT, competitions, research, and college applications",
    "",
    "Core services:",
    ...coreServices.map((service) => `- ${service.name}: ${buildAbsoluteUrl(service.path)}`),
    "",
    "Important pages:",
    `- Home: ${buildAbsoluteUrl("/")}`,
    `- About: ${buildAbsoluteUrl("/about")}`,
    `- Blog: ${buildAbsoluteUrl("/blog")}`,
    `- Events: ${buildAbsoluteUrl("/events")}`,
    `- Contact: ${buildAbsoluteUrl("/contact")}`,
    `- Book a Consultation: ${buildAbsoluteUrl("/book-session")}`,
    "",
    "Contact:",
    "- Email: acharya.folsom@gmail.com",
    "- Phone: +1-209-920-7147",
  ];

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
