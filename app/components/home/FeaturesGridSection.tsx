"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Compare } from "@/components/ui/compare";
import { cn } from "@/lib/utils";
import useSWR from "swr";
import ParentTestimonialCoverflow from "@/components/home/ParentTestimonialCoverflow";

/* ---------------- Fetcher ---------------- */

const fetcher = (url: string) =>
  fetch(url).then((res) => res.json());

/* ---------------- Component ---------------- */

export default function FeaturesGridSection() {
  const [sliderProgress, setSliderProgress] = React.useState(50);

  /* ---------- Fetch Before/After ---------- */

  const { data, isLoading } = useSWR(
    "/api/testimonials/before-after",
    fetcher,
    { revalidateOnFocus: false }
  );

  const story = data?.story;
  const isStoryPending = typeof data === "undefined" || isLoading;
  const hasStoryPanel = isStoryPending || Boolean(story);
  const beforeText = (story?.before || "").trim();
  const afterText = (story?.after || "").trim();
  const beforeActive = sliderProgress >= 50;
  const afterActive = !beforeActive;

  const storyTextSettings = React.useMemo(() => {
    const maxLength = Math.max(beforeText.length, afterText.length);

    if (maxLength <= 180) {
      return {
        textClass: "text-base sm:text-lg leading-relaxed",
        clampLines: 10,
      };
    }

    if (maxLength <= 340) {
      return {
        textClass: "text-sm sm:text-base leading-relaxed",
        clampLines: 13,
      };
    }

    return {
      textClass: "text-xs sm:text-sm leading-relaxed",
      clampLines: 16,
    };
  }, [afterText.length, beforeText.length]);

  const sharedTextClampStyle = React.useMemo<React.CSSProperties>(
    () => ({
      display: "-webkit-box",
      WebkitBoxOrient: "vertical",
      WebkitLineClamp: storyTextSettings.clampLines,
      overflow: "hidden",
      hyphens: "auto",
      overflowWrap: "anywhere",
      wordBreak: "break-word",
      textWrap: "pretty",
      maxWidth: "34ch",
      lineHeight: 1.32,
    }),
    [storyTextSettings.clampLines]
  );

  /* ---------- Story has separate before/after fields ---------- */

  return (
    <section
      id="features"
      className="py-20 theme-bg-dark relative overflow-hidden"
    >
      <div className="container mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold theme-text-light mb-4">
            Why Choose ACHARYA?
          </h2>
          <p className="text-lg theme-text-muted max-w-2xl mx-auto">
            Discover the powerful capabilities that make our educational
            platform exceptional
          </p>
        </div>

        {/* Layout */}
        <div className={hasStoryPanel ? "grid lg:grid-cols-2 gap-12 items-center" : ""}>
          {/* LEFT SIDE - parent testimonials in a 3D carousel
              (replaces the old standalone "What Parents Say About Us" section). */}
          <ParentTestimonialCoverflow className={hasStoryPanel ? "w-full min-w-0 lg:-top-6" : "mx-auto w-full max-w-2xl"} />

          {/* RIGHT SIDE - BEFORE / AFTER STORY */}
          {hasStoryPanel && (
            <div className="h-full flex items-center">
              {isStoryPending ? (
                <div className="relative w-full max-w-md mx-auto animate-pulse">
                  <div className="bg-slate-800 border border-slate-700 rounded-3xl p-3 shadow-xl">
                    <div className="h-[420px] rounded-2xl bg-slate-700/60"></div>
                    <div className="mt-4 space-y-2 text-center">
                      <div className="h-4 bg-slate-700 rounded w-40 mx-auto"></div>
                      <div className="h-3 bg-slate-700 rounded w-28 mx-auto"></div>
                    </div>
                  </div>
                </div>
              ) : story ? (
                <div className="relative w-full max-w-md mx-auto">
                  <div className="relative rounded-3xl p-[1px] bg-gradient-to-br from-[#F4BE4A]/32 via-slate-600/15 to-sky-400/25 shadow-[0_18px_48px_rgba(2,6,23,0.56)]">
                    <div className="relative rounded-[22px] bg-slate-800/95 border border-slate-700/70 p-3 overflow-hidden">
                      <div className="pointer-events-none absolute inset-0 rounded-[22px] bg-[radial-gradient(100%_70%_at_50%_0%,rgba(148,163,184,0.14),transparent_65%)]" />
                    <div className={cn(
                      "pointer-events-none absolute top-5 left-5 z-50 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] transition-all duration-300 backdrop-blur-md",
                      beforeActive
                        ? "border border-[#F3BA49]/85 bg-[#EE8F1B]/34 text-[#FFF1D8] shadow-[0_0_0_1px_rgba(243,186,73,0.2),0_0_24px_rgba(238,143,27,0.24)]"
                        : "border border-[#F3BA49]/55 bg-[#EE8F1B]/16 text-[#FFE2B0]/90"
                    )}>
                      Before
                    </div>
                    <div className={cn(
                      "pointer-events-none absolute top-5 right-5 z-50 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] transition-all duration-300 backdrop-blur-md",
                      afterActive
                        ? "border border-blue-300/85 bg-blue-500/34 text-blue-50 shadow-[0_0_0_1px_rgba(147,197,253,0.25),0_0_24px_rgba(59,130,246,0.24)]"
                        : "border border-blue-300/55 bg-blue-500/16 text-blue-100/90"
                    )}>
                      After
                    </div>
                      <div className="relative">
                        <Compare
                          className="w-full h-[420px] rounded-2xl"
                          slideMode="drag"
                          mobileTapToggle
                          centerSafeZonePx={24}
                          onProgressChange={setSliderProgress}
                          autoplay
                          autoplayDuration={8000}
                          firstContent={
                            <div className={cn(
                              "relative h-full w-full overflow-hidden bg-gradient-to-br from-[#7A3E06] via-[#8F4708] to-[#241A15] pl-5 pr-16 pt-14 pb-6 sm:pl-6 sm:pr-20 transition-all duration-300",
                              beforeActive ? "saturate-110 brightness-105" : "saturate-90 brightness-90"
                            )}>
                              <p
                                className={cn(
                                  "mx-auto text-[#FFF0D5] whitespace-pre-wrap antialiased",
                                  storyTextSettings.textClass
                                )}
                                style={sharedTextClampStyle}
                              >
                                {beforeText || "Before story not available."}
                              </p>
                              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#7A3E06]/95 via-[#8F4708]/72 to-transparent" />
                            </div>
                          }
                          secondContent={
                            <div className={cn(
                              "relative h-full w-full overflow-hidden bg-gradient-to-br from-blue-950 via-sky-950 to-slate-900 pl-16 pr-5 pt-14 pb-6 sm:pl-20 sm:pr-6 transition-all duration-300",
                              afterActive ? "saturate-110 brightness-105" : "saturate-90 brightness-90"
                            )}>
                              <p
                                className={cn(
                                  "mx-auto text-blue-50 whitespace-pre-wrap antialiased",
                                  storyTextSettings.textClass
                                )}
                                style={sharedTextClampStyle}
                              >
                                {afterText || "After story not available."}
                              </p>
                              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-blue-950/95 via-sky-950/60 to-transparent" />
                            </div>
                          }
                        />
                        <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_0_0_1px_rgba(148,163,184,0.18),inset_0_-90px_130px_rgba(2,6,23,0.5)]" />
                        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(140%_100%_at_50%_120%,rgba(2,6,23,0.72),transparent_60%)]" />
                      </div>
                      <p className="text-center text-[11px] uppercase tracking-[0.18em] text-slate-400 mt-3">
                        Drag or Tap to Compare
                      </p>
                    </div>
                  </div>
                  <div className="relative mt-3 rounded-2xl border border-slate-700/80 bg-gradient-to-r from-slate-900/86 via-slate-900/78 to-blue-950/42 py-3 text-center space-y-1 overflow-hidden">
                    <div className="pointer-events-none absolute left-0 top-0 h-full w-16 rounded-l-2xl bg-gradient-to-r from-[#F0B63F]/18 to-transparent"></div>
                    <div className="relative">
                    <p className="text-white text-sm">
                      {story.studentName || "Student"}
                    </p>
                    {story.grade && (
                      <p className="text-[#F0B63F] text-xs uppercase tracking-widest">
                        {story.grade}
                      </p>
                    )}
                    {story.school && (
                      <p className="text-blue-300 text-xs uppercase tracking-widest">
                        {story.school}
                      </p>
                    )}
                    {!story.grade && !story.school && (
                      <p className="text-[#F0B63F] text-xs uppercase tracking-widest">
                        Student Story
                      </p>
                    )}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
