"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light-blue via-white to-brand-light-blue/50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-9xl font-bold text-brand-blue/20">404</h1>
          <h2 className="text-3xl font-bold text-text-dark">Page Not Found</h2>
          <p className="text-lg text-text-light">
            Sorry, we couldn&apos;t find the pages you&apos;re looking for. It
            might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button
              size="lg"
              className="bg-gradient-to-r from-brand-blue to-brand-teal hover:from-brand-blue/90 hover:to-brand-teal/90"
            >
              <Home className="mr-2 h-5 w-5" />
              Go Home
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            onClick={() => window.history.back()}
            className="border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
