"use client";

import React from "react";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import Chatbot from "@/components/home/Chatbot";
import Link from "next/link";
import { ArrowUpRight, Calendar, Clock3 } from "lucide-react";

interface Student {
  id: number;
  name: string;
  grade: string | null;
  schoolName: string | null;
}

interface Spotlight {
  id: number;
  title: string;
  summary: string;
  link: string;
  studentPhoto: string | null;
  publicationYear: number;
  publicationMonth: number;
  Student: Student | null;
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const cardGradients = [
  "from-sky-500 via-blue-500 to-indigo-600",
  "from-emerald-500 via-teal-500 to-cyan-600",
  "from-orange-500 via-amber-500 to-yellow-500",
  "from-fuchsia-500 via-pink-500 to-rose-500",
  "from-violet-500 via-purple-500 to-indigo-500",
  "from-cyan-500 via-sky-500 to-blue-600",
];

const placeholderSpotlights: Spotlight[] = [];

function SpotlightCard({ spotlight, index }: { spotlight: Spotlight; index: number }) {
  const studentName = spotlight.Student?.name || "AES Student";
  const dateLabel = `${MONTH_NAMES[Math.max(0, spotlight.publicationMonth - 1)]} ${spotlight.publicationYear}`;
  const estimatedRead = Math.max(1, Math.round((spotlight.summary?.length || 120) / 180));
  const previewText = spotlight.summary?.trim() || "Read this student story from our learning community.";
  const fallbackGradient = cardGradients[index % cardGradients.length];

  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-700/40 bg-slate-900/30 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-yellow-400/40 hover:shadow-[0_10px_30px_rgba(250,204,21,0.12)]">
      <div className="relative h-52 overflow-hidden bg-slate-900/70">
        {spotlight.studentPhoto ? (
          <img
            src={spotlight.studentPhoto}
            alt={studentName}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className={`h-full w-full bg-gradient-to-br ${fallbackGradient} opacity-90`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
      </div>

      <div className="space-y-3 p-5">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-yellow-400">
          <span>Student Spotlights</span>
          <span className="flex items-center gap-1 text-slate-400 normal-case tracking-normal">
            <Clock3 className="h-3.5 w-3.5" />
            {estimatedRead} min read
          </span>
        </div>

        <h2 className="line-clamp-2 text-lg font-bold theme-text-light">{spotlight.title}</h2>
        <p className="line-clamp-2 text-sm leading-6 theme-text-muted">{previewText}</p>

        <div className="flex items-center justify-between pt-1">
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
            <Calendar className="h-3.5 w-3.5" />
            {dateLabel}
          </span>
          {spotlight.link !== "#" ? (
            <a
              href={spotlight.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-semibold text-yellow-400 transition-colors hover:text-yellow-300"
            >
              Read
              <ArrowUpRight className="h-4 w-4" />
            </a>
          ) : (
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500">
              Coming soon
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export default function StudentSpotlightsPage() {
  const spotlights = placeholderSpotlights;

  return (
    <main className="min-h-screen theme-bg-dark flex flex-col">
      <Header />

      <section className="relative overflow-hidden theme-bg-medium border-b border-yellow-400/10 pt-20 sm:pt-24">
        <div className="absolute inset-0 pointer-events-none">
          <svg
            className="absolute inset-0 h-full w-full text-yellow-400/15"
            viewBox="0 0 1200 420"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <pattern id="spotlight-contour" width="180" height="180" patternUnits="userSpaceOnUse">
                <path d="M0 90 C 45 60, 90 60, 180 90" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M0 120 C 45 90, 90 90, 180 120" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.7" />
                <path d="M0 60 C 45 30, 90 30, 180 60" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#spotlight-contour)" />
          </svg>
        </div>

        <div className="relative mx-auto flex w-full max-w-6xl items-center justify-between gap-8 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="max-w-3xl">
            <nav aria-label="Breadcrumb" className="mb-4">
              <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm theme-text-muted">
                <li>
                  <Link href="/blog" className="hover:underline hover:text-yellow-400 transition-colors">
                    Acharya Blog
                  </Link>
                </li>
                <li className="opacity-60">/</li>
                <li className="text-yellow-400 font-semibold">Student Spotlights</li>
              </ol>
            </nav>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-yellow-400 tracking-tight leading-tight drop-shadow-sm">
              Student Spotlights
            </h1>
            <p className="mt-4 text-lg sm:text-xl theme-text-muted max-w-2xl">
              Wondering what it&apos;s like to do a Acharya project? Hear directly from our students about their research journeys and passions.
            </p>

            {/* <div className="mt-6">
              <Link
                href="/blog"
                className="inline-flex items-center rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-sm font-semibold text-yellow-300 transition hover:bg-yellow-400/20"
              >
                Back to Blog
              </Link>
            </div> */}
          </div>

          {/* <div className="hidden lg:block">
            <Image
              src="/spotlight.png"
              alt="Student spotlight illustration"
              width={320}
              height={320}
              className="h-[240px] w-[240px] object-contain"
              priority
            />
          </div> */}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12 flex-1">
        {spotlights.length === 0 ? (
          <div className="rounded-2xl border border-slate-700/40 bg-slate-900/30 p-8 text-center theme-text-muted">
            No student spotlights are available yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {spotlights.map((spotlight, index) => (
              <SpotlightCard key={spotlight.id} spotlight={spotlight} index={index} />
            ))}
          </div>
        )}
      </section>

      <Footer />
      <Chatbot />
    </main>
  );
}