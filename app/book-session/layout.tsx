import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Book a Free Consultation | ACHARYA Educational Services",
  description:
    "Schedule a free discovery session to explore academic tutoring, SAT coaching, math competition training, and student research programs tailored to your goals.",
  alternates: {
    canonical: "./",
  },
  openGraph: {
    title: "Book a Free Consultation | ACHARYA Educational Services",
    description:
      "Connect with AES mentors to design a personalized learning or test-prep plan for your student.",
    type: "website",
    url: "./",
  },
  twitter: {
    title: "Book a Free Consultation | ACHARYA Educational Services",
    description:
      "Talk with our team to plan tutoring, SAT prep, competitions, or research programs.",
    card: "summary_large_image",
  },
};

export default function BookSessionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

