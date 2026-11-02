"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ExternalLink, FileText, School } from "lucide-react";
import sccurLogo from "@/assets/sccur_logo_clear.png";

// SCCUR brand navy (sccur.org); orange accent is #ff7f00
const SCCUR_NAVY = "#253551";

interface SccurResearcher {
  firstName: string;
  lastName: string;
  grade: string;
  school: string;
  paper: string;
}

const researchers: SccurResearcher[] = [
  {
    firstName: "Atreya",
    lastName: "Kulkarni",
    grade: "Grade 12",
    school: "Vista del Lago High School",
    paper: "Thickness Prediction in Incremental Sheet Forming based on Material Movement",
  },
  {
    firstName: "Palash",
    lastName: "Vyas",
    grade: "Grade 12",
    school: "Vista del Lago High School",
    paper:
      "Drilling Data-Based Rock Strength Prediction from Multiple Wells at the Utah FORGE Site Using Machine Learning",
  },
  {
    firstName: "Saanvi",
    lastName: "Paithara",
    grade: "Grade 12",
    school: "Vista del Lago High School",
    paper: "AI-Based Error Detection and Performance Evaluation in Bharatanatyam Mudra Sequences",
  },
  {
    firstName: "Harshita",
    lastName: "Vallepalli",
    grade: "Grade 12",
    school: "Carmel High School, Carmel, IN",
    paper:
      "DDoS Attack Classification in Network Traffic via Bidirectional Long Short-Term Memory",
  },
];

// Decorative citrus slice, drawn in currentColor
function OrangeSlice({ className }: { className?: string }) {
  const segments = 8;
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <circle cx="50" cy="50" r="47" fill="none" stroke="currentColor" strokeWidth="4" />
      <circle cx="50" cy="50" r="40" fill="currentColor" opacity="0.35" />
      {Array.from({ length: segments }, (_, i) => {
        const a = (i * 2 * Math.PI) / segments;
        return (
          <line
            key={i}
            x1="50"
            y1="50"
            x2={50 + 40 * Math.cos(a)}
            y2={50 + 40 * Math.sin(a)}
            stroke="currentColor"
            strokeWidth="3"
          />
        );
      })}
      <circle cx="50" cy="50" r="5" fill="currentColor" />
    </svg>
  );
}

export function SccurSlide() {
  const [isVisible, setIsVisible] = useState(false);
  const [mobileIndex, setMobileIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      className="relative h-full w-full overflow-hidden text-white flex flex-col justify-between"
      style={{
        backgroundColor: SCCUR_NAVY,
        fontFamily: 'Inter, "Helvetica Neue", Helvetica, Arial, sans-serif',
      }}
    >
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:44px_44px]" />
      {/* Orange-slice ambient glow (echoes the SCCUR logo) */}
      <div className="pointer-events-none absolute -left-40 top-10 h-[28rem] w-[28rem] rounded-full bg-[#ff7f00]/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[#ff7f00]" />

      {/* ─── TOP SECTION: Congratulations + Event Identity ─── */}
      <div className="relative z-20 mx-auto flex w-full max-w-[1600px] flex-shrink-0 items-center justify-between gap-6 px-6 pt-24 pb-2 sm:px-10 md:px-20 lg:px-24 lg:pt-28 lg:pb-3">
        <div
          className={`min-w-0 transition-transform duration-700 ease-out motion-reduce:transition-none ${
            isVisible ? "translate-y-0" : "translate-y-4"
          }`}
        >
          <h1
            className="text-6xl font-black italic leading-[0.82] tracking-[0.01em] text-white sm:text-8xl lg:text-9xl"
            style={{ fontFamily: '"Brush Script MT", "Segoe Script", cursive' }}
          >
            Congratulations
          </h1>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-white/80 sm:mt-4 sm:text-base">
            Our student researchers are heading to <span className="text-[#ff7f00]">SDSU</span> for
          </p>
          <p className="mt-1 text-2xl font-extrabold italic leading-tight text-[#ff7f00] sm:text-4xl lg:text-5xl">
            2026 SCCUR Undergrad Conference
          </p>
          <a
            href="https://www.sccur.org/"
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 border-b-2 border-[#ff7f00] pb-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/90 transition-colors hover:text-[#ff7f00] sm:mt-3 sm:text-xs"
          >
            SCCUR · Nov 21, 2026 · San Diego <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <div
          className={`hidden w-[30%] max-w-[400px] shrink-0 self-start transition-transform duration-700 delay-150 ease-out motion-reduce:transition-none sm:block ${
            isVisible ? "translate-x-0" : "translate-x-6"
          }`}
        >
          <Image
            src={sccurLogo}
            alt="Southern California Conference for Undergraduate Research"
            priority
            className="h-auto w-full object-contain drop-shadow-md"
          />
        </div>
      </div>

      {/* ─── MOBILE TAB SELECTOR (< md) ─── */}
      <div className="relative z-20 mx-auto flex w-full max-w-[1600px] px-4 md:hidden mt-2 pb-2">
        <div className="flex w-full rounded-xl bg-white/10 p-1 backdrop-blur-sm border border-white/10">
          {researchers.map((r, i) => (
            <button
              key={r.firstName}
              type="button"
              onClick={() => setMobileIndex(i)}
              className={`flex-1 py-1.5 text-[11px] font-black uppercase tracking-wider rounded-lg transition-all ${
                mobileIndex === i
                  ? i % 2 === 0
                    ? "bg-[#162238] text-white shadow-md"
                    : "bg-[#ff7f00] text-[#162238] shadow-md"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {r.firstName}
            </button>
          ))}
        </div>
      </div>

      {/* ─── BOTTOM SECTION: 4 Researcher Cards (blue / orange alternating) ─── */}
      <div className="relative z-10 mx-auto grid w-full max-w-[1600px] flex-1 min-h-[300px] max-h-[430px] grid-cols-1 gap-4 px-6 mb-10 sm:px-10 sm:mb-12 md:grid-cols-4 md:px-20 lg:gap-5 lg:px-24">
        {researchers.map((r, i) => {
          const isOrange = i % 2 === 1;

          return (
            <article
              key={r.firstName}
              className={`group relative overflow-hidden flex-col rounded-3xl p-5 sm:p-6 shadow-2xl ring-1 transition-all duration-700 ease-out hover:-translate-y-1 motion-reduce:transition-none ${
                isOrange
                  ? "bg-gradient-to-br from-[#ff9124] via-[#ff7f00] to-[#f06d00] text-[#162238] ring-white/30 shadow-[#ff7f00]/20"
                  : "bg-gradient-to-br from-[#1f2f4d] via-[#1a2741] to-[#131d31] text-white ring-white/10 shadow-black/30"
              } ${mobileIndex === i ? "flex" : "hidden md:flex"} ${
                isVisible ? "translate-y-0" : "translate-y-6"
              }`}
              style={{ transitionDelay: `${150 + i * 80}ms` }}
            >
              {/* Orange-slice motif (echoes the SCCUR logo) */}
              <OrangeSlice
                className={`pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 transition-transform duration-700 group-hover:rotate-12 ${
                  isOrange ? "text-white/20" : "text-[#ff7f00]/20"
                }`}
              />

              {/* Monogram + grade */}
              <div className="relative z-10 flex items-center justify-between gap-3">
                <div
                  className={`flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full text-sm sm:text-base font-black ${
                    isOrange ? "bg-[#162238] text-[#ff9124]" : "bg-[#ff7f00] text-[#162238]"
                  }`}
                >
                  {r.firstName[0]}
                  {r.lastName[0]}
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${
                    isOrange ? "bg-[#162238]/10 text-[#162238]" : "bg-white/10 text-white/85"
                  }`}
                >
                  {r.grade}
                </span>
              </div>

              {/* Name + school */}
              <div className="relative z-10 mt-4">
                <h2 className="text-3xl sm:text-4xl lg:text-[2.4rem] font-black uppercase tracking-tight leading-none">
                  {r.firstName}
                </h2>
                <p className="mt-1 text-lg sm:text-xl font-bold leading-tight">{r.lastName}</p>
                <p
                  className={`mt-2 flex items-start gap-1.5 text-[11px] sm:text-xs font-semibold ${
                    isOrange ? "text-[#162238]/80" : "text-white/65"
                  }`}
                >
                  <School className="mt-px h-3.5 w-3.5 shrink-0" />
                  {r.school}
                </p>
              </div>

              {/* Research paper */}
              <div className="relative z-10 mt-auto pt-4">
                <div className={`mb-3 h-px w-full ${isOrange ? "bg-[#162238]/20" : "bg-white/10"}`} />
                <span
                  className={`flex items-center gap-1.5 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.16em] ${
                    isOrange ? "text-[#162238]/75" : "text-[#ff9d3d]"
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  Research Paper
                </span>
                <p className="mt-1.5 text-base sm:text-lg lg:text-[1.15rem] xl:text-xl font-bold leading-snug line-clamp-5">
                  {r.paper}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default SccurSlide;
