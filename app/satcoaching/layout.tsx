import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "SAT Coaching | ACHARYA Educational Services",
  description:
    "Personalized SAT coaching for high school students across the USA, with full-length mocks, targeted practice, and expert strategy.",
  alternates: {
    canonical: "/satcoaching",
  },
  openGraph: {
    title: "SAT Coaching | ACHARYA Educational Services",
    description:
      "Score-boosting SAT prep with structured lessons, diagnostics, and individualized feedback.",
    type: "website",
    url: "/satcoaching",
  },
  twitter: {
    title: "SAT Coaching | ACHARYA Educational Services",
    description:
      "Online and in-person SAT tutoring to help students hit their target scores.",
    card: "summary_large_image",
  },
};

export default function SATCoachingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

