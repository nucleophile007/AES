"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import Chatbot from "@/components/home/Chatbot";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Calendar, Mail, ArrowRight, Loader2 } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const registrationId = searchParams.get("id");

  return (
    <div className="max-w-2xl w-full">
      {/* Success Card */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 md:p-12 text-center">
        {/* Success Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500/50 mb-6">
          <CheckCircle2 className="h-10 w-10 text-green-400" />
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-4">
          Registration Successful!
        </h1>

        {/* Description */}
        <p className="text-lg text-gray-300 mb-6">
          Thank you for registering for our event. We&apos;re excited to have you join us!
        </p>

        {registrationId && (
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-400 mb-1">Registration ID</p>
            <p className="text-xl font-mono font-semibold text-yellow-400">
              #{registrationId}
            </p>
          </div>
        )}

        {/* Info Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-left">
          <div className="bg-slate-900/30 border border-slate-700/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-yellow-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-200 mb-1">Check Your Email</h3>
                <p className="text-sm text-gray-400">
                  A confirmation email has been sent to your registered email address with event details.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/30 border border-slate-700/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-yellow-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-200 mb-1">Save the Date</h3>
                <p className="text-sm text-gray-400">
                  Add this event to your calendar and arrive 15 minutes early for check-in.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            size="lg"
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold"
          >
            <Link href="/events">
              <Calendar className="mr-2 h-5 w-5" />
              View All Events
            </Link>
          </Button>

          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-yellow-400/30 hover:border-yellow-400/50 text-yellow-400"
          >
            <Link href="/">
              <ArrowRight className="mr-2 h-5 w-5" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-400">
          Need help? Contact us at{" "}
          <a href="mailto:info@acharyaes.com" className="text-yellow-400 hover:underline">
            info@acharyaes.com
          </a>
        </p>
      </div>
    </div>
  );
}

export default function RegistrationSuccessPage() {
  return (
    <main className="min-h-screen theme-bg-dark flex flex-col">
      <Header />
      
      <div className="flex-grow pt-20 flex items-center justify-center px-4">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
            </div>
          }
        >
          <SuccessContent />
        </Suspense>
      </div>

      <Footer />
      <Chatbot />
    </main>
  );
}
