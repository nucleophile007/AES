import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "US Tutoring & SAT Coaching Locations | ACHARYA Educational Services",
  description:
    "Learn how ACHARYA Educational Services supports students across the USA, with strong presence in California, Texas, New York and beyond.",
  alternates: {
    canonical: "/locations",
  },
  openGraph: {
    title: "US Tutoring & SAT Coaching Locations | ACHARYA Educational Services",
    description:
      "Online and in-person tutoring, SAT coaching, math competition training, and research programs for students across key US regions.",
    type: "website",
    url: "/locations",
  },
  twitter: {
    title: "US Tutoring & SAT Coaching Locations | ACHARYA Educational Services",
    description:
      "See how AES serves students across the United States through regional and online programs.",
    card: "summary_large_image",
  },
};

export default function LocationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

