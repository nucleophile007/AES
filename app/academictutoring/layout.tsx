import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Academic Tutoring | ACHARYA Educational Services",
  description:
    "Personalized academic tutoring in math, science, and AP courses for middle and high school students. Improve grades, build strong foundations, and gain confidence.",
  alternates: {
    canonical: "/academictutoring",
  },
  openGraph: {
    title: "Academic Tutoring | ACHARYA Educational Services",
    description:
      "1:1 and small-group academic tutoring in mathematics, physics, chemistry, and biology for middle and high school students.",
    type: "website",
    url: "/academictutoring",
  },
  twitter: {
    title: "Academic Tutoring | ACHARYA Educational Services",
    description:
      "Expert academic tutoring to help students raise grades and master core subjects.",
    card: "summary_large_image",
  },
};

export default function AcademicTutoringLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

