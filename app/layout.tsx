import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { QueryProvider } from "./providers/query-provider";

export const metadata: Metadata = {
  title: "ACHARYA Educational Services",
  description:
    "Nurturing students' intuitive abilities and academic excellence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        <QueryProvider>
          {children}
          <Toaster />
          <Sonner />
        </QueryProvider>
      </body>
    </html>
  );
}
