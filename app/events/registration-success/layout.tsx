import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Registration Successful | ACHARYA Educational Services",
  description:
    "Your event registration is complete. Thanks for registering with ACHARYA Educational Services.",
  alternates: {
    canonical: "./",
  },
  openGraph: {
    title: "Registration Successful | ACHARYA Educational Services",
    description:
      "Your registration is complete. Check your email for event details and next steps.",
    type: "website",
    url: "./",
  },
  twitter: {
    title: "Registration Successful | ACHARYA Educational Services",
    description:
      "Your event registration has been received successfully.",
    card: "summary_large_image",
  },
};

export default function RegistrationSuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
