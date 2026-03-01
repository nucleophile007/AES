import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Student Research Programs | ACHARYA Educational Services",
  description:
    "High school and middle school research programs with PhD-level mentorship, publication guidance, and competition preparation to strengthen US college applications.",
  alternates: {
    canonical: "/researchprogram",
  },
  openGraph: {
    title: "Student Research Programs | ACHARYA Educational Services",
    description:
      "Work with expert mentors to design, execute, and present original research projects for college admissions, publications, and competitions.",
    type: "website",
    url: "/researchprogram",
  },
  twitter: {
    title: "Student Research Programs | ACHARYA Educational Services",
    description:
      "AES Explorers research programs help students build standout research profiles for top universities.",
    card: "summary_large_image",
  },
};

export default function ResearchProgramLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

