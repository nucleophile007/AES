"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Slide = {
  title: string;
  subtitle?: string;
  description?: string;
  imageSrc: string;
  imageAlt: string;
  cta?: { label: string; href: string };
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

  React.useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % count);
    }, intervalMs);
    return () => clearInterval(id);
  }, [count, intervalMs]);

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

  const startX = React.useRef<number | null>(null);
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
      <div className="absolute inset-0">
        {slides.map((slide, i) => {
          const isActive = i === index;
          return (
            <div
              key={slide.title + i}
              aria-hidden={!isActive}
              className={cn(
                "absolute inset-0 transition-opacity duration-1000 ease-in-out",
                isActive ? "opacity-100" : "opacity-0"
              )}
            >
              <img
                src={slide.imageSrc || "/placeholder.svg?height=1080&width=1920&query=professional%20education%20hero"}
                alt={slide.imageAlt || ""}
                className="absolute inset-0 w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

              <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-10 lg:px-16 py-12 md:py-16 lg:py-20 z-10">
                <div className="max-w-2xl ml-8 md:ml-16 mt-8 md:mt-16">
                  {slide.subtitle && <div className="hero-badge mb-4 md:mb-6 bg-gradient-to-r from-yellow-400/20 to-amber-500/20 border-yellow-400/30 text-yellow-200">{slide.subtitle}</div>}
                  <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-7xl font-bold bg-gradient-to-r from-yellow-400 via-amber-300 to-orange-400 bg-clip-text text-transparent text-balance leading-tight drop-shadow-2xl">
                    {slide.title}
                  </h1>
                  {slide.description ? (
                    <p className="mt-6 md:mt-8 text-lg md:text-xl lg:text-xl text-slate-200 leading-relaxed max-w-xl drop-shadow-lg">
                      {slide.description}
                    </p>
                  ) : null}
                  {slide.cta ? (
                    <div className="mt-10 md:mt-12 flex flex-col sm:flex-row gap-4">
                      <Button
                        asChild
                        size="lg"
                        className="font-semibold bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-slate-900 rounded-lg shadow-lg hover:shadow-yellow-400/25"
                      >
                        <Link href={slide.cta.href}>Learn More</Link>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="font-semibold bg-white/10 hover:bg-white/20 text-white border-white/30 rounded-lg backdrop-blur-sm"
                      >
                        <Link href="/book-session">{slide.cta.label}</Link>
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
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



