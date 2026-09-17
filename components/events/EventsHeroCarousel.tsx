"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface EventsHeroCarouselProps {
  images: string[];
  intervalMs?: number;
  className?: string;
}

export function EventsHeroCarousel({ images, intervalMs = 5000, className }: EventsHeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered || images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [currentIndex, isHovered, images.length, intervalMs]);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div 
      className={className || "relative w-full mt-20 sm:mt-24 lg:mt-28 h-[60vh] sm:h-[70vh] lg:h-[80vh] overflow-hidden bg-slate-950"}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Images with Transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0"
        >
          <Image
            src={images[currentIndex]}
            alt={`Events Gallery Image ${currentIndex + 1}`}
            fill
            priority={currentIndex === 0}
            className="object-cover"
            sizes="100vw"
          />
          {/* Subtle gradient overlays for contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-slate-950/30" />
        </motion.div>
      </AnimatePresence>

      {/* Slide Navigation Arrows */}
      {images.length > 1 && (
        <div className="absolute inset-y-0 left-0 right-0 z-20 flex items-center justify-between px-4 sm:px-6 pointer-events-none">
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous slide"
            className="pointer-events-auto h-12 w-12 rounded-full bg-slate-950/40 hover:bg-slate-900/80 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition hover:scale-105"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next slide"
            className="pointer-events-auto h-12 w-12 rounded-full bg-slate-950/40 hover:bg-slate-900/80 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition hover:scale-105"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* Slide Indicator Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                i === currentIndex ? "w-8 bg-yellow-400" : "w-2.5 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default EventsHeroCarousel;
