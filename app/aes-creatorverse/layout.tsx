import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "AES Creatorverse | ACHARYA Educational Services",
  description:
    "AES Creatorverse helps students build creative, leadership, and digital communication skills through writing, speaking, and community engagement.",
  alternates: {
    canonical: "./",
  },
  openGraph: {
    title: "AES Creatorverse | ACHARYA Educational Services",
    description:
      "Creative profile-building for students interested in writing, speaking, leadership, and digital content creation.",
    type: "website",
    url: "./",
  },
  twitter: {
    title: "AES Creatorverse | ACHARYA Educational Services",
    description:
      "Develop a strong personal brand and community presence through our creative profile-building program.",
    card: "summary_large_image",
  },
};

export default function AESCreatorverseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
