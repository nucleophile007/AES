import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./chat-no-spinner.css"; // CSS for hiding spinners for teachers
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { QueryProvider } from "./providers/query-provider";
import { AuthProvider } from "../contexts/AuthContext";
import {
  buildAbsoluteUrl,
  coreServices,
  defaultDescription,
  defaultOgImage,
  getSiteUrl,
  siteName,
} from "@/lib/seo";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  keywords: [
    "academic tutoring usa",
    "sat coaching",
    "math competition training",
    "student research program",
    "college prep counseling",
    "online tutoring",
    "acharya educational services",
  ],
  category: "education",
  alternates: {
    canonical: "./",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "./",
    title: siteName,
    description: defaultDescription,
    siteName,
    images: [
      {
        url: buildAbsoluteUrl(defaultOgImage),
        width: 1200,
        height: 630,
        alt: `${siteName} learning programs`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: defaultDescription,
    images: [buildAbsoluteUrl(defaultOgImage)],
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
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "EducationalOrganization",
        "@id": `${siteUrl}#organization`,
        name: siteName,
        url: siteUrl,
        logo: buildAbsoluteUrl("/favicon.ico"),
        description: defaultDescription,
        email: "acharya.folsom@gmail.com",
        telephone: "+1-209-920-7147",
        address: {
          "@type": "PostalAddress",
          addressCountry: "US",
        },
        areaServed: "US",
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}#website`,
        url: siteUrl,
        name: siteName,
        description: defaultDescription,
        publisher: {
          "@id": `${siteUrl}#organization`,
        },
      },
      {
        "@type": "ItemList",
        "@id": `${siteUrl}#core-services`,
        name: "Core student services",
        itemListElement: coreServices.map((service, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: service.name,
          url: buildAbsoluteUrl(service.path),
        })),
      },
    ],
  };

  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        <script
          id="aes-org-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
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
