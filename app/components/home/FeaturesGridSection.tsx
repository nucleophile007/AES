"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Compare } from "@/components/ui/compare";
import { cn } from "@/lib/utils";
import useSWR from "swr";
import {
  IconAdjustmentsBolt,
  IconCloud,
  IconCurrencyDollar,
  IconEaseInOut,
  IconHeart,
  IconRouteAltLeft,
  IconTerminal2,
} from "@tabler/icons-react";

/* ---------------- Fetcher ---------------- */

const fetcher = (url: string) =>
  fetch(url).then((res) => res.json());

/* ---------------- Component ---------------- */

export default function FeaturesGridSection() {
  /* ---------- Features (24/7 removed) ---------- */

  const allFeatures = React.useMemo(
    () => [
      {
        title: "Personalized Learning",
        description:
          "Customized educational approaches tailored to each student's unique learning style and pace.",
        icon: <IconTerminal2 size={28} stroke={1.5} />,
      },
      {
        title: "Expert Mentoring",
        description:
          "One-on-one guidance from experienced educators with proven track records.",
        icon: <IconEaseInOut size={28} stroke={1.5} />,
      },
      {
        title: "Affordable Excellence",
        description:
          "Premium educational services at competitive rates with flexible payment options.",
        icon: <IconCurrencyDollar size={28} stroke={1.5} />,
      },
      {
        title: "Consistent Progress",
        description:
          "Regular assessments and progress tracking to ensure continuous improvement.",
        icon: <IconCloud size={28} stroke={1.5} />,
      },
      {
        title: "Flexible Scheduling",
        description:
          "Online and in-person sessions that adapt to your busy family schedule.",
        icon: <IconRouteAltLeft size={28} stroke={1.5} />,
      },
      {
        title: "Success Guarantee",
        description:
          "We're committed to your child's academic success with measurable results.",
        icon: <IconAdjustmentsBolt size={28} stroke={1.5} />,
      },
      {
        title: "College Preparation",
        description:
          "Comprehensive preparation for standardized tests and college applications.",
        icon: <IconHeart size={28} stroke={1.5} />,
      },
      {
        title: "Interactive Learning",
        description:
          "Engaging hands-on activities and dynamic teaching methods that make learning exciting.",
        icon: <IconTerminal2 size={28} stroke={1.5} />,
      },
    ],
    []
  );
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
  const visibleFeatures = React.useMemo(
    () => (hasStoryPanel ? allFeatures.slice(0, 4) : allFeatures),
    [allFeatures, hasStoryPanel]
  );

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
          <Badge className="mb-4 bg-yellow-400/10 text-yellow-400 border-yellow-400/20">
            Why Choose Us
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold theme-text-light mb-4">
            Why Choose ACHARYA?
          </h2>
          <p className="text-lg theme-text-muted max-w-2xl mx-auto">
            Discover the powerful capabilities that make our educational
            platform exceptional
          </p>
        </div>

        {/* Layout */}
        <div className={hasStoryPanel ? "grid lg:grid-cols-2 gap-12 items-start" : ""}>
          {/* FEATURES */}
          <div className={hasStoryPanel ? "grid grid-cols-1 sm:grid-cols-2 gap-6" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"}>
            {visibleFeatures.map((feature) => (
                <div
                  key={feature.title}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/30 hover:border-yellow-400/30 transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center text-gray-900 mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold theme-text-light mb-3">
                    {feature.title}
                  </h3>
                  <p className="theme-text-muted text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
          </div>

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
                          autoplayDuration={4500}
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
