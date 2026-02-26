"use client";

import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
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
    ],
    []
  );

  /* ---------- Random 4 Features (Hydration Safe) ---------- */

  const [features, setFeatures] = React.useState<
    typeof allFeatures
  >([]);

  React.useEffect(() => {
    const shuffled = [...allFeatures]
      .sort(() => 0.5 - Math.random())
      .slice(0, 4);

    setFeatures(shuffled);
  }, [allFeatures]);

  /* ---------- Fetch Before/After ---------- */

  const { data, isLoading } = useSWR(
    "/api/testimonials/before-after",
    fetcher,
    { revalidateOnFocus: false }
  );

  const story = data?.story;

  // Debug logging
  React.useEffect(() => {
    if (story) {
      console.log("Story data:", story);
      console.log("School:", story.school);
      console.log("Grade:", story.grade);
    }
  }, [story]);

  /* ---------- Map School to Logo ---------- */
  const getSchoolLogo = (school: string | null | undefined): string => {
    if (!school) return "/testimonial-logos/default.png";
    
    const schoolLower = school.toLowerCase();
    
    // Map school names to logo files
    if (schoolLower.includes("folsom")) return "/testimonial-logos/folsom.png";
    if (schoolLower.includes("granite bay")) return "/testimonial-logos/GraniteBayHighSchool.png";
    if (schoolLower.includes("raleigh") || schoolLower.includes("phoenix")) return "/testimonial-logos/Raleigh_Charter__NC__Phoenix_logo.png.webp";
    if (schoolLower.includes("rocklin")) return "/testimonial-logos/rocklin.jpg";
    if (schoolLower.includes("vista") || schoolLower.includes("del lago")) return "/testimonial-logos/VistaDelLagoHS-GraphicsTransparent.png";
    if (schoolLower.includes("west park")) return "/testimonial-logos/WestParkHighSchool.png";
    
    return "/testimonial-logos/default.png";
  };

  /* ---------- Parse Before/After Text ---------- */
  const parseBeforeAfter = (text: string) => {
    if (!text) return { before: "", after: "" };

    // Look for "after" keyword (case insensitive) to split the text
    const afterMatch = text.match(/\b(after|now)\b/i);
    
    if (afterMatch && afterMatch.index !== undefined) {
      // Split at the "after" or "now" keyword
      const before = text.substring(0, afterMatch.index).trim();
      // Include everything from "after"/"now" onwards in the after section
      const after = text.substring(afterMatch.index).trim();
      
      // Only return if both parts have substantial content (more than just the keyword)
      if (before.length > 10 && after.length > 10) {
        return { before, after };
      }
    }

    // Fallback: return all as before if no clear split found
    return { before: text, after: "" };
  };

  const parsedStory = story ? parseBeforeAfter(story.beforeAfter) : { before: "", after: "" };

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
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* LEFT SIDE - FEATURES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.length > 0 &&
              features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
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
                </motion.div>
              ))}
          </div>

          {/* RIGHT SIDE - BEFORE / AFTER STORY */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="h-full flex items-center max-h-500px"
          >
            {isLoading ? (
              <div className="relative w-full max-w-md mx-auto max-h-full">
                {/* Skeleton Avatar - Fixed Outside */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-20">
                  <div className="w-24 h-24 rounded-full bg-slate-700 border-4 border-slate-600"></div>
                </div>

                {/* Skeleton Card */}
                <div className="relative bg-slate-800 border border-slate-700 rounded-3xl shadow-xl text-center animate-pulse h-[500px] flex flex-col">
                  
                  {/* Skeleton Top */}
                  <div className="pt-20 px-8 pb-4">
                    <div className="w-8 h-8 bg-slate-700 rounded mx-auto"></div>
                  </div>

                  {/* Skeleton Middle (Scrollable area) */}
                  <div className="flex-1 px-8 overflow-hidden">
                    <div className="space-y-3">
                      <div className="h-4 bg-slate-700 rounded w-full"></div>
                      <div className="h-4 bg-slate-700 rounded w-5/6 mx-auto"></div>
                      <div className="h-4 bg-slate-700 rounded w-4/6 mx-auto"></div>
                    </div>
                  </div>

                  {/* Skeleton Bottom */}
                  <div className="px-8 pb-10 pt-4">
                    <div className="w-16 h-[1px] bg-slate-700 mx-auto mb-6"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-700 rounded w-32 mx-auto"></div>
                      <div className="h-3 bg-slate-700 rounded w-24 mx-auto"></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : story ? (
              <div className="relative w-full max-w-md mx-auto max-h-full">

                {/* Circular Avatar - Fixed Outside Scroll */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-20">
                  <div className="w-24 h-24 rounded-full bg-white border-4 border-yellow-400 flex items-center justify-center shadow-lg overflow-hidden">
                    <img
                      src={getSchoolLogo(story.school)}
                      alt={story.school || "School Logo"}
                      className="w-full h-full object-contain p-1"
                      onError={(e) => {
                        e.currentTarget.src = "/testimonial-logos/default.png";
                      }}
                    />
                  </div>
                </div>

                {/* Card - Fixed Height with Scrollable Middle Section */}
                <div className="relative bg-slate-800 border border-slate-700 rounded-3xl shadow-xl text-center h-[500px] flex flex-col">

                  {/* Top Section - Fixed (Quote) */}
                  {/* <div className="pt-20 px-8 pb-4">
                    <div className="text-yellow-400/15 text-6xl font-serif">
                      "
                    </div>
                  </div> */}

                  {/* Middle Section - Scrollable (Before/After Content Only) */}
                  <div className="pt-20 flex-1 overflow-y-auto px-8 scrollbar-hide">
                    <div className="space-y-6">
                    {/* Before Section */}
                    {parsedStory.before && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-red-500/30"></div>
                          <span className="text-red-400 text-xs font-semibold uppercase tracking-wider px-3 py-1 bg-red-500/10 rounded-full border border-red-500/20">
                            Before
                          </span>
                          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-red-500/30"></div>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed bg-red-500/5 border border-red-500/10 rounded-xl p-4">
                          {parsedStory.before}
                        </p>
                      </div>
                    )}

                    {/* After Section */}
                    {parsedStory.after && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-green-500/30"></div>
                          <span className="text-green-400 text-xs font-semibold uppercase tracking-wider px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                            After
                          </span>
                          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-green-500/30"></div>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed bg-green-500/5 border border-green-500/10 rounded-xl p-4">
                          {parsedStory.after}
                        </p>
                      </div>
                    )}

                    {/* Fallback if no sections parsed */}
                    {!parsedStory.before && !parsedStory.after && (
                      <p className="text-slate-200 text-base leading-relaxed">
                        {story.beforeAfter}
                      </p>
                    )}
                    </div>
                  </div>

                  {/* Bottom Section - Fixed (Divider + Footer) */}
                  <div className="px-8 pb-10 pt-4">
                    {/* Divider */}
                    <div className="w-16 h-[1px] bg-slate-600 mx-auto mb-6"></div>

                    {/* Footer */}
                    <div className="space-y-1">
                      <p className="text-white font-small text-sm">
                        {story.studentName || "Student"}
                      </p>
                      {story.grade && (
                        <p className="text-yellow-400 text-xs uppercase tracking-widest">
                          {story.grade}
                        </p>
                      )}
                      {story.school && (
                        <p className="text-yellow-400 text-xs uppercase tracking-widest">
                          {story.school}
                        </p>
                      )}
                      {!story.grade && !story.school && (
                        <p className="text-yellow-400 text-xs uppercase tracking-widest">
                          Student Story
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full text-center bg-slate-800 border border-slate-700 rounded-3xl p-10 h-[calc(2*180px+24px)] flex flex-col items-center justify-center">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Real Transformation
                </h3>
                <p className="text-slate-400 italic text-sm">
                  No transformation story featured yet.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
