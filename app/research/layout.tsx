import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Student Research | ACHARYA Educational Services",
  description:
    "Explore student research opportunities, mentorship, and publication support at ACHARYA Educational Services.",
  alternates: {
    canonical: "./",
  },
  openGraph: {
    title: "Student Research | ACHARYA Educational Services",
    description:
      "Learn about our research programs and how students can participate in original research projects.",
    type: "website",
    url: "./",
  },
  twitter: {
    title: "Student Research | ACHARYA Educational Services",
    description:
      "Discover research mentorship and publication opportunities for students at ACHARYA.",
    card: "summary_large_image",
  },
};

export default function ResearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
