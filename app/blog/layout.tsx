import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Education Blog & Insights | ACHARYA Educational Services",
  description:
    "Articles, tips, and stories on SAT prep, academic tutoring, research, and college admissions from the ACHARYA Educational Services team.",
  alternates: {
    canonical: "./",
  },
  openGraph: {
    title: "Education Blog & Insights | ACHARYA Educational Services",
    description:
      "Explore insights on test prep, academics, competitions, and research to support students and families.",
    type: "website",
    url: "./",
  },
  twitter: {
    title: "Education Blog & Insights | ACHARYA Educational Services",
    description:
      "Guides and stories about SAT prep, tutoring, competitions, and research programs.",
    card: "summary_large_image",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

