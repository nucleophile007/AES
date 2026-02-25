import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Math Competition Training | ACHARYA Educational Services",
  description:
    "Prepare for AMC 8/10/12, AIME, MathCounts and other competitive math contests with structured problem-solving coaching and expert guidance.",
  alternates: {
    canonical: "/mathcompetition",
  },
  openGraph: {
    title: "Math Competition Training | ACHARYA Educational Services",
    description:
      "Competition-focused math coaching to help motivated students excel in US math contests and olympiads.",
    type: "website",
    url: "/mathcompetition",
  },
  twitter: {
    title: "Math Competition Training | ACHARYA Educational Services",
    description:
      "Advanced problem-solving training for AMC, AIME, MathCounts and more.",
    card: "summary_large_image",
  },
};

export default function MathCompetitionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

