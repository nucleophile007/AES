"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Award, Medal, Trophy, Microscope, Sparkles, Quote } from "lucide-react";

interface StudentSpotlight {
  logo: string;
  studentName: string;
  grade: string;
  school: string;
  competition: string;
  competitionDate: string;
  topic: string;
  achievement: string;
  achievementIcon: "medal" | "trophy";
  competitionIcon: "microscope" | "award";
  message: string;
  accent: {
    border: string;
    glow: string;
    text: string;
    badgeBg: string;
    badgeBorder: string;
    iconStroke: string;
    dividerFrom: string;
    achievementGradient: string;
    circleBorder: string;
  };
}

const spotlights: StudentSpotlight[] = [
  {
    logo: "/program-image/isrc.png",
    studentName: "Nithila Shanmugham",
    grade: "Current Senior",
    school: "Granite Bay High School",
    competition: "ISRC",
    competitionDate: "Sept 2025",
    topic:
      "A Parametric Study of Human Balance with Delays using Delay Differential Equations",
    achievement: "FINALIST · TOP 20",
    achievementIcon: "medal",
    competitionIcon: "microscope",
    message:
      "Congratulations to Nithila, a premed aspirant, on being a finalist at ISRC-2025. ACHARYA is proud of your achievement and dedication during the IGNITE'25 research program, which is truly inspirational.",
    accent: {
      border: "border-amber-200/90 hover:border-amber-400",
      glow: "shadow-2xl shadow-amber-500/10",
      text: "text-amber-700",
      badgeBg: "bg-amber-50",
      badgeBorder: "border-amber-300",
      iconStroke: "text-amber-600",
      dividerFrom: "from-amber-500",
      achievementGradient: "from-amber-600 via-amber-500 to-yellow-600",
      circleBorder: "border-amber-300/80",
    },
  },
  {
    logo: "/program-image/sac.jpg",
    studentName: "Atreya Kulkarni",
    grade: "Current Junior",
    school: "Vista del Lago High School",
    competition: "Sac STEM Fair",
    competitionDate: "March 2026",
    topic: "A Geometric Approach for Thickness Prediction in Incremental Sheet Forming",
    achievement: "CITADEL INNOVATION PRIZE",
    achievementIcon: "trophy",
    competitionIcon: "award",
    message:
      "From TRANSFORM'25 to the Sac STEM Fair, your dedication to aerospace engineering continues to inspire us. Congratulations on this well-deserved win! We wish you boundless success as you continue your journey with ACHARYA.",
    accent: {
      border: "border-blue-200/90 hover:border-blue-400",
      glow: "shadow-2xl shadow-blue-500/10",
      text: "text-blue-700",
      badgeBg: "bg-blue-50",
      badgeBorder: "border-blue-300",
      iconStroke: "text-blue-600",
      dividerFrom: "from-blue-500",
      achievementGradient: "from-blue-700 via-blue-600 to-cyan-600",
      circleBorder: "border-blue-300/80",
    },
  },
  {
    logo: "/program-image/usabo2.jpeg",
    studentName: "Nithya Reddy Pathi",
    grade: "Current Junior",
    school: "Vista del Lago High School",
    competition: "USABO",
    competitionDate: "2025",
    topic: "Elite national recognition in the biological sciences",
    achievement: "USABO'26 SEMI-FINALIST",
    achievementIcon: "medal",
    competitionIcon: "microscope",
    message:
      "A huge congratulations to our student on being named a USABO Semifinalist! It is incredibly rewarding to see the strategic study plan designed by ACHARYA translated into such elite national recognition. Your discipline and mastery of the biological sciences are truly inspiring.",
    accent: {
      border: "border-emerald-200/90 hover:border-emerald-400",
      glow: "shadow-2xl shadow-emerald-500/10",
      text: "text-emerald-700",
      badgeBg: "bg-emerald-50",
      badgeBorder: "border-emerald-300",
      iconStroke: "text-emerald-600",
      dividerFrom: "from-emerald-500",
      achievementGradient: "from-emerald-700 via-emerald-600 to-teal-700",
      circleBorder: "border-emerald-300/80",
    },
  },
];

export function StudentSpotlights() {
  return (
    <div
      className="relative flex h-full w-full flex-col justify-between overflow-y-auto px-4 pb-6 pt-20 sm:px-6 sm:pt-24 sm:pb-8 lg:px-8"
      style={{
        background:
          "linear-gradient(180deg, #b4d2f7 0%, #b4d2f7 38%, #a8c6eb 55%, #8baad3 70%, #6683a8 83%, #3f567d 93%, hsl(220 45% 20%) 100%)",
      }}
    >
      {/* Ambient Lighting Blurs Matching Background */}
      <div className="pointer-events-none absolute -right-20 top-0 h-96 w-96 rounded-full bg-amber-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-0 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />

      {/* Main Container */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-between">
        
        {/* Editorial Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2 px-1 border-b border-slate-700/15 pb-2.5 flex-shrink-0"
        >
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.16em] bg-white/80 border border-slate-300/80 text-slate-800 shadow-sm backdrop-blur-md">
              <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
              National Student Spotlights
            </span>
            <h2 className="mt-1 font-serif text-2xl sm:text-3xl lg:text-4xl font-black italic text-slate-900 tracking-tight leading-tight">
              Research &amp; Competition Excellence
            </h2>
          </div>
          <p className="max-w-xs text-[11px] sm:text-xs font-medium leading-relaxed text-slate-700 sm:text-right hidden sm:block">
            Celebrating the curiosity, rigor, and imagination behind every national achievement.
          </p>
        </motion.div>

        {/* ─── 3 POSTERS SIDE-BY-SIDE (ALL 3 VISIBLE AT ONCE) ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 flex-1 items-stretch pb-2">
          {spotlights.map((s, i) => {
            const CompIcon = s.competitionIcon === "microscope" ? Microscope : Award;
            const AchIcon = s.achievementIcon === "medal" ? Medal : Trophy;

            return (
              <motion.article
                key={s.studentName}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-[1.75rem] border ${s.accent.border} bg-white/95 ${s.accent.glow} p-5 sm:p-6 transition-all duration-300 hover:shadow-2xl`}
              >
                {/* Top Subtle Current Color Glow */}
                <div className="absolute inset-x-8 top-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-60" />
                <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-400/10 blur-2xl transition-transform duration-700 group-hover:scale-125" />

                {/* 1. Header Badges: Competition Tag + Achievement Award */}
                <div className="relative z-10 flex items-center justify-between gap-2 flex-wrap">
                  <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${s.accent.badgeBg} border ${s.accent.badgeBorder} ${s.accent.text}`}
                  >
                    <CompIcon className="h-3 w-3" />
                    <span>{s.competition} · {s.competitionDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <AchIcon className={`h-4 w-4 ${s.accent.iconStroke}`} />
                    <span
                      className={`bg-gradient-to-r ${s.accent.achievementGradient} bg-clip-text text-[11px] sm:text-xs font-black uppercase tracking-wider text-transparent`}
                    >
                      {s.achievement}
                    </span>
                  </div>
                </div>

                {/* 2. Center Poster Seal & Student Identifiers */}
                <div className="relative z-10 my-3 sm:my-4 flex flex-col items-center text-center">
                  <div
                    className={`relative h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-full border-4 ${s.accent.circleBorder} bg-slate-50 shadow-lg transition-transform duration-500 group-hover:scale-105`}
                  >
                    <Image
                      src={s.logo}
                      alt={s.competition}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>

                  <h3 className="mt-3 font-serif text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                    {s.studentName}
                  </h3>
                  <p className="mt-0.5 text-[11px] sm:text-xs font-semibold text-slate-600">
                    {s.grade} · {s.school}
                  </p>
                </div>

                {/* 3. Research Topic */}
                <div className="relative z-10 text-center px-1">
                  <p
                    className={`font-serif text-sm sm:text-[15px] italic font-bold ${s.accent.text} leading-snug line-clamp-2`}
                  >
                    &ldquo;{s.topic}&rdquo;
                  </p>
                </div>

                {/* 4. Commendation Quote */}
                <div className="relative z-10 mt-3 pl-3 border-l-2 border-slate-300/80 bg-slate-50/60 rounded-r-lg p-2.5">
                  <p className="text-xs sm:text-[13px] italic leading-relaxed text-slate-700 font-medium line-clamp-3 sm:line-clamp-4">
                    {s.message}
                  </p>
                </div>

                {/* 5. Poster Footer / Signature */}
                <div className="relative z-10 mt-3 pt-2.5 border-t border-slate-200/70 flex items-center justify-between">
                  <span className={`text-[10px] font-bold tracking-[0.2em] ${s.accent.text}`}>
                    — ACHARYA TEAM
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                    HONOR ROLL
                  </span>
                </div>
              </motion.article>
            );
          })}
        </div>

      </div>
    </div>
  );
}

export default StudentSpotlights;
