import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "About Us | ACHARYA Educational Services",
  description:
    "Learn about ACHARYA Educational Services, our mission, mentors, and commitment to student success in academic tutoring, SAT coaching, and research programs.",
  alternates: {
    canonical: "./",
  },
  openGraph: {
    title: "About Us | ACHARYA Educational Services",
    description:
      "Meet our team and discover how ACHARYA Educational Services supports students in achieving academic excellence and personal growth.",
    type: "website",
    url: "./",
  },
  twitter: {
    title: "About Us | ACHARYA Educational Services",
    description:
      "Learn about our mentors, mission, and educational philosophy at ACHARYA Educational Services.",
    card: "summary_large_image",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
