import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "College Prep | ACHARYA Educational Services",
  description:
    "College prep support for students planning their applications, extracurricular strategy, essays, and admissions timeline with ACHARYA Educational Services.",
  alternates: {
    canonical: "./",
  },
  openGraph: {
    title: "College Prep | ACHARYA Educational Services",
    description:
      "Strategic college admissions guidance for students aiming for strong applications and a clear roadmap to top universities.",
    type: "website",
    url: "./",
  },
  twitter: {
    title: "College Prep | ACHARYA Educational Services",
    description:
      "Plan essays, extracurriculars, and admissions timelines with our college prep support.",
    card: "summary_large_image",
  },
};

export default function CollegePrepLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
