"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { ParallaxHeroImages } from "@/components/ui/parallax-hero-images";

const HERO_IMAGES = [
  {
    src: "/program-image/acharyaes-academic-hero.jpg",
    href: "/academictutoring",
    alt: "Academic tutoring program",
    label: "Academic Tutoring",
  },
  {
    src: "/program-image/acharyaes-research-hero.jpg",
    href: "/aes-explorers",
    alt: "Research program",
    label: "AES Explorers",
  },
  {
    src: "/program-image/acharyaes-math-hero.jpg",
    href: "/mathcompetition",
    alt: "Math competition program",
    label: "AES Champions",
  },
  {
    src: "/program-image/acharyaes-college-hero.jpg",
    href: "/collegeprep",
    alt: "College prep program",
    label: "UAchieve",
  },
];

export function ParallaxProgramsHero() {
  return (
    <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden theme-bg-dark">
      <ParallaxHeroImages images={HERO_IMAGES} />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0b0f1f]/60 via-[#0b0f1f]/40 to-[#0b0f1f]/85" />

      <div className="relative z-20 mx-auto flex w-full max-w-4xl flex-col items-center gap-5 px-6 text-center">
        <span className="inline-flex items-center rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-1.5 text-sm font-semibold text-yellow-300">
          Four pathways. One AcharyaES.
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-blue-200 drop-shadow-[0_4px_20px_rgba(59,130,246,0.35)] md:text-4xl">
          Discover our programs
        </h1>
        <p className="max-w-2xl text-sm text-slate-200/80 md:text-base">
          Explore tutoring, research, competition prep, and admissions guidance with structured pathways and mentor support.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link href="/book-session">
            <Button
              size="lg"
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 hover:from-yellow-300 hover:to-yellow-400 text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold w-full sm:w-auto"
            >
              Book Free Session Now
              <Calendar className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default ParallaxProgramsHero;
