import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./chat-no-spinner.css"; // CSS for hiding spinners for teachers
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { QueryProvider } from "./providers/query-provider";
import { AuthProvider } from "../contexts/AuthContext";
import Script from "next/script";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.example.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ACHARYA Educational Services",
    template: "%s | ACHARYA Educational Services",
  },
  description:
    "ACHARYA Educational Services (AES) offers academic tutoring, SAT coaching, math competition training, research programs, and college prep support for students across the USA.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "ACHARYA Educational Services",
    description:
      "Personalized tutoring, SAT prep, math competitions, research programs, and college counseling for motivated students.",
    siteName: "ACHARYA Educational Services",
  },
  twitter: {
    card: "summary_large_image",
    title: "ACHARYA Educational Services",
    description:
      "Personalized academic tutoring and SAT coaching to help students achieve their full potential.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        {/* Organization / EducationalOrganization structured data */}
        <Script
          id="aes-org-jsonld"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              name: "ACHARYA Educational Services",
              url: siteUrl,
              description:
                "ACHARYA Educational Services provides academic tutoring, SAT coaching, math competition training, research programs, and college preparation for students in the United States.",
              address: {
                "@type": "PostalAddress",
                addressCountry: "US",
              },
            }),
          }}
        />
        <AuthProvider>
          <QueryProvider>
            {children}
            <Toaster />
            <Sonner />
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
