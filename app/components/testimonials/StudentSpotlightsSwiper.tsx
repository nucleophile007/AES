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
            ? "border-yellow-400/50 bg-gradient-to-br from-slate-800 via-slate-800/95 to-slate-900 p-8 shadow-2xl"
            : "border-slate-700/50 bg-gradient-to-br from-slate-800/80 via-slate-800/70 to-slate-900/80 p-6"
        }`}
      >
        {/* School Logo + Competition Title */}
        <div className="mb-6 flex items-start gap-4">
          {item.schoolLogo && (
            <div className="w-16 h-16 flex-shrink-0">
              <Image
                src={item.schoolLogo}
                alt="School logo"
                width={64}
                height={64}
                className="w-full h-full object-contain"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-widest text-yellow-400 font-bold line-clamp-2">
              {item.event}
            </p>
            <p className="text-xs text-slate-400 mt-2">{item.date}</p>
          </div>
        </div>

        {/* Content - No Scrolling */}
        <div className="flex-1 space-y-4 flex flex-col justify-between">
          {/* Achievement */}
          <div>
            <p
              className={`font-bold bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent leading-snug ${
                isCenter ? "text-2xl md:text-3xl" : "text-lg"
              }`}
              style={{ fontFamily: '"Comic Sans MS", "Comic Sans", cursive' }}
            >
              {item.achievement}
            </p>
          </div>

          {/* Topic - Italic with quotes */}
          <div className="border-l-4 border-cyan-400/50 pl-4">
            <p
              className={`text-cyan-300 italic leading-relaxed font-normal ${
                isCenter ? "text-sm" : "text-xs"
              }`}
            >
              &ldquo;<span className="font-medium">{item.topic}</span>&rdquo;
            </p>
          </div>

          {/* Message */}
          <div>
            <p
              className={`font-semibold text-amber-100 leading-relaxed ${
                isCenter ? "text-base" : "text-xs"
              }`}
              style={{ fontFamily: '"Kalam", cursive', letterSpacing: '0.3px' }}
            >
              {item.quote}
            </p>
          </div>
        </div>

        {/* Student Info - Bottom */}
        <div className="pt-6 border-t border-slate-700/50 mt-4">
          <p className="text-sm font-bold bg-gradient-to-r from-yellow-300 to-amber-500 bg-clip-text text-transparent line-clamp-1">
            {item.student}
          </p>
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
