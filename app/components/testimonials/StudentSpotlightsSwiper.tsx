"use client";

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight, Quote, Sparkles } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

export type StudentSpotlight = {
  id: string;
  event: string;
  date: string;
  student: string;
  gradeSchool: string;
  topic: string;
  achievement: string;
  quote: string;
  schoolLogo?: string;
  competitionLogo?: string;
};

interface StudentSpotlightsSwiperProps {
  items: StudentSpotlight[];
}

export default function StudentSpotlightsSwiper({
  items,
}: StudentSpotlightsSwiperProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "center", dragFree: false },
    [Autoplay({ delay: 6000, stopOnInteraction: true })]
  );
  
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  if (!items || items.length === 0) {
    return <div className="text-center text-slate-400">No spotlights available</div>;
  }

  return (
    <div className="relative w-full px-2 sm:px-4 md:px-12 lg:px-20 group">
      <div className="overflow-hidden cursor-grab active:cursor-grabbing pb-8 pt-4" ref={emblaRef}>
        <div className="flex touch-pan-y items-stretch">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="flex-[0_0_100%] md:flex-[0_0_50%] min-w-0 px-2 md:px-3"
            >
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className={`transition-all duration-700 mx-auto w-full rounded-[2rem] overflow-hidden min-h-[430px] relative
                  ${
                    index === selectedIndex 
                      ? "border border-yellow-400/50 bg-[#121b2e] shadow-[0_20px_70px_-20px_rgba(250,204,21,0.35)] scale-100"
                      : "border border-slate-700/70 bg-[#0d1424] scale-[0.97]"
                  }`}
              >
                <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-500/15 blur-[70px] pointer-events-none animate-pulse" />
                <div className="absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-yellow-500/10 blur-[80px] pointer-events-none" />
                <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-yellow-400/80 to-transparent" />
                
                <div className="flex flex-col md:flex-row p-5 lg:p-7 gap-5 h-full relative z-10">
                  {/* Left Column: Event & Student */}
                  <div className="md:w-[38%] flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-700/60 pb-5 md:pb-0 md:pr-5">
                    {/* Event Info */}
                    <div className="flex items-start gap-3">
                      {item.competitionLogo && (
                        <div className="h-14 w-14 md:h-16 md:w-16 flex-shrink-0 rounded-2xl overflow-hidden border border-white/10 bg-white/5 p-2 shadow-lg backdrop-blur-sm">
                          <Image
                            src={item.competitionLogo}
                            alt="Competition logo"
                            width={80}
                            height={80}
                            className="h-full w-full object-contain drop-shadow-md"
                          />
                        </div>
                      )}
                      <div className="pt-1">
                        <p className="text-[9px] uppercase tracking-[0.2em] text-yellow-400 font-bold mb-2">{item.date}</p>
                        <h3 className="text-base md:text-lg font-bold leading-snug text-slate-100 line-clamp-3">
                          {item.event}
                        </h3>
                      </div>
                    </div>

                    {/* Student Info */}
                    <div className="mt-6 flex items-center gap-3 bg-white/5 rounded-2xl p-3 border border-white/5 backdrop-blur-sm">
                      {item.schoolLogo && (
                        <div className="h-11 w-11 rounded-full border border-slate-600/60 bg-[#0f172a] p-2 shadow-inner flex-shrink-0">
                          <Image
                            src={item.schoolLogo}
                            alt={`${item.student} school logo`}
                            width={56}
                            height={56}
                            className="h-full w-full object-contain"
                          />
                        </div>
                      )}
                      <div>
                        <p className="text-base md:text-lg font-bold bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent">
                          {item.student ? item.student : item.gradeSchool}
                        </p>
                        {item.student ? (
                          <p className="text-xs text-slate-400 mt-1 line-clamp-1">{item.gradeSchool}</p>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Achievement & Quote */}
                  <div className="md:w-[62%] flex flex-col justify-center md:pl-2 relative">
                    <Quote className="absolute top-0 right-0 w-24 h-24 text-white/[0.04] -rotate-12 pointer-events-none" />
                    <div className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-yellow-400">
                      <Sparkles className="h-4 w-4" />
                      <span>{item.achievement}</span>
                    </div>
                    
                    <p
                      className="leading-snug text-slate-100 text-lg md:text-xl mb-6 font-serif"
                    >
                      <span className="block mt-4 italic text-cyan-300 font-medium leading-snug border-l-2 border-cyan-500/30 pl-4">
                        “{item.topic}”
                      </span>
                    </p>

                    <div className="relative">
                      <Quote className="absolute -left-2 -top-2 w-5 h-5 text-yellow-500/40" />
                      <p
                        className="text-slate-300/90 leading-relaxed text-sm md:text-base pl-6"
                        style={{ fontFamily: '"Kalam", cursive', letterSpacing: '0.4px' }}
                      >
                        {item.quote}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows (Floating on edges) */}
      <button
        onClick={scrollPrev}
        className="absolute left-0 md:left-4 top-1/2 -translate-y-1/2 p-3 md:p-4 rounded-full bg-slate-800/80 backdrop-blur-md border border-slate-700 hover:bg-slate-700 hover:border-yellow-500/50 transition-all shadow-xl opacity-0 group-hover:opacity-100 focus:opacity-100 -translate-x-4 group-hover:translate-x-0 disabled:hidden"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} className="text-slate-300 group-hover:text-yellow-400 transition-colors" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-0 md:right-4 top-1/2 -translate-y-1/2 p-3 md:p-4 rounded-full bg-slate-800/80 backdrop-blur-md border border-slate-700 hover:bg-slate-700 hover:border-yellow-500/50 transition-all shadow-xl opacity-0 group-hover:opacity-100 focus:opacity-100 translate-x-4 group-hover:translate-x-0 disabled:hidden"
        aria-label="Next slide"
      >
        <ChevronRight size={24} className="text-slate-300 group-hover:text-yellow-400 transition-colors" />
      </button>

      {/* Dots (Centered at bottom) */}
      <div className="flex justify-center items-center gap-3 mt-2">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={`rounded-full transition-all duration-300 ${
              index === selectedIndex
                ? "bg-yellow-400 w-10 h-2.5 shadow-[0_0_12px_rgba(250,204,21,0.6)]"
                : "bg-slate-600 w-2.5 h-2.5 hover:bg-slate-400"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
