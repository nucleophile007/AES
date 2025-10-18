import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./chat-no-spinner.css"; // CSS for hiding spinners for teachers
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { QueryProvider } from "./providers/query-provider";
import { AuthProvider } from "../contexts/AuthContext";

export const metadata: Metadata = {
  title: "ACHARYA Educational Services",
  description:
    "Nurturing students' intuitive abilities and academic excellence",
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
