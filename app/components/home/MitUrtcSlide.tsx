"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ExternalLink, FileText, Maximize2, School, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import mitUrtcLogo from "@/assets/mit_urtc_clear.png";

interface LightboxData {
  src: string;
  altSrc?: string;
  altLabel?: string;
  title: string;
  student: string;
  topic: string;
  paper: string;
  school: string;
}

type ResearcherKey = "soham" | "pragna";

interface UrtcResearcher {
  key: ResearcherKey;
  firstName: string;
  lastName: string;
  school: string;
  domain: string;
  topic: string;
  paper: string;
  badge: string;
  photoAlt: string;
  lightbox: LightboxData;
}

const researchers: UrtcResearcher[] = [
  {
    key: "soham",
    firstName: "Soham",
    lastName: "Daterao",
    school: "Great Oak High School, CA",
    domain: "Mech",
    topic: "Piezoelectric Energy Harvesting",
    paper: "Dynamic Analysis of L-Shaped & U-Shaped Piezoelectric Harvesters",
    badge: "URTC '26",
    photoAlt: "Soham Daterao with mentor at IEEE MIT URTC",
    lightbox: {
      src: "/gallery/g3.jpeg",
      altSrc: "/gallery/g5.jpeg",
      altLabel: "View Poster Presentation",
      title: "Soham Daterao with Mentor at IEEE MIT URTC",
      student: "Soham Daterao",
      topic: "Piezoelectric Energy Harvesting",
      paper: "Dynamic Analysis of L-Shaped and U-Shaped Piezoelectric Harvesters",
      school: "Great Oak High School, CA",
    },
  },
  {
    key: "pragna",
    firstName: "Pragna",
    lastName: "Surabathula",
    school: "Raleigh Charter High School, NC",
    domain: "AI / ML",
    topic: "Speech Denoising AI",
    paper: "Hearing it Clearly: Convolutional Autoencoders for Speech Denoising",
    badge: "POSTER",
    photoAlt: "Pragna Surabathula with poster at MIT URTC",
    lightbox: {
      src: "/gallery/g4.jpeg",
      title: "Pragna Surabathula with Poster at IEEE MIT URTC",
      student: "Pragna Surabathula",
      topic: "Speech Denoising AI",
      paper: "Hearing it Clearly: Convolutional Autoencoders for Speech Denoising",
      school: "Raleigh Charter High School, NC",
    },
  },
];

// Decorative vertical bars echoing the MIT wordmark, drawn in currentColor
function MitBars({ className }: { className?: string }) {
  const bars = [
    { x: 0, y: 0, h: 100 },
    { x: 18, y: 0, h: 70 },
    { x: 36, y: 0, h: 100 },
    { x: 54, y: 0, h: 100 },
    { x: 72, y: 30, h: 70 },
    { x: 90, y: 0, h: 18 },
    { x: 90, y: 30, h: 70 },
  ];
  return (
    <svg viewBox="0 0 102 100" className={className} aria-hidden="true">
      {bars.map((b, i) => (
        <rect key={i} x={b.x} y={b.y} width="12" height={b.h} fill="currentColor" />
      ))}
    </svg>
  );
}

export function MitUrtcSlide() {
  const [isVisible, setIsVisible] = useState(false);
  const [mobileTab, setMobileTab] = useState<ResearcherKey>("soham");
  const [activeLightbox, setActiveLightbox] = useState<LightboxData | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string>("");

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const openLightbox = (data: LightboxData) => {
    setActiveLightbox(data);
    setLightboxSrc(data.src);
  };

  return (
    <section
      className="relative h-full w-full overflow-hidden bg-sky-200 text-[#151515] flex flex-col justify-between"
      style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
    >
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(21,21,21,0.04)_1px,transparent_1px),linear-gradient(180deg,rgba(21,21,21,0.04)_1px,transparent_1px)] bg-[size:44px_44px]" />

      {/* ─── TOP SECTION: Congratulations + Event Identity ─── */}
      <div className="relative z-20 mx-auto flex w-full max-w-[1600px] flex-shrink-0 items-center justify-between gap-6 px-6 pt-24 pb-2 sm:px-10 md:px-20 lg:px-24 lg:pt-28 lg:pb-3">
        <div
          className={`min-w-0 transition-transform duration-700 ease-out motion-reduce:transition-none ${
            isVisible ? "translate-y-0" : "translate-y-4"
          }`}
        >
          <h1
            className="text-6xl font-black leading-[0.82] tracking-[0.01em] text-[#c2415a] sm:text-8xl lg:text-9xl"
            style={{ fontFamily: '"Brush Script MT", "Segoe Script", cursive' }}
          >
            Congratulations
          </h1>
          <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-[#151515] sm:mt-3 sm:text-base">
            Our students are headed to <span className="text-[#e05a47]">MIT</span> for 2026 <span className="text-[#e05a47]">IEEE MIT URTC</span> in AI/ML and Mech Domains
          </p>
          <a
            href="https://urtc.mit.edu/"
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 border-b-2 border-[#a31f34] pb-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#075985] transition-colors hover:text-[#a31f34] sm:mt-3 sm:text-xs"
          >
            URTC <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <div
          className={`hidden w-[36%] max-w-[460px] shrink-0 transition-transform duration-700 delay-150 ease-out motion-reduce:transition-none sm:block ${
            isVisible ? "translate-x-0" : "translate-x-6"
          }`}
        >
          <Image
            src={mitUrtcLogo}
            alt="MIT Undergraduate Research Technology Conference"
            priority
            className="h-auto w-full object-contain drop-shadow-md"
          />
        </div>
      </div>

      {/* ─── MOBILE TAB SELECTOR (< md) ─── */}
      <div className="relative z-20 mx-auto flex w-full max-w-[1600px] px-4 md:hidden pb-2">
        <div className="flex w-full rounded-xl bg-black/10 p-1 backdrop-blur-sm border border-black/10">
          <button
            type="button"
            onClick={() => setMobileTab("soham")}
            className={`flex-1 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
              mobileTab === "soham"
                ? "bg-[#151515] text-white shadow-md"
                : "text-slate-700 hover:text-black"
            }`}
          >
            Soham Daterao
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("pragna")}
            className={`flex-1 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
              mobileTab === "pragna"
                ? "bg-[#8a1a2d] text-white shadow-md"
                : "text-slate-700 hover:text-black"
            }`}
          >
            Pragna Surabathula
          </button>
        </div>
      </div>

      {/* ─── BOTTOM SECTION: 2 Researcher Cards (charcoal / cardinal) ─── */}
      <div className="relative z-10 mx-auto grid w-full max-w-[1600px] flex-1 min-h-[300px] md:max-h-[430px] grid-cols-1 gap-4 px-6 mb-10 sm:px-10 sm:mb-12 md:grid-cols-2 md:px-20 lg:gap-5 lg:px-24">
        {researchers.map((r, i) => {
          const isCardinal = r.key === "pragna";

          return (
            <article
              key={r.key}
              className={`group relative overflow-hidden flex-col items-stretch gap-3 rounded-3xl p-5 sm:p-6 md:flex-row md:gap-4 shadow-2xl ring-1 transition-all duration-700 ease-out hover:-translate-y-1 motion-reduce:transition-none lg:gap-6 ${
                isCardinal
                  ? "bg-gradient-to-br from-[#a31f34] via-[#8a1a2d] to-[#6e1424] ring-white/20 shadow-[#8a1a2d]/30"
                  : "bg-gradient-to-br from-[#24262c] via-[#18191d] to-[#0f1012] ring-white/10 shadow-black/40"
              } ${mobileTab === r.key ? "flex" : "hidden md:flex"} ${
                isVisible ? "translate-y-0" : "translate-y-6"
              }`}
              style={{ transitionDelay: `${150 + i * 100}ms` }}
            >
              {/* MIT-bars motif */}
              <MitBars
                className={`pointer-events-none absolute -top-6 -left-4 h-28 w-40 transition-transform duration-700 group-hover:translate-y-1 ${
                  isCardinal ? "text-white/10" : "text-[#a31f34]/25"
                }`}
              />
              <div
                className={`pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full blur-3xl ${
                  isCardinal ? "bg-black/25" : "bg-[#a31f34]/20"
                }`}
              />

              {/* Left: Info Column */}
              <div className="relative z-10 flex min-w-0 flex-1 flex-col">
                <div className="hidden items-center justify-between gap-3 md:flex">
                  <div
                    className={`flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full text-sm sm:text-base font-black ${
                      isCardinal ? "bg-white text-[#8a1a2d]" : "bg-[#a31f34] text-white"
                    }`}
                  >
                    {r.firstName[0]}
                    {r.lastName[0]}
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${
                      isCardinal ? "bg-black/20 text-white/90" : "bg-white/10 text-white/85"
                    }`}
                  >
                    {r.domain}
                  </span>
                </div>

                <div className="md:mt-4">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white leading-none">
                    {r.firstName}
                  </h2>
                  <p className="mt-1 text-lg sm:text-xl font-bold leading-tight text-white">{r.lastName}</p>
                  <p
                    className={`mt-2 flex items-start gap-1.5 text-[11px] sm:text-xs font-semibold ${
                      isCardinal ? "text-white/80" : "text-white/60"
                    }`}
                  >
                    <School className="mt-px h-3.5 w-3.5 shrink-0" />
                    {r.school}
                  </p>
                </div>

                {/* Research Topic */}
                <div className="mt-auto pt-4">
                  <div className={`mb-3 h-px w-full ${isCardinal ? "bg-white/20" : "bg-white/10"}`} />
                  <span
                    className={`flex items-center gap-1.5 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.16em] ${
                      isCardinal ? "text-[#ffd5dc]" : "text-[#f87171]"
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    {r.topic}
                  </span>
                  <p className="mt-1.5 text-base sm:text-lg lg:text-xl font-bold leading-snug text-white line-clamp-3 md:line-clamp-4">
                    {r.paper}
                  </p>
                </div>
              </div>

              {/* Right: Photo Frame */}
              <div
                onClick={() => openLightbox(r.lightbox)}
                className={`relative z-10 order-first h-48 w-full shrink-0 overflow-hidden rounded-2xl md:order-none md:h-auto md:w-[44%] border-2 bg-black shadow-2xl cursor-pointer group/img ${
                  isCardinal ? "border-white/30" : "border-white/20"
                }`}
              >
                <Image
                  src={r.lightbox.src}
                  alt={r.photoAlt}
                  fill
                  className="object-cover object-top group-hover/img:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 90vw, 340px"
                />
                {/* Conference Badge Stamp */}
                <div className="absolute top-2 right-2 bg-black/85 backdrop-blur-sm text-[8px] sm:text-[9px] font-black tracking-wider uppercase text-white/95 px-2 py-0.5 rounded border border-white/20">
                  {r.badge}
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/35 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                  <Maximize2 className="h-6 w-6 text-white drop-shadow-md" />
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* ─── FULL-SCREEN INTERACTIVE LIGHTBOX MODAL ─── */}
      <AnimatePresence>
        {activeLightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setActiveLightbox(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-3 sm:p-6 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#121316] border border-white/20 rounded-2xl overflow-hidden shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-black/40">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#e05a47]">
                      IEEE MIT URTC 2026
                    </span>
                    <span className="text-white/30">·</span>
                    <span className="text-[10px] font-bold text-white/60">
                      {activeLightbox.school}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                    {activeLightbox.student} — {activeLightbox.topic}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveLightbox(null)}
                  className="h-9 w-9 flex items-center justify-center rounded-lg border border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Photo Area */}
              <div className="relative w-full h-[58vh] sm:h-[65vh] bg-black flex items-center justify-center">
                <Image
                  src={lightboxSrc}
                  alt={activeLightbox.title}
                  fill
                  className="object-contain p-2"
                  priority
                />
              </div>

              {/* Modal Footer with Details & Optional Switcher */}
              <div className="px-5 py-3 border-t border-white/10 bg-black/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-white/90 font-medium line-clamp-1">
                    {activeLightbox.paper}
                  </p>
                </div>

                {activeLightbox.altSrc && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setLightboxSrc(
                          lightboxSrc === activeLightbox.src
                            ? activeLightbox.altSrc!
                            : activeLightbox.src
                        )
                      }
                      className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg bg-[#a31f34] text-white hover:bg-[#c22842] transition-colors flex items-center gap-1.5 shadow"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      {lightboxSrc === activeLightbox.src
                        ? activeLightbox.altLabel || "Switch Photo"
                        : "View URTC Banner"}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default MitUrtcSlide;

