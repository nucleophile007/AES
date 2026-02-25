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
            className="h-full flex items-center"
          >
            {isLoading ? (
              <div className="relative w-full max-w-md mx-auto">
                {/* Skeleton Card */}
                <div className="relative bg-slate-800 border border-slate-700 rounded-3xl pt-20 pb-10 px-8 shadow-xl text-center animate-pulse">
                  
                  {/* Skeleton Avatar */}
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                    <div className="w-24 h-24 rounded-full bg-slate-700 border-4 border-slate-600"></div>
                  </div>

                  {/* Skeleton Quote */}
                  <div className="w-8 h-8 bg-slate-700 rounded mx-auto mb-4"></div>

                  {/* Skeleton Text Lines */}
                  <div className="space-y-3 mb-8">
                    <div className="h-4 bg-slate-700 rounded w-full"></div>
                    <div className="h-4 bg-slate-700 rounded w-5/6 mx-auto"></div>
                    <div className="h-4 bg-slate-700 rounded w-4/6 mx-auto"></div>
                  </div>

                  {/* Skeleton Divider */}
                  <div className="w-16 h-[1px] bg-slate-700 mx-auto mb-6"></div>

                  {/* Skeleton Footer */}
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-700 rounded w-32 mx-auto"></div>
                    <div className="h-3 bg-slate-700 rounded w-24 mx-auto"></div>
                  </div>
                </div>
              </div>
            ) : story ? (
              <div className="relative w-full max-w-md mx-auto">

                {/* Card */}
                <div className="relative bg-slate-800 border border-slate-700 rounded-3xl pt-20 pb-10 px-8 shadow-xl text-center">

                  {/* Circular Avatar */}
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                    <div className="w-24 h-24 rounded-full bg-slate-700 border-4 border-yellow-400 flex items-center justify-center text-slate-400 shadow-lg">
                      <svg
                        className="w-10 h-10 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Quote mark */}
                  <div className="text-yellow-400/15 text-6xl font-serif mb-4">
                    “
                  </div>

                  {/* Story Text */}
                  <p className="text-slate-200 text-base leading-relaxed mb-8">
                    {story.beforeAfter}
                  </p>

                  {/* Divider */}
                  <div className="w-16 h-[1px] bg-slate-600 mx-auto mb-6"></div>

                  {/* Footer */}
                  <div className="space-y-1">
                    <p className="text-white font-medium text-sm">
                      {story.studentName || "Student"}
                    </p>
                    <p className="text-yellow-400 text-xs uppercase tracking-widest">
                      Transformation Story
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full text-center bg-slate-800 border border-slate-700 rounded-3xl p-10">
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
