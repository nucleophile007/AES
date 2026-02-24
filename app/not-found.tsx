"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Home, ArrowLeft, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen theme-bg-dark flex items-center justify-center relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-transparent to-yellow-400/10" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative max-w-2xl w-full mx-auto text-center space-y-8 px-4">
        {/* 404 Number */}
        <div className="relative">
          <h1 className="text-[180px] sm:text-[220px] font-bold text-slate-500/50 leading-none">
            404
          </h1>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h2 className="text-3xl sm:text-4xl font-bold theme-text-light">
            Page Not Found
          </h2>
          <p className="text-lg theme-text-muted max-w-lg mx-auto leading-relaxed">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It
            might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link href="/">
            <Button
              size="lg"
              className="bg-yellow-400 text-slate-900 hover:bg-yellow-500 font-medium px-8"
            >
              <Home className="mr-2 h-5 w-5" />
              Go Home
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            onClick={() => window.history.back()}
            className="border-slate-700 text-grey-900 hover:bg-slate-800 hover:text-white px-8"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Go Back
          </Button>
        </div>

        {/* Helpful Links */}
        <div className="pt-8 border-t border-slate-800">
          <p className="text-sm theme-text-muted mb-4">
            Looking for something? Try these:
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/research"
              className="text-sm px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg theme-text-light transition-colors"
            >
              Research
            </Link>
            <Link
              href="/events"
              className="text-sm px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg theme-text-light transition-colors"
            >
              Events
            </Link>
            <Link
              href="/about"
              className="text-sm px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg theme-text-light transition-colors"
            >
              About Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
