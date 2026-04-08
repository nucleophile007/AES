"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Slide = {
  title: string;
  subtitle?: string;
  description?: string;
  imageSrc: string;
  imageAlt: string;
  cta?: { label: string; href: string };
  isEvent?: boolean; // Flag to identify event slides
};

type HeroSliderAlwaysProps = {
  slides: Slide[];
  intervalMs?: number;
  className?: string;
  ariaLabel?: string;
};

export function HeroSliderAlways({
  slides,
  intervalMs = 4500,
  className,
  ariaLabel = "Hero carousel",
}: HeroSliderAlwaysProps) {
  const [index, setIndex] = React.useState(0);
  const count = slides.length;
  const activeSlide = slides[index];

  React.useEffect(() => {
    if (count <= 1) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % count);
    }, intervalMs);
    return () => clearInterval(id);
  }, [count, intervalMs]);

  React.useEffect(() => {
    if (count === 0) return;
    if (index >= count) setIndex(0);
  }, [count, index]);

  const startX = React.useRef<number | null>(null);

  if (!activeSlide) return null;

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setIndex((i) => (i + 1) % count);
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setIndex((i) => (i - 1 + count) % count);
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (startX.current == null) return;
    const dx = e.clientX - startX.current;
    const threshold = 40;
    if (dx > threshold) {
      setIndex((i) => (i - 1 + count) % count);
    } else if (dx < -threshold) {
      setIndex((i) => (i + 1) % count);
    }
    startX.current = null;
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      className={cn("relative w-full h-screen overflow-hidden bg-background", className)}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      <div key={activeSlide.title + index} className="absolute inset-0 transition-opacity duration-700 ease-in-out opacity-100">
        <Image
          src={activeSlide.imageSrc || "/placeholder.svg?height=1080&width=1920&query=professional%20education%20hero"}
          alt={activeSlide.imageAlt || "Hero image"}
          fill
          className="object-cover"
          priority={index === 0}
          quality={75}
          sizes="100vw"
        />

        <div className={`absolute inset-0 ${activeSlide.isEvent ? 'bg-gradient-to-r from-black/80 via-black/50 to-black/30' : 'bg-gradient-to-r from-black/60 via-black/30 to-transparent'}`} />

        <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-10 lg:px-16 py-12 md:py-16 lg:py-20 z-10">
          <div className={`${activeSlide.isEvent ? 'max-w-3xl' : 'max-w-2xl'} ml-8 md:ml-16 mt-8 md:mt-16`}>
            {activeSlide.isEvent && (
              <div className="inline-flex items-center gap-2 mb-3 md:mb-4 px-4 py-2 bg-gradient-to-r from-red-500 via-red-600 to-orange-600 text-white font-bold text-sm rounded-full shadow-2xl">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm2 0v8h12V6H4zm2 2h8v2H6V8z"/>
                </svg>
                Latest Event
              </div>
            )}
            {activeSlide.subtitle && (
              <div className={`hero-badge mb-4 md:mb-6 ${
                activeSlide.isEvent
                  ? 'bg-slate-900/90 border-2 border-yellow-400/60 text-yellow-300 font-semibold text-sm md:text-base px-4 py-2 shadow-lg'
                  : 'bg-gradient-to-r from-yellow-400/20 to-amber-500/20 border-yellow-400/30 text-yellow-200'
              }`}>
                {activeSlide.subtitle}
              </div>
            )}
            <h1 className={`font-bold bg-gradient-to-r ${
              activeSlide.isEvent
                ? 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl from-yellow-200 via-yellow-400 to-amber-500 drop-shadow-[0_6px_30px_rgba(251,191,36,0.6)]'
                : 'text-5xl sm:text-6xl md:text-7xl lg:text-7xl from-yellow-400 via-amber-300 to-orange-400 drop-shadow-2xl'
            } bg-clip-text text-transparent text-balance leading-tight`}>
              {activeSlide.title}
            </h1>
            {activeSlide.description ? (
              <p className={`mt-6 md:mt-8 leading-relaxed ${
                activeSlide.isEvent
                  ? 'text-lg md:text-xl lg:text-xl text-white font-medium drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] max-w-2xl'
                  : 'text-lg md:text-xl lg:text-xl text-slate-200 drop-shadow-lg max-w-xl'
              }`}>
                {activeSlide.description}
              </p>
            ) : null}
            {activeSlide.cta ? (
              <div className="mt-10 md:mt-12 flex flex-col sm:flex-row gap-4">
                {activeSlide.isEvent ? (
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <Button
                      asChild
                      size="lg"
                      className="text-base md:text-lg px-8 py-6 font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-slate-900 rounded-xl shadow-[0_10px_40px_rgba(251,191,36,0.4)] hover:shadow-[0_15px_50px_rgba(251,191,36,0.6)] transform hover:scale-105 transition-all duration-300 border-2 border-yellow-300"
                    >
                      <Link href={activeSlide.cta.href}>
                        <span className="flex items-center gap-2">
                          {activeSlide.cta.label}
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </span>
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="text-sm md:text-base px-6 py-6 font-semibold bg-white/10 hover:bg-white/20 text-white border-2 border-white/60 hover:border-white rounded-xl shadow-xl"
                    >
                      <Link href="/events">
                        <span className="flex items-center gap-2">
                          View All Events
                        </span>
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button
                      asChild
                      size="lg"
                      className="font-semibold bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-slate-900 rounded-lg shadow-lg hover:shadow-yellow-400/25"
                    >
                      <Link href={activeSlide.cta.href}>Learn More</Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="font-semibold bg-white/10 hover:bg-white/20 text-white border-white/30 rounded-lg"
                    >
                      <Link href="/book-session">{activeSlide.cta.label}</Link>
                    </Button>
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-8 md:bottom-10 flex items-center justify-center gap-3 z-20">
        {slides.map((_, i) => {
          const isActive = i === index;
          return (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={isActive ? "true" : undefined}
              onClick={() => setIndex(i)}
              className={cn(
                "h-2.5 rounded-full transition-all duration-300",
                isActive ? "bg-accent w-8" : "bg-white/40 hover:bg-white/60 w-2.5"
              )}
            />
          );
        })}
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between z-20 px-4 md:px-8">
        <button
          aria-label="Previous slide"
          className="pointer-events-auto h-14 w-14 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all duration-300 backdrop-blur-sm border border-white/20"
          onClick={() => setIndex((i) => (i - 1 + count) % count)}
        >
          <span className="sr-only">Previous</span>
          <svg width="28" height="28" viewBox="0 0 24 24" className="fill-current" aria-hidden="true">
            <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path>
          </svg>
        </button>
        <button
          aria-label="Next slide"
          className="pointer-events-auto h-14 w-14 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all duration-300 backdrop-blur-sm border border-white/20"
          onClick={() => setIndex((i) => (i + 1) % count)}
        >
          <span className="sr-only">Next</span>
          <svg width="28" height="28" viewBox="0 0 24 24" className="fill-current" aria-hidden="true">
            <path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6z"></path>
          </svg>
        </button>
      </div>
    </section>
  );
}

export default HeroSliderAlways;

