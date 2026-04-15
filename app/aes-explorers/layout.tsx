import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "AES Explorers | ACHARYA Educational Services",
  description:
    "AES Explorers is our research mentorship program for students in engineering, pre-med, law, social sciences, and business tracks.",
  alternates: {
    canonical: "./",
  },
  openGraph: {
    title: "AES Explorers | ACHARYA Educational Services",
    description:
      "Explore research mentorship, publication pathways, and academic growth through our flagship student research program.",
    type: "website",
    url: "./",
  },
  twitter: {
    title: "AES Explorers | ACHARYA Educational Services",
    description:
      "Join a research pathway designed to help students build original work and academic confidence.",
    card: "summary_large_image",
  },
};

export default function AESExplorersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
