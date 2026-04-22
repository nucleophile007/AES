"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type Slide = {
  title: string;
  subtitle?: string;
  description?: string;
  imageSrc: string;
  imageAlt: string;
  cta?: { label: string; href: string };
  showCtaWhenHidden?: boolean;
  secondaryCta?: { label: string; href: string };
  hideSecondaryCta?: boolean;
  hideContent?: boolean;
  visualStyle?: "default" | "poster";
  customContent?: React.ReactNode;
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
  const [isHovered, setIsHovered] = React.useState(false);
  const count = slides.length;
  const enableNav = count > 1;
  const activeSlide = slides[index];
  const isPosterSlide = activeSlide?.visualStyle === "poster";
  const hideSlideContent = activeSlide?.hideContent === true;
  const showCutoutCta = hideSlideContent && !!activeSlide?.cta && activeSlide?.showCtaWhenHidden === true;

  React.useEffect(() => {
    if (!enableNav || isHovered) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % count);
    }, intervalMs);
    return () => clearInterval(id);
  }, [count, enableNav, intervalMs, isHovered]);

  React.useEffect(() => {
    if (count === 0) return;
    if (index >= count) setIndex(0);
  }, [count, index]);

  React.useEffect(() => {
    if (typeof window === "undefined" || count === 0) return;

    // Preload adjacent slides so poster images appear instantly when users navigate.
    const preloadIndices = [
      index,
      (index + 1) % count,
      (index + 2) % count,
      (index - 1 + count) % count,
    ];
    const seen = new Set<string>();

    preloadIndices.forEach((slideIndex) => {
      const src = slides[slideIndex]?.imageSrc;
      if (!src || seen.has(src)) return;
      seen.add(src);
      const img = new window.Image();
      img.decoding = "async";
      img.src = src;
    });
  }, [count, index, slides]);

  const startX = React.useRef<number | null>(null);

  if (!activeSlide) return null;

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!enableNav) return;
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
    if (!enableNav) return;
    startX.current = e.clientX;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!enableNav) return;
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
      className={cn("relative w-full h-screen overflow-hidden bg-[#03133a]", className)}
      tabIndex={0}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      <div
        key={activeSlide.title + index}
        className="absolute inset-0 transition-opacity duration-700 ease-in-out opacity-100"
      >
        {activeSlide.customContent ? (
          <div className="absolute inset-0">
            {activeSlide.customContent}
          </div>
        ) : (
          <>
            {isPosterSlide && (
              <Image
                src={activeSlide.imageSrc || "/placeholder.svg?height=1080&width=1920&query=professional%20education%20hero"}
                alt=""
                aria-hidden="true"
                fill
                className="object-cover scale-110 blur-2xl brightness-[0.45] saturate-125"
                quality={40}
                sizes="100vw"
              />
            )}
            <Image
              src={activeSlide.imageSrc || "/placeholder.svg?height=1080&width=1920&query=professional%20education%20hero"}
              alt={activeSlide.imageAlt || "Hero image"}
              fill
              className={cn(
                "transition-transform duration-700",
                isPosterSlide ? "object-contain object-[center_4.5rem] sm:object-[center_5rem]" : "object-cover",
                isPosterSlide && "saturate-[1.08] contrast-[1.06] brightness-[1.03]"
              )}
              priority={index === 0}
              quality={isPosterSlide ? 72 : 85}
              sizes="100vw"
            />

            <div
              className={cn(
                "absolute inset-0",
                isPosterSlide
                  ? hideSlideContent
                    ? "bg-transparent"
                    : "bg-gradient-to-t from-black/80 via-black/35 to-black/5"
                  : "bg-gradient-to-r from-black/60 via-black/30 to-transparent"
              )}
            />
            {isPosterSlide && !hideSlideContent && (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_78%,rgba(251,191,36,0.30),transparent_42%)]" />
            )}

            {!hideSlideContent && (
              <div
                className={cn(
                  "absolute inset-0 flex flex-col px-6 md:px-10 lg:px-16 py-12 md:py-16 lg:py-20 z-10",
                  isPosterSlide ? "justify-end" : "justify-center"
                )}
              >
                <div
                  className={cn(
                    isPosterSlide
                      ? "max-w-2xl ml-2 sm:ml-8 md:ml-12 mb-4 md:mb-8"
                      : "max-w-2xl ml-8 md:ml-16 mt-8 md:mt-16"
                  )}
                >
                  {activeSlide.subtitle && (
                    <div
                      className={`hero-badge mb-4 md:mb-6 ${
                        isPosterSlide
                          ? "bg-black/45 border-white/25 text-white/95 font-semibold text-xs md:text-sm px-4 py-2 backdrop-blur-md tracking-[0.12em] uppercase"
                          : "bg-gradient-to-r from-yellow-400/20 to-amber-500/20 border-yellow-400/30 text-yellow-200"
                      }`}
                    >
                      {activeSlide.subtitle}
                    </div>
                  )}
                  <h1
                    className={`font-bold bg-gradient-to-r ${
                      isPosterSlide
                        ? "text-4xl sm:text-5xl md:text-6xl lg:text-6xl from-white via-yellow-200 to-amber-300 drop-shadow-[0_10px_30px_rgba(0,0,0,0.7)]"
                        : "text-5xl sm:text-6xl md:text-7xl lg:text-7xl from-yellow-400 via-amber-300 to-orange-400 drop-shadow-2xl"
                    } bg-clip-text text-transparent text-balance leading-tight`}
                  >
                    {activeSlide.title}
                  </h1>
                  {activeSlide.description ? (
                    <p
                      className={`mt-6 md:mt-8 leading-relaxed ${
                        isPosterSlide
                          ? "text-lg md:text-xl text-slate-100 font-medium drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] max-w-xl"
                          : "text-lg md:text-xl lg:text-xl text-slate-200 drop-shadow-lg max-w-xl"
                      }`}
                    >
                      {activeSlide.description}
                    </p>
                  ) : null}
                  {activeSlide.cta ? (
                    <div className="mt-10 md:mt-12 flex flex-col sm:flex-row gap-4">
                      <Button
                        asChild
                        size="lg"
                        className={cn(
                          "font-semibold bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-slate-900 rounded-lg shadow-lg hover:shadow-yellow-400/25",
                          isPosterSlide &&
                            "text-base md:text-lg px-7 py-6 rounded-xl shadow-[0_10px_40px_rgba(245,158,11,0.4)] hover:shadow-[0_14px_44px_rgba(245,158,11,0.6)]"
                        )}
                      >
                        <Link href={activeSlide.cta.href}>
                          {isPosterSlide ? activeSlide.cta.label : "Learn More"}
                        </Link>
                      </Button>
                      {!activeSlide.hideSecondaryCta && (
                        <Button
                          asChild
                          variant="outline"
                          size="lg"
                          className="font-semibold bg-white/10 hover:bg-white/20 text-white border-white/30 rounded-lg"
                        >
                          <Link href={activeSlide.secondaryCta?.href || "/book-session"}>
                            {activeSlide.secondaryCta?.label || activeSlide.cta.label}
                          </Link>
                        </Button>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showCutoutCta && activeSlide.cta && (
        <div className="pointer-events-none absolute inset-x-0 bottom-12 md:bottom-14 z-30 flex justify-center px-4">
          <Button
            asChild
            className="pointer-events-auto text-sm md:text-base px-6 py-5 font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-slate-900 rounded-xl shadow-[0_8px_26px_rgba(245,158,11,0.42)] hover:shadow-[0_10px_32px_rgba(245,158,11,0.58)] border-2 border-yellow-300"
          >
            <Link href={activeSlide.cta.href}>{activeSlide.cta.label}</Link>
          </Button>
        </div>
      )}

      {enableNav && (
        <div
          className={cn(
            "absolute inset-x-0 flex items-center justify-center gap-3 z-20",
            showCutoutCta ? "bottom-3 md:bottom-4" : "bottom-8 md:bottom-10"
          )}
        >
          {slides.map((_, i) => {
            const isActive = i === index;
            return (
              <button
                type="button"
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
      )}

      {enableNav && (
        <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between z-20 px-4 md:px-8">
          <button
            type="button"
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
            type="button"
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
      )}
    </section>
  );
}

export default HeroSliderAlways;
