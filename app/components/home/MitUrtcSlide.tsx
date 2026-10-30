"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, ExternalLink, Maximize2, X, Sparkles } from "lucide-react";
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

export function MitUrtcSlide() {
  const [isVisible, setIsVisible] = useState(false);
  const [mobileTab, setMobileTab] = useState<"soham" | "pragna">("soham");
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
      <div className="relative z-20 mx-auto flex w-full max-w-[1600px] flex-shrink-0 items-center justify-between gap-6 px-6 pt-24 pb-2 sm:px-10 lg:px-16 lg:pt-28 lg:pb-3">
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

      {/* ─── BOTTOM SECTION: Innovative Featured Researchers Collage ─── */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-1 min-h-[300px] max-h-[460px] flex-col overflow-hidden shadow-2xl md:flex-row border-t border-black/10 mb-8 sm:mb-10">

        {/* ══════════════════════════════════════════════════
            LEFT CARD: SOHAM DATERAO (MIT Charcoal/Black Wing)
           ══════════════════════════════════════════════════ */}
        <div
          className={`relative flex-1 bg-[#121316] overflow-hidden flex flex-col justify-center p-5 sm:p-6 lg:p-7 border-b md:border-b-0 md:border-r border-white/10 group ${
            mobileTab === "soham" ? "flex" : "hidden md:flex"
          }`}
        >
          {/* Subtle Ambient Red Glow & Angular Geometry */}
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#a31f34]/15 blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-0 h-full w-14 lg:w-20 -skew-x-[12deg] bg-[#1a1b20] pointer-events-none" />

          {/* Main Card Content: Typography Left + Multi-Layer Collage Right */}
          <div className="relative z-10 flex flex-row items-center justify-between gap-3 sm:gap-5 lg:gap-6 my-auto pt-1">
            {/* Left Info Column */}
            <div className="flex-1 min-w-0 pr-1 sm:pr-2">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white leading-none">
                Soham
              </h2>
              <p className="mt-1 text-[11px] sm:text-xs font-semibold text-white/60">
                Great Oak High School, CA
              </p>

              {/* Research Topic Accent Box */}
              <div className="mt-3 sm:mt-4 max-w-md border-l-4 border-[#a31f34] pl-3 py-1 bg-white/[0.04] rounded-r-lg">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#f87171] block">
                  Piezoelectric Energy Harvesting
                </span>
                <p className="mt-1 text-base sm:text-xl lg:text-2xl font-bold text-white leading-snug line-clamp-4">
                  Dynamic Analysis of L-Shaped & U-Shaped Piezoelectric Harvesters
                </p>
              </div>
            </div>

            {/* Right: Photo Frame */}
            <div className="relative shrink-0 w-[47%] md:w-[49%] lg:w-[50%] max-w-[430px] mr-1 sm:mr-2 lg:mr-4">
              {/* Conference Photo Frame */}
              <div
                onClick={() =>
                  openLightbox({
                    src: "/gallery/g3.jpeg",
                    altSrc: "/gallery/g5.jpeg",
                    altLabel: "View Poster Presentation",
                    title: "Soham Daterao with Mentor at IEEE MIT URTC",
                    student: "Soham Daterao",
                    topic: "Piezoelectric Energy Harvesting",
                    paper: "Dynamic Analysis of L-Shaped and U-Shaped Piezoelectric Harvesters",
                    school: "Great Oak High School, CA",
                  })
                }
                className="relative h-[200px] sm:h-[245px] lg:h-[285px] xl:h-[310px] w-full rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl bg-black cursor-pointer transition-all duration-300 group/img"
              >
                <Image
                  src="/gallery/g3.jpeg"
                  alt="Soham Daterao with mentor at IEEE MIT URTC"
                  fill
                  className="object-cover object-top group-hover/img:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 47vw, 420px"
                />
                {/* Conference Badge Stamp */}
                <div className="absolute top-2 right-2 bg-black/85 backdrop-blur-sm text-[8px] sm:text-[9px] font-black tracking-wider uppercase text-white/95 px-2 py-0.5 rounded border border-white/20">
                  URTC &apos;26
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/35 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                  <Maximize2 className="h-6 w-6 text-white drop-shadow-md" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            RIGHT CARD: PRAGNA SURABATHULA (MIT Cardinal Wing)
           ══════════════════════════════════════════════════ */}
        <div
          className={`relative flex-1 bg-[#8a1a2d] overflow-hidden flex flex-col justify-center p-5 sm:p-6 lg:p-7 group ${
            mobileTab === "pragna" ? "flex" : "hidden md:flex"
          }`}
        >
          {/* Subtle Ambient Geometry & Bevel Highlight */}
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-black/25 blur-3xl pointer-events-none" />
          <div className="absolute left-0 top-0 h-full w-14 lg:w-20 skew-x-[12deg] bg-[#9a1d33] pointer-events-none" />

          {/* Main Card Content: Typography Left + Multi-Layer Collage Right */}
          <div className="relative z-10 flex flex-row items-center justify-between gap-3 sm:gap-5 lg:gap-6 my-auto pt-1">
            {/* Left Info Column */}
            <div className="flex-1 min-w-0 pr-1 sm:pr-2">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white leading-none">
                Pragna
              </h2>
              <p className="mt-1 text-[11px] sm:text-xs font-semibold text-white/80">
                Raleigh Charter High School, NC
              </p>

              {/* Research Topic Accent Box */}
              <div className="mt-3 sm:mt-4 max-w-md border-l-4 border-white pl-3 py-1 bg-black/20 rounded-r-lg">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#ffd5dc] block">
                  Speech Denoising AI
                </span>
                <p className="mt-1 text-base sm:text-xl lg:text-2xl font-bold text-white leading-snug line-clamp-4">
                  Hearing it Clearly: Convolutional Autoencoders for Speech Denoising
                </p>
              </div>
            </div>

            {/* Right: Photo Frame */}
            <div className="relative shrink-0 w-[47%] md:w-[49%] lg:w-[50%] max-w-[430px] mr-1 sm:mr-2 lg:mr-4">
              {/* Conference Photo Frame */}
              <div
                onClick={() =>
                  openLightbox({
                    src: "/gallery/g4.jpeg",
                    title: "Pragna Surabathula with Poster at IEEE MIT URTC",
                    student: "Pragna Surabathula",
                    topic: "Speech Denoising AI",
                    paper: "Hearing it Clearly: Convolutional Autoencoders for Speech Denoising",
                    school: "Raleigh Charter High School, NC",
                  })
                }
                className="relative h-[200px] sm:h-[245px] lg:h-[285px] xl:h-[310px] w-full rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-white/30 shadow-2xl bg-black cursor-pointer transition-all duration-300 group/img"
              >
                <Image
                  src="/gallery/g4.jpeg"
                  alt="Pragna Surabathula with poster at MIT URTC"
                  fill
                  className="object-cover object-top group-hover/img:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 47vw, 420px"
                />
                {/* Conference Badge Stamp */}
                <div className="absolute top-2 right-2 bg-black/85 backdrop-blur-sm text-[8px] sm:text-[9px] font-black tracking-wider uppercase text-white/95 px-2 py-0.5 rounded border border-white/20">
                  POSTER
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/35 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                  <Maximize2 className="h-6 w-6 text-white drop-shadow-md" />
                </div>
              </div>
            </div>
          </div>
        </div>

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

