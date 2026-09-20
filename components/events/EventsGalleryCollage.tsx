"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, X } from "lucide-react";

interface EventsGalleryCollageProps {
  images?: string[];
}

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

interface PhotoCardData {
  id: string;
  src: string;
  title: string;
  widthClass: string;
}

export function EventsGalleryCollage({ images }: EventsGalleryCollageProps) {
  const [activeLightbox, setActiveLightbox] = useState<{ src: string; title: string } | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const imgs = [
    (images && images[0]) || "/gallery/img1.jpg",
    (images && images[1]) || "/gallery/img2.jpg",
    (images && images[2]) || "/gallery/img3.jpg",
    (images && images[3]) || "/gallery/img4.jpeg",
  ];

  const cards: PhotoCardData[] = [
    {
      id: "img1",
      src: imgs[0],
      title: "Campus Highlights & Learning",
      widthClass: "w-[480px] sm:w-[600px] md:w-[700px]",
    },
    {
      id: "img2",
      src: imgs[1],
      title: "Interactive Student Workshops",
      widthClass: "w-[280px] sm:w-[340px] md:w-[400px]",
    },
    {
      id: "img3",
      src: imgs[2],
      title: "Research & Mentorship Camps",
      widthClass: "w-[280px] sm:w-[340px] md:w-[400px]",
    },
    {
      id: "img4",
      src: imgs[3],
      title: "College Prep & Academic Celebrations",
      widthClass: "w-[480px] sm:w-[600px] md:w-[700px]",
    },
  ];

  // Repeat for seamless infinite scroll
  const scrollItems = [...cards, ...cards, ...cards];

  return (
    <div className="relative w-full pt-20 pb-10 bg-[#080c14] overflow-hidden">
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

      {/* ── Single Infinite Horizontal Scrolling Row ── */}
      <div
        className="relative w-full overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Edge gradient fade masks */}
        <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-20 bg-gradient-to-r from-[#080c14] to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-20 bg-gradient-to-l from-[#080c14] to-transparent z-20 pointer-events-none" />

        <motion.div
          className="flex gap-3 w-max will-change-transform px-3 sm:px-4"
          animate={{
            x: isPaused ? undefined : ["0%", `-${100 / 3}%`],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 28,
              ease: "linear",
            },
          }}
        >
          {scrollItems.map((card, idx) => (
            <div
              key={`${card.id}-${idx}`}
              onClick={() => setActiveLightbox({ src: card.src, title: card.title })}
              className={`group relative shrink-0 overflow-hidden cursor-pointer bg-slate-900 rounded-sm h-[320px] sm:h-[380px] md:h-[420px] ${card.widthClass}`}
            >
              {/* Image */}
              <div className="absolute inset-0">
                <Image
                  src={card.src}
                  alt={card.title}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  sizes="(max-width: 768px) 80vw, 50vw"
                />
              </div>

              {/* Dark overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

              {/* Corner accents */}
              <CornerAccents />

              {/* Title on bottom left */}
              <div className="absolute bottom-0 inset-x-0 p-5 z-20 flex items-end justify-between">
                <h3 className="text-sm sm:text-base font-bold text-white/90 leading-snug drop-shadow-md">
                  {card.title}
                </h3>
                <div className="h-8 w-8 flex items-center justify-center border border-white/30 text-white shrink-0 ml-3 bg-black/40 backdrop-blur-sm rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Maximize2 className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* Subtle frame glow */}
              <div className="absolute inset-0 border border-white/5 group-hover:border-yellow-400/20 transition-colors duration-300 pointer-events-none rounded-sm z-10" />
            </div>
          ))}
        </motion.div>
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
