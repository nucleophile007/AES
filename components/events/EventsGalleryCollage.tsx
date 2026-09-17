"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, X } from "lucide-react";

interface EventsGalleryCollageProps {
  images: string[];
}

/* Reusable easing curve — matches the Dribbble editorial reveal style */
const EASE = [0.76, 0, 0.24, 1] as const;

/* Corner accent marks */
function CornerAccents() {
  return (
    <>
      <span className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-yellow-400/70 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <span className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-yellow-400/70 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <span className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-yellow-400/70 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <span className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-yellow-400/70 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </>
  );
}

/* Individual image card with clip-path reveal + counter-scale on image */
interface GalleryCardProps {
  src: string;
  title: string;
  className: string;
  /* clipPath reveal direction */
  revealFrom: "left" | "right" | "bottom" | "top";
  delay: number;
  onOpen: () => void;
}

function GalleryCard({ src, title, className, revealFrom, delay, onOpen }: GalleryCardProps) {
  const clipHidden = {
    left:   "inset(0% 100% 0% 0%)",
    right:  "inset(0% 0% 0% 100%)",
    bottom: "inset(100% 0% 0% 0%)",
    top:    "inset(0% 0% 100% 0%)",
  }[revealFrom];

  const clipVisible = "inset(0% 0% 0% 0%)";

  return (
    <motion.div
      className={`group relative overflow-hidden cursor-pointer bg-slate-900 rounded-sm ${className}`}
      /* outer wrapper clips the card into view */
      initial={{ clipPath: clipHidden }}
      whileInView={{ clipPath: clipVisible }}
      viewport={{ once: true, margin: "0px" }}
      transition={{ duration: 1.1, delay, ease: EASE }}
      onClick={onOpen}
    >
      {/* Image counter-scales: starts larger, settles to normal — zoom-out-into-place effect */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.18 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: "0px" }}
        transition={{ duration: 1.1, delay, ease: EASE }}
      >
        <Image
          src={src}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          sizes="(max-width: 768px) 100vw, 40vw"
        />
      </motion.div>

      {/* Dark overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

      {/* Corner accents */}
      <CornerAccents />

      {/* Title + expand — slides up from bottom */}
      <div className="absolute bottom-0 inset-x-0 p-5 z-20 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-between">
        <h3 className="text-base sm:text-lg font-bold text-white leading-snug max-w-[80%]">
          {title}
        </h3>
        <div className="h-9 w-9 flex items-center justify-center border border-white/30 text-white shrink-0 ml-3 bg-black/40 backdrop-blur-sm rounded-sm">
          <Maximize2 className="h-4 w-4" />
        </div>
      </div>

      {/* Subtle frame glow */}
      <div className="absolute inset-0 border border-white/5 group-hover:border-yellow-400/20 transition-colors duration-300 pointer-events-none rounded-sm z-10" />
    </motion.div>
  );
}

export function EventsGalleryCollage({ images }: EventsGalleryCollageProps) {
  const [activeLightbox, setActiveLightbox] = useState<{ src: string; title: string } | null>(null);

  const imgs = [
    images[0] || "/gallery/img1.jpg",
    images[1] || "/gallery/img2.jpg",
    images[2] || "/gallery/img3.jpg",
    images[3] || "/gallery/img4.jpeg",
  ];

  return (
    <div className="relative w-full pt-20 bg-[#080c14]">

      {/* ── Museum-style heading ── */}
      <motion.div
        className="px-6 sm:px-10 lg:px-16 pt-10 pb-8"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <p className="text-xs sm:text-sm font-bold tracking-[0.3em] text-yellow-400 uppercase mb-2">
          AES Events
        </p>
        <div className="flex items-end gap-6">
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-none tracking-tight">
            Photo Gallery
          </h2>
          <div className="flex-1 mb-3 h-px bg-gradient-to-r from-yellow-400/60 via-white/10 to-transparent" />
        </div>
      </motion.div>

      {/* ── 4-image Grid with directional clip-path reveals ──
          Layout:
            [ Card 1 — large left  ] [ Card 2 — top right  ]
            [ Card 3 — bot center  ] [ Card 4 — large right ]
          On desktop: 3 cols, cards span accordingly
      */}
      <div className="px-3 sm:px-4 pb-14">

        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <GalleryCard
            src={imgs[0]}
            title="Campus Highlights & Learning"
            className="md:col-span-2 h-[420px] md:h-[500px]"
            revealFrom="left"
            delay={0}
            onOpen={() => setActiveLightbox({ src: imgs[0], title: "Campus Highlights & Learning" })}
          />
          <GalleryCard
            src={imgs[1]}
            title="Interactive Student Workshops"
            className="md:col-span-1 h-[420px] md:h-[500px]"
            revealFrom="top"
            delay={0.15}
            onOpen={() => setActiveLightbox({ src: imgs[1], title: "Interactive Student Workshops" })}
          />
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <GalleryCard
            src={imgs[2]}
            title="Research & Mentorship Camps"
            className="md:col-span-1 h-[420px] md:h-[500px]"
            revealFrom="bottom"
            delay={0.1}
            onOpen={() => setActiveLightbox({ src: imgs[2], title: "Research & Mentorship Camps" })}
          />
          <GalleryCard
            src={imgs[3]}
            title="College Prep & Academic Celebrations"
            className="md:col-span-2 h-[420px] md:h-[500px]"
            revealFrom="right"
            delay={0.2}
            onOpen={() => setActiveLightbox({ src: imgs[3], title: "College Prep & Academic Celebrations" })}
          />
        </div>
      </div>

      {/* ── Lightbox Modal ── */}
      <AnimatePresence>
        {activeLightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setActiveLightbox(null)}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-4 backdrop-blur-xl"
          >
            <div className="w-full max-w-5xl flex items-center justify-between mb-3 px-1">
              <div>
                <p className="text-xs font-bold tracking-[0.25em] text-yellow-400 uppercase">AES Events</p>
                <p className="text-white font-semibold text-lg">{activeLightbox.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveLightbox(null)}
                className="h-10 w-10 flex items-center justify-center border border-white/20 text-white hover:border-yellow-400/60 hover:text-yellow-400 transition rounded-sm"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <motion.div
              initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
              animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
              exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
              transition={{ duration: 0.5, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl h-[75vh] border border-white/10 rounded-sm overflow-hidden"
            >
              <Image
                src={activeLightbox.src}
                alt={activeLightbox.title}
                fill
                className="object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default EventsGalleryCollage;
