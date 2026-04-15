import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "AES Champions | ACHARYA Educational Services",
  description:
    "AES Champions prepares students for AMC, AIME, F=ma, MathCounts, and other elite competitions through structured coaching and mentorship.",
  alternates: {
    canonical: "./",
  },
  openGraph: {
    title: "AES Champions | ACHARYA Educational Services",
    description:
      "Competition-focused coaching for math and physics students who want to excel in Olympiad-style contests.",
    type: "website",
    url: "./",
  },
  twitter: {
    title: "AES Champions | ACHARYA Educational Services",
    description:
      "Build competition readiness with our structured Olympiad and F=ma training program.",
    card: "summary_large_image",
  },
};

export default function AESChampionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
