"use client";

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import Image from "next/image";

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
    <div className="w-full relative px-4 md:px-16 group">
      <div className="overflow-hidden cursor-grab active:cursor-grabbing pb-8 pt-4" ref={emblaRef}>
        <div className="flex touch-pan-y items-stretch">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="flex-[0_0_100%] min-w-0 px-2 md:px-6"
            >
              <div 
                className={`transition-all duration-700 mx-auto w-full max-w-6xl rounded-3xl overflow-hidden min-h-[40vh] md:h-[400px] relative
                  ${
                    index === selectedIndex 
                      ? "border border-yellow-400/30 bg-[#121b2e] shadow-[0_0_50px_-12px_rgba(250,204,21,0.15)] opacity-100 scale-100" 
                      : "border border-slate-700/50 bg-[#0d1424] opacity-50 scale-[0.97]"
                  }`}
              >
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-blue-500/10 blur-[80px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 rounded-full bg-yellow-500/5 blur-[80px] pointer-events-none" />
                
                <div className="flex flex-col md:flex-row p-6 md:p-10 gap-8 h-full relative z-10">
                  {/* Left Column: Event & Student */}
                  <div className="md:w-5/12 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-700/50 pb-8 md:pb-0 md:pr-8">
                    {/* Event Info */}
                    <div className="flex items-start gap-5">
                      {item.competitionLogo && (
                        <div className="h-16 w-16 md:h-20 md:w-20 flex-shrink-0 rounded-2xl overflow-hidden border border-white/10 bg-white/5 p-2 shadow-lg backdrop-blur-sm">
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
                        <p className="text-[10px] md:text-[11px] uppercase tracking-[0.25em] text-yellow-500 font-bold mb-2">{item.date}</p>
                        <h3 className="text-xl md:text-2xl font-bold leading-snug text-slate-100 line-clamp-3">
                          {item.event}
                        </h3>
                      </div>
                    </div>

                    {/* Student Info */}
                    <div className="mt-8 flex items-center gap-4 bg-white/5 rounded-2xl p-4 border border-white/5 backdrop-blur-sm">
                      {item.schoolLogo && (
                        <div className="h-14 w-14 rounded-full border border-slate-600/60 bg-[#0f172a] p-2 shadow-inner flex-shrink-0">
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
                        <p className="text-lg md:text-xl font-bold bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent">
                          {item.student}
                        </p>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">{item.gradeSchool}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Achievement & Quote */}
                  <div className="md:w-7/12 flex flex-col justify-center md:pl-6 relative">
                    <Quote className="absolute top-0 right-0 w-32 h-32 text-white/[0.02] -rotate-12 pointer-events-none" />
                    
                    <p
                      className="leading-relaxed text-slate-200 text-lg md:text-[1.35rem] mb-8 font-serif"
                    >
                      Achieved
                      <span className="mx-2 font-bold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-md">
                        {item.achievement}
                      </span>
                      with the topic 
                      <span className="block mt-4 italic text-cyan-300 font-medium leading-snug border-l-2 border-cyan-500/30 pl-4">
                        “{item.topic}”
                      </span>
                    </p>

                    <div className="relative">
                      <Quote className="absolute -left-2 -top-2 w-5 h-5 text-yellow-500/40" />
                      <p
                        className="text-slate-300/90 leading-relaxed text-base md:text-lg pl-6"
                        style={{ fontFamily: '"Kalam", cursive', letterSpacing: '0.4px' }}
                      >
                        {item.quote}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
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
