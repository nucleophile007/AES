import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Events | ACHARYA Educational Services",
  description:
    "See upcoming and past events, webinars, and workshops hosted by ACHARYA Educational Services for students and parents.",
  alternates: {
    canonical: "./",
  },
  openGraph: {
    title: "Events | ACHARYA Educational Services",
    description:
      "Join our educational events, webinars, and workshops to support student learning and growth.",
    type: "website",
    url: "./",
  },
  twitter: {
    title: "Events | ACHARYA Educational Services",
    description:
      "Stay updated on ACHARYA Educational Services events and learning opportunities.",
    card: "summary_large_image",
  },
};

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
