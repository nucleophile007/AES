"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
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
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  if (!items || items.length === 0) {
    return <div className="text-center text-slate-400">No spotlights available</div>;
  }

  const getCardIndex = (offset: number) =>
    (currentIndex + offset + items.length) % items.length;

  const renderCard = (item: StudentSpotlight, isCenter: boolean) => (
    <motion.div
      key={item.id}
      layout
      animate={{
        opacity: isCenter ? 1 : 0.6,
        scale: isCenter ? 1 : 0.85,
        zIndex: isCenter ? 10 : 1,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="flex-shrink-0"
    >
      <div
        className={`rounded-3xl border overflow-hidden h-[600px] w-[500px] flex flex-col ${
          isCenter
            ? "border-yellow-400/50 bg-gradient-to-br from-slate-800 via-slate-800/95 to-slate-900 p-7 shadow-2xl"
            : "border-slate-700/50 bg-gradient-to-br from-slate-800/80 via-slate-800/70 to-slate-900/80 p-6"
        }`}
      >
        {/* Competition Logo + Title */}
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-yellow-400/10 bg-white/5 px-4 py-2.5 shadow-inner shadow-black/20">
          {item.competitionLogo ? (
            <div className="h-14 w-14 flex-shrink-0 rounded-full overflow-hidden border border-yellow-400/15 bg-slate-950/50 flex items-center justify-center">
              <Image
                src={item.competitionLogo}
                alt="Competition logo"
                width={56}
                height={56}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="h-14 w-14 flex-shrink-0 rounded-full border border-dashed border-yellow-400/20 bg-slate-950/50 flex items-center justify-center text-[10px] uppercase tracking-[0.14em] text-slate-400 text-center px-1">
              Logo
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="mt-0.5 text-sm md:text-xl font-semibold leading-snug text-slate-50 line-clamp-2">
              {item.event}
            </p>
            <div className="mt-1.5 h-px w-14 bg-gradient-to-r from-yellow-400/70 to-transparent" />
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400 mt-1.5">{item.date}</p>
          </div>
        </div>

        {/* Content - Highlight sentence + handwritten note */}
        <div className="flex-1 flex flex-col justify-between">
          <div className="space-y-4 pt-1">
            <div className="mx-auto h-px w-24 bg-gradient-to-r from-transparent via-yellow-400/70 to-transparent" />

            <p
              className={`text-center leading-relaxed text-slate-100 ${
                isCenter ? "text-base md:text-[1.15rem]" : "text-sm"
              }`}
              style={{ fontFamily: 'Georgia, serif' }}
            >
              <span className="mx-1 text-slate-300">{item.student}</span> achieved
              <span className="mx-1 font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-400 to-orange-400">
                {item.achievement}
              </span>
              with the topic
              <span className="mx-1 font-semibold italic text-cyan-300">“{item.topic}”</span>!
            </p>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-700/40 bg-slate-950/30 px-4 py-3">
            <p
              className={`text-amber-100 leading-relaxed ${
                isCenter ? "text-sm" : "text-[11px]"
              }`}
              style={{ fontFamily: '"Kalam", cursive', letterSpacing: '0.2px' }}
            >
              “{item.quote}”
            </p>
          </div>
        </div>

        {/* Student Info - Bottom */}
        <div className="pt-6 border-t border-slate-700/50 mt-4">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold bg-gradient-to-r from-yellow-300 to-amber-500 bg-clip-text text-transparent line-clamp-1">
                {item.student}
              </p>
              <p className="text-xs text-slate-400 mt-1 line-clamp-1">Student spotlight</p>
            </div>

            {item.schoolLogo ? (
              <div className="mt-2 h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border border-slate-600/60 bg-slate-900/80 p-2 self-end">
                <Image
                  src={item.schoolLogo}
                  alt={`${item.student} school logo`}
                  width={56}
                  height={56}
                  className="h-full w-full object-contain"
                />
              </div>
            ) : (
              <div className="mt-2 h-14 w-14 flex-shrink-0 self-end rounded-xl border border-dashed border-slate-600/70 bg-slate-900/70 flex items-center justify-center text-[9px] uppercase tracking-[0.18em] text-slate-500 text-center px-1">
                School logo
              </div>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1 line-clamp-1">{item.gradeSchool}</p>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="w-full py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Swiper Container */}
        <div className="relative flex items-center justify-center gap-4">
          {/* Previous Button */}
          <button
            onClick={prevSlide}
            className="absolute -left-6 md:left-0 z-50 p-2 rounded-full bg-white/15 backdrop-blur-md hover:bg-white/25 transition-all duration-200 border border-white/20 h-12 w-12 flex items-center justify-center hover:scale-110"
            aria-label="Previous slide"
          >
            <ChevronLeft size={20} className="text-white" />
          </button>

          {/* Cards Container */}
          <div className="w-full overflow-hidden">
            <div className="flex justify-center items-center gap-4 px-12">
              {/* Left Card */}
              <div className="hidden lg:block">
                {renderCard(items[getCardIndex(-1)], false)}
              </div>

              {/* Center Card */}
              {renderCard(items[currentIndex], true)}

              {/* Right Card */}
              <div className="hidden lg:block">
                {renderCard(items[getCardIndex(1)], false)}
              </div>
            </div>
          </div>

          {/* Next Button */}
          <button
            onClick={nextSlide}
            className="absolute -right-6 md:right-0 z-50 p-2 rounded-full bg-white/15 backdrop-blur-md hover:bg-white/25 transition-all duration-200 border border-white/20 h-12 w-12 flex items-center justify-center hover:scale-110"
            aria-label="Next slide"
          >
            <ChevronRight size={20} className="text-white" />
          </button>
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center items-center gap-2 mt-8">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-gradient-to-r from-yellow-400 to-amber-500 w-8 h-2.5"
                  : "bg-slate-600 w-2.5 h-2.5 hover:bg-slate-500"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
