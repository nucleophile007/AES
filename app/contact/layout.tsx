import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Contact Us | ACHARYA Educational Services",
  description:
    "Contact ACHARYA Educational Services for academic tutoring, SAT coaching, research programs, and general inquiries. We're here to help students and parents.",
  alternates: {
    canonical: "./",
  },
  openGraph: {
    title: "Contact Us | ACHARYA Educational Services",
    description:
      "Get in touch with ACHARYA Educational Services for personalized academic support and program information.",
    type: "website",
    url: "./",
  },
  twitter: {
    title: "Contact Us | ACHARYA Educational Services",
    description:
      "Reach out to our team for questions about tutoring, SAT prep, or research programs.",
    card: "summary_large_image",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
