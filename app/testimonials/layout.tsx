import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Testimonials | ACHARYA Educational Services",
  description:
    "Read testimonials from students and parents about their experiences with ACHARYA Educational Services' tutoring, SAT coaching, and research programs.",
  alternates: {
    canonical: "./",
  },
  openGraph: {
    title: "Testimonials | ACHARYA Educational Services",
    description:
      "Discover how ACHARYA Educational Services has helped students achieve academic success through personalized support.",
    type: "website",
    url: "./",
  },
  twitter: {
    title: "Testimonials | ACHARYA Educational Services",
    description:
      "See what students and parents say about our tutoring, SAT prep, and research programs.",
    card: "summary_large_image",
  },
};

export default function TestimonialsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
