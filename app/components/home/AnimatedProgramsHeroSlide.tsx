"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Microscope,
  GraduationCap,
  Trophy,
} from "lucide-react";

export interface ProgramStandItem {
  id: string;
  number: string;
  title: string;
  badge: string;
  tagline: string;
  description: string;
  tags: string[];
  ctaText: string;
  href: string;
  bodyColor: string;
  circleColor: string;
  glowColor: string;
  icon: React.ComponentType<{ className?: string }>;
}

const programs: ProgramStandItem[] = [
  {
    id: "tutoring",
    number: "1",
    title: "Academic Tutoring",
    badge: "1-on-1 Mastery",
    tagline: "Learn. Understand. Succeed.",
    description:
      "Hyper-personalized 1-on-1 coaching and AP mastery across Math, Sciences, and Humanities to build deep conceptual intuition and elevate GPA.",
    tags: ["AP & Honors Mastery", "Math & Sciences", "Custom Plans"],
    ctaText: "Explore Tutoring",
    href: "/academictutoring",
    bodyColor: "#f16047", // Infographic Coral Red
    circleColor: "#921e0c", // Infographic Dark Red
    glowColor: "rgba(241, 96, 71, 0.55)",
    icon: BookOpen,
  },
  {
    id: "explorers",
    number: "2",
    title: "AES Explorers",
    badge: "Research Mentorship",
    tagline: "Explore. Discover. Innovate.",
    description:
      "Student-driven scientific research guided directly by university faculty. Author original papers, present at IEEE MIT URTC, and pioneer innovations.",
    tags: ["Univ. Faculty Mentors", "IEEE MIT URTC", "Publications"],
    ctaText: "Explore Research",
    href: "/aes-explorers",
    bodyColor: "#fba91f", // Infographic Golden Amber
    circleColor: "#895804", // Infographic Dark Amber
    glowColor: "rgba(251, 169, 31, 0.55)",
    icon: Microscope,
  },
  {
    id: "achieve",
    number: "3",
    title: "UAchieve",
    badge: "College Admissions",
    tagline: "Prepare Today. Achieve Tomorrow.",
    description:
      "Comprehensive college planning and admissions roadmaps tailored for Tier-1 medical feeder programs and Ivy League universities with strategic essay mentorship.",
    tags: ["Tier-1 Feeders", "Ivy Strategy", "Essay Mentorship"],
    ctaText: "Explore College Prep",
    href: "/collegeprep",
    bodyColor: "#6ea66b", // Infographic Sage Green
    circleColor: "#355534", // Infographic Dark Forest Green
    glowColor: "rgba(110, 166, 107, 0.55)",
    icon: GraduationCap,
  },
  {
    id: "champions",
    number: "4",
    title: "AES Champions",
    badge: "STEM & Olympiads",
    tagline: "Think. Solve. Excel.",
    description:
      "Intensive competition coaching for AMC 10/12, AIME, USACO, USABO, and prestigious STEM competitions to develop problem-solving mastery and national honors.",
    tags: ["AMC & AIME Math", "USACO & USABO", "Olympiads"],
    ctaText: "Explore Competitions",
    href: "/aes-champions",
    bodyColor: "#3bc6e2", // Infographic Vibrant Cyan
    circleColor: "#14697a", // Infographic Deep Cyan
    glowColor: "rgba(59, 198, 226, 0.55)",
    icon: Trophy,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const standVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

export function AnimatedProgramsHeroSlide() {
  return (
    <section
      className="relative flex min-h-[100svh] w-full flex-col justify-between overflow-y-auto lg:overflow-hidden select-none"
      style={{
        background:
          "linear-gradient(180deg, #b4d2f7 0%, #b4d2f7 32%, #a4c4e8 50%, #87a7d1 66%, #627fa6 80%, #3a5074 91%, hsl(220 45% 16%) 100%)",
      }}
      aria-label="Flagship Programs List"
    >
      {/* Ambient Lighting Blurs Matching Background */}
      <div className="pointer-events-none absolute -right-24 -top-10 h-[450px] w-[450px] rounded-full bg-blue-400/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-0 h-[450px] w-[450px] rounded-full bg-indigo-500/25 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />

      {/* Main Full-Width Container */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1700px] flex-1 flex-col justify-between pl-6 sm:pl-10 md:pl-14 lg:pl-16 xl:pl-20 pr-3 sm:pr-6 md:pr-8 lg:pr-10 xl:pr-12 pt-24 sm:pt-28 md:pt-30 lg:pt-32 pb-6 sm:pb-8 lg:pb-10">
        
        {/* Header Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1.5 pb-2.5 border-b border-slate-700/15 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.18em] bg-white/85 border border-slate-300/80 text-slate-800 shadow-sm backdrop-blur-md">
                <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
                ACHARYA Flagship Pathways
              </span>
              <span className="text-[11px] font-medium text-slate-700 hidden md:inline-block">
                Comprehensive curriculum engineered for student excellence
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 font-serif italic">
              Our 4 Specialized Academic Programs
            </h2>
          </div>

          <div className="text-xs font-mono font-bold text-slate-700 hidden sm:block">
            <span className="text-emerald-700 font-extrabold text-base">04</span> Standup Pathways
          </div>
        </div>

        {/* ─── 4 STANDUP BANNER FLAG INFOGRAPHICS (BIGGER & MORE ATTRACTIVE) ─── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 flex items-end justify-center w-full py-1.5 sm:py-2.5 translate-x-1 sm:translate-x-3 lg:translate-x-5"
        >
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-6 lg:gap-4 xl:gap-8 justify-items-center items-end max-w-[1550px]">
            {programs.map((item) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.id}
                  variants={standVariants}
                  className="w-full flex justify-center"
                >
                  {/* ─── SINGLE STANDUP BANNER UNIT ─── */}
                  <div className="relative flex flex-col items-start w-full max-w-[280px] sm:max-w-[290px] lg:max-w-[305px] xl:max-w-[340px] 2xl:max-w-[355px] group">
                    
                    {/* Atmospheric Ambient Glow behind banner on hover */}
                    <div
                      style={{ backgroundColor: item.bodyColor }}
                      className="pointer-events-none absolute inset-x-4 top-4 bottom-12 rounded-3xl opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-35"
                    />

                    {/* Top Bar + Curved Elbow + Left Pole Assembly */}
                    <div className="relative w-full z-10">
                      
                      {/* 1. Top Horizontal Hanging Rod (Beveled Extruded Metal) */}
                      <div className="relative ml-[16px] h-3.5 sm:h-4 bg-gradient-to-b from-[#5c6068] via-[#35383d] to-[#1c1d1f] rounded-r-[3px] shadow-md border-t border-[#767b86]/60 flex items-center z-20">
                        {/* Chrome / Dark Steel Right End Cap */}
                        <div className="absolute -right-1.5 top-[-1px] bottom-[-1px] w-1.5 bg-gradient-to-b from-[#7a7e87] via-[#2f3135] to-[#151618] rounded-r-sm border-l border-white/20 shadow-sm" />
                      </div>

                      {/* 2. Vertical Pole along Left Edge (Brushed Metallic Tube with Center Reflection) */}
                      <div className="absolute left-0 top-0 bottom-0 w-[11px] bg-gradient-to-r from-[#323438] via-[#5c6068] via-45% to-[#1c1d1f] z-20 shadow-md">
                        {/* 90-degree curved elbow joining to top bar */}
                        <div className="absolute -top-[2px] left-0 w-[18px] h-[18px] rounded-tl-[12px] border-t-[4px] border-l-[4px] border-[#383a3f] pointer-events-none" />
                      </div>

                      {/* 3. Vertical Fabric Sleeve (Heavy-Duty Clamp strip holding flag) */}
                      <div className="absolute left-[11px] top-3.5 sm:top-4 bottom-0 w-2.5 bg-gradient-to-r from-[#3f4146] to-[#2e3034] z-10 shadow-inner border-r border-black/30" />

                      {/* 4. Banner Canvas Flag with Top-Left Curved Cutout Notch */}
                      <Link
                        href={item.href}
                        className="block relative ml-[21px] group/canvas cursor-pointer focus:outline-none"
                      >
                        <div
                          style={{
                            backgroundColor: item.bodyColor,
                            maskImage:
                              "radial-gradient(circle at 0 0, transparent 28px, black 29px)",
                            WebkitMaskImage:
                              "radial-gradient(circle at 0 0, transparent 28px, black 29px)",
                          }}
                          className="relative w-full h-[370px] sm:h-[400px] lg:h-[420px] xl:h-[455px] p-4 sm:p-5 flex flex-col items-center justify-between shadow-2xl transition-all duration-300 group-hover:-translate-y-2.5 overflow-hidden"
                        >
                          {/* ─── Fabric Shading & Realistic Surface Sheen ─── */}
                          {/* Vertical fabric soft drape reflection */}
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/15 via-white/10 to-black/20" />
                          {/* Top lighting sheen */}
                          <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/20 to-transparent" />
                          {/* Bottom shadow falloff */}
                          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/30 to-transparent" />

                          {/* ─── Top Section: Medallion, Title, Divider & Description ─── */}
                          <div className="relative z-10 flex flex-col items-center w-full">
                            
                            {/* 3D Embossed Medallion Circle with Number */}
                            <div
                              style={{ backgroundColor: item.circleColor }}
                              className="w-[62px] h-[62px] sm:w-[72px] sm:h-[72px] xl:w-[82px] xl:h-[82px] rounded-full flex items-center justify-center border-2 border-white/25 shadow-[inset_0_3px_8px_rgba(0,0,0,0.6),0_6px_16px_rgba(0,0,0,0.3)] mt-2 sm:mt-3 transition-transform duration-300 group-hover/canvas:scale-110"
                            >
                              <span className="font-sans font-black text-white text-3xl sm:text-4xl xl:text-5xl leading-none drop-shadow-md">
                                {item.number}
                              </span>
                            </div>

                            {/* Program Category Badge Pill with Icon */}
                            <div className="mt-2.5 sm:mt-3 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/20 border border-white/25 text-white text-[10px] sm:text-[11px] font-bold tracking-wide backdrop-blur-sm shadow-sm">
                              <Icon className="w-3 h-3 text-white/90" />
                              <span>{item.badge}</span>
                            </div>

                            {/* Bold Title */}
                            <h3 className="mt-2 text-center font-black text-white text-lg sm:text-xl xl:text-2xl tracking-tight leading-snug font-sans drop-shadow-md px-1">
                              {item.title}
                            </h3>

                            {/* Divider Line (Tapered subtle shadow bar) */}
                            <div className="w-[85%] h-[2px] bg-gradient-to-r from-transparent via-black/35 to-transparent mx-auto my-2.5 sm:my-3" />

                            {/* Tagline quote */}
                            <p className="text-xs sm:text-[13px] font-serif italic text-white text-center font-bold px-1 drop-shadow-sm line-clamp-1">
                              &ldquo;{item.tagline}&rdquo;
                            </p>

                            {/* Description Narrative */}
                            <p className="mt-2 text-[11px] sm:text-xs xl:text-[12.5px] text-white/95 leading-relaxed text-center px-1 font-normal line-clamp-3">
                              {item.description}
                            </p>
                          </div>

                          {/* ─── Bottom Section: Tags & Action CTA ─── */}
                          <div className="relative z-10 w-full flex flex-col items-center pb-1">
                            {/* Feature Tags */}
                            <div className="flex flex-wrap items-center justify-center gap-1.5 mb-2.5 sm:mb-3">
                              {item.tags.slice(0, 3).map((tag, tIdx) => (
                                <span
                                  key={tIdx}
                                  className="px-2.5 py-0.5 rounded-full bg-black/25 text-white text-[10px] sm:text-[10.5px] font-medium border border-white/20 whitespace-nowrap shadow-sm backdrop-blur-xs"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>

                            {/* Prominent High-Contrast CTA Button */}
                            <span className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-white text-slate-900 group-hover/canvas:bg-slate-950 group-hover/canvas:text-white text-xs sm:text-[13px] font-black transition-all duration-300 shadow-md group-hover/canvas:shadow-xl group-hover/canvas:scale-105">
                              <span>{item.ctaText}</span>
                              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/canvas:translate-x-1" />
                            </span>
                          </div>

                        </div>
                      </Link>
                    </div>

                    {/* ─── Lower Pole extending to Base ─── */}
                    <div className="w-[11px] h-9 sm:h-11 bg-gradient-to-r from-[#323438] via-[#5c6068] via-45% to-[#1c1d1f] shadow-sm ml-0" />

                    {/* ─── 3D Weighted Floor Disc Base (Centered directly beneath Left Pole) ─── */}
                    <div className="relative w-40 sm:w-44 xl:w-48 h-7 sm:h-8 -ml-[74px] sm:-ml-[82px] xl:-ml-[90px] -mt-1 flex items-center justify-center">
                      {/* Layered Floor Contact Shadows */}
                      <div className="absolute inset-x-1 -bottom-1.5 h-3 rounded-[100%] bg-black/60 blur-[4px]" />
                      <div className="absolute -inset-x-2 -bottom-3 h-5 rounded-[100%] bg-black/30 blur-[8px]" />
                      
                      {/* 3D Metallic Disc Base */}
                      <div className="w-full h-full rounded-[100%] bg-gradient-to-b from-[#70747d] via-[#3c3e44] to-[#18191b] border border-[#838792]/50 shadow-2xl relative overflow-hidden flex items-center justify-center">
                        {/* Concentric Brushed Ring Highlights */}
                        <div className="absolute inset-x-2 top-0.5 h-3.5 rounded-[100%] bg-gradient-to-b from-[#9ba0aa] via-[#636770] to-[#3a3c42] opacity-90" />
                        <div className="absolute inset-x-5 top-1.5 h-2 rounded-[100%] border-t border-white/30 opacity-60" />
                        
                        {/* Center Pole Socket Grommet */}
                        <div className="relative z-10 w-4 h-2 rounded-[100%] bg-[#121315] border border-[#5c6068]" />
                      </div>
                    </div>

                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Bottom Footer Line */}
        <div className="flex items-center justify-between text-[11px] text-slate-700 pt-1.5 border-t border-slate-700/15 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">ACHARYA Educational Services</span>
            <span className="hidden sm:inline-block">• Academic Tutoring • AES Explorers • UAchieve • AES Champions</span>
          </div>
          <Link
            href="/book-session"
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors flex items-center gap-1"
          >
            <span>Book a Free Session</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </section>
  );
}

export default AnimatedProgramsHeroSlide;



