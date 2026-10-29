"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Microscope,
  Sparkles,
  Trophy,
} from "lucide-react";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

interface Program {
  id: string;
  number: string;
  title: string;
  badge: string;
  tagline: string;
  description: string;
  ctaText: string;
  href: string;
  image: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Same badge palette as the Student Spotlights slide. */
  accent: { badge: string; tagline: string };
}

const PROGRAMS: Program[] = [
  {
    id: "tutoring",
    number: "01",
    title: "Academic Tutoring",
    badge: "1-on-1 Mastery",
    tagline: "Learn. Understand. Succeed.",
    description: "Personalized coaching in Math, Sciences, and Humanities.",
    ctaText: "Explore Tutoring",
    href: "/academictutoring",
    image: "/program-image/acharyaes-academic-hero.jpg",
    icon: BookOpen,
    accent: {
      badge: "bg-amber-50 border-amber-300 text-amber-800",
      tagline: "text-amber-900",
    },
  },
  {
    id: "explorers",
    number: "02",
    title: "AES Explorers",
    badge: "Research Mentorship",
    tagline: "Explore. Discover. Innovate.",
    description: "Faculty-guided research, presented at IEEE MIT URTC.",
    ctaText: "Explore Research",
    href: "/aes-explorers",
    image: "/program-image/acharyaes-research-hero.jpg",
    icon: Microscope,
    accent: {
      badge: "bg-sky-50 border-sky-300 text-[#073b6b]",
      tagline: "text-[#073b6b]",
    },
  },
  {
    id: "achieve",
    number: "03",
    title: "UAchieve",
    badge: "College Admissions",
    tagline: "Prepare Today. Achieve Tomorrow.",
    description: "Admissions strategy for Tier-1 and Ivy League schools.",
    ctaText: "Explore College Prep",
    href: "/collegeprep",
    image: "/program-image/acharyaes-college-hero.jpg",
    icon: GraduationCap,
    accent: {
      badge: "bg-emerald-50 border-emerald-300 text-emerald-800",
      tagline: "text-emerald-900",
    },
  },
  {
    id: "champions",
    number: "04",
    title: "AES Champions",
    badge: "STEM & Olympiads",
    tagline: "Think. Solve. Excel.",
    description: "Coaching for AMC, AIME, USACO, and USABO.",
    ctaText: "Explore Competitions",
    href: "/aes-champions",
    image: "/program-image/acharyaes-math-hero.jpg",
    icon: Trophy,
    accent: {
      badge: "bg-rose-50 border-rose-300 text-rose-800",
      tagline: "text-rose-900",
    },
  },
];

const numberShadow = { textShadow: "0 8px 20px rgba(7, 59, 107, 0.55)" };

export function AnimatedProgramsHeroSlide() {
  return (
    <section
      className="relative h-full w-full overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #b4d2f7 0%, #b4d2f7 35%, #a8c8ec 65%, #94b9e4 100%)",
      }}
      aria-label="ACHARYA programs"
    >
      {/* Blueprint grid + ambient light (shared with the other hero slides) */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(7,59,107,0.04)_1px,transparent_1px),linear-gradient(180deg,rgba(7,59,107,0.04)_1px,transparent_1px)] bg-[size:44px_44px]" />
      <div className="pointer-events-none absolute -right-24 -top-10 h-[450px] w-[450px] rounded-full bg-blue-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-0 h-[450px] w-[450px] rounded-full bg-indigo-500/20 blur-3xl" />

      <div className="relative mx-auto flex h-full w-full max-w-[1600px] flex-col px-5 pt-24 pb-6 sm:px-10 sm:pt-28 lg:px-24 lg:pb-12">
        {/* ─── Heading ─── */}
        <motion.div
          className="flex flex-shrink-0 flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: EASE_OUT }}
        >
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-800 shadow-sm sm:text-[12px]">
              <Sparkles className="h-3.5 w-3.5 animate-pulse text-amber-500" />
              ACHARYA Programs
            </span>
            <h2 className="mt-2 text-4xl font-black leading-[1.05] tracking-tight text-slate-900 sm:text-5xl xl:text-[56px]">
              Our Programs
            </h2>
            <p className="mt-1 font-serif text-lg font-semibold italic text-[#073b6b] sm:text-xl xl:text-2xl">
              Four Pathways to Excellence
            </p>
          </div>

          <Link
            href="/book-session"
            className="group hidden items-center gap-2 rounded-full bg-[#073b6b] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#073b6b]/25 transition-colors hover:bg-[#0a4d8c] lg:inline-flex"
          >
            Book a Free Session
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div>

        {/* ─── Mobile / tablet: compact list ─── */}
        <ul className="mx-auto mt-5 flex w-full max-w-2xl flex-1 flex-col justify-center gap-3 xl:hidden">
          {PROGRAMS.map((p, i) => (
            <motion.li
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.08, ease: EASE_OUT }}
            >
              <Link
                href={p.href}
                className="flex items-center gap-3.5 rounded-2xl border border-slate-200 bg-white p-2.5 pr-4 shadow-[0_12px_28px_-18px_rgba(7,59,107,0.45)]"
              >
                <div className="relative h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-xl">
                  <Image src={p.image} alt="" fill sizes="72px" className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#073b6b]/70 to-transparent" />
                  <span
                    className="absolute bottom-0.5 left-1.5 text-xl font-black text-white"
                    style={numberShadow}
                  >
                    {p.number}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[17px] font-extrabold leading-tight tracking-tight text-[#0f172a]">
                    {p.title}
                  </h3>
                  <p className={`mt-0.5 text-[13px] font-medium italic leading-snug ${p.accent.tagline}`}>
                    {p.tagline}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 flex-shrink-0 text-[#073b6b]" />
              </Link>
            </motion.li>
          ))}
        </ul>

        {/* ─── Desktop: four cards ─── */}
        <ul className="mt-8 hidden min-h-0 flex-1 grid-cols-4 gap-5 xl:grid 2xl:gap-6">
          {PROGRAMS.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.li
                key={p.id}
                className="min-h-0"
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.25 + i * 0.1, ease: EASE_OUT }}
              >
                <Link
                  href={p.href}
                  className="group flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-3 shadow-[0_24px_48px_-24px_rgba(7,59,107,0.45)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_32px_56px_-24px_rgba(7,59,107,0.55)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#073b6b]"
                >
                  {/* Photo with spotlight-style number */}
                  <div className="relative min-h-[110px] flex-1 overflow-hidden rounded-2xl">
                    <Image
                      src={p.image}
                      alt=""
                      fill
                      priority={i < 2}
                      sizes="(min-width: 1600px) 340px, 25vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#073b6b]/75 via-[#073b6b]/10 to-transparent" />
                    <span
                      className="absolute bottom-2 left-4 text-5xl font-black leading-none text-white xl:text-6xl"
                      style={numberShadow}
                    >
                      {p.number}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="flex flex-shrink-0 flex-col px-2 pt-4 pb-1 xl:px-3">
                    <span
                      className={`inline-flex items-center gap-1.5 self-start rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ${p.accent.badge}`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {p.badge}
                    </span>
                    <h3 className="mt-3 text-xl font-extrabold leading-tight tracking-tight text-[#0f172a] 2xl:text-2xl">
                      {p.title}
                    </h3>
                    <p className={`mt-1 min-h-[2.75em] text-[13px] font-medium italic leading-snug ${p.accent.tagline}`}>
                      {p.tagline}
                    </p>
                    <p className="mt-1 min-h-[2.75em] text-sm font-medium leading-snug text-slate-600 line-clamp-2 [@media(max-height:760px)]:hidden">
                      {p.description}
                    </p>
                    <span className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-sm font-bold text-[#073b6b]">
                      {p.ctaText}
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#073b6b] text-white transition-transform duration-300 group-hover:translate-x-0.5">
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </span>
                  </div>
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export default AnimatedProgramsHeroSlide;
