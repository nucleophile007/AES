"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Medal, Trophy } from "lucide-react";

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
  message: string;
  accent: {
    border: string;
    glow: string;
    text: string;
    iconStroke: string;
    achievementGradient: string;
    circleBorder: string;
  };
}

const spotlights: StudentSpotlight[] = [
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
    message:
      "From TRANSFORM'25 to the Sac STEM Fair, your dedication to aerospace engineering continues to inspire us. Congratulations on this well-deserved win! We wish you boundless success as you continue your journey with ACHARYA.",
    accent: {
      border: "border-blue-200/90 hover:border-blue-400",
      glow: "shadow-2xl shadow-blue-500/10",
      text: "text-blue-700",
      iconStroke: "text-blue-600",
      achievementGradient: "from-blue-700 via-blue-600 to-cyan-600",
      circleBorder: "border-blue-300/80",
    },
  },
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
    message:
      "Congratulations to Nithila, a premed aspirant, on being a finalist at ISRC-2025. ACHARYA is proud of your achievement and dedication during the IGNITE'25 research program, which is truly inspirational.",
    accent: {
      border: "border-amber-200/90 hover:border-amber-400",
      glow: "shadow-2xl shadow-amber-500/10",
      text: "text-amber-700",
      iconStroke: "text-amber-600",
      achievementGradient: "from-amber-600 via-amber-500 to-yellow-600",
      circleBorder: "border-amber-300/80",
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
    message:
      "A huge congratulations to our student on being named a USABO Semifinalist! It is incredibly rewarding to see the strategic study plan designed by ACHARYA translated into such elite national recognition. Your discipline and mastery of the biological sciences are truly inspiring.",
    accent: {
      border: "border-emerald-200/90 hover:border-emerald-400",
      glow: "shadow-2xl shadow-emerald-500/10",
      text: "text-emerald-700",
      iconStroke: "text-emerald-600",
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

        {/* Centered Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-3 sm:mb-4 flex flex-col items-center text-center px-1 border-b border-slate-700/15 pb-2.5 flex-shrink-0"
        >
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black italic text-slate-900 tracking-tight leading-tight">
            Student Spotlights
          </h2>
          <p className="mt-1 text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] text-slate-700">
            Research &amp; Competition Excellence
          </p>
        </motion.div>

        {/* ─── 3 POSTERS SIDE-BY-SIDE (ALL 3 VISIBLE AT ONCE) ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 flex-1 items-stretch pb-2">
          {spotlights.map((s, i) => {
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

                {/* 1. Logo → Conference → Achievement → Student → Project Title */}
                <div className="relative z-10 flex flex-col items-center text-center">
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

                  <h3 className={`mt-3 text-2xl sm:text-3xl font-black uppercase tracking-tight leading-tight ${s.accent.text}`}>
                    {s.competition}
                    <span className="ml-2 align-middle text-xs sm:text-sm font-bold normal-case tracking-normal text-slate-500">
                      {s.competitionDate}
                    </span>
                  </h3>

                  <div className="mt-2 flex items-center gap-1.5">
                    <AchIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${s.accent.iconStroke}`} />
                    <span
                      className={`bg-gradient-to-r ${s.accent.achievementGradient} bg-clip-text text-xs sm:text-sm font-black uppercase tracking-wider text-transparent`}
                    >
                      {s.achievement}
                    </span>
                  </div>

                  <p className="mt-2 font-serif text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                    {s.studentName}
                  </p>
                  <p className="mt-0.5 text-[11px] sm:text-xs font-semibold text-slate-600">
                    {s.grade} · {s.school}
                  </p>

                  <p
                    className={`mt-3 font-serif text-base sm:text-lg lg:text-xl italic font-bold ${s.accent.text} leading-snug line-clamp-3`}
                  >
                    &ldquo;{s.topic}&rdquo;
                  </p>
                </div>

                {/* 2. Commendation Quote */}
                <div className="relative z-10 mt-3 pl-3 border-l-2 border-slate-300/80 bg-slate-50/60 rounded-r-lg p-2.5">
                  <p className="text-xs sm:text-[13px] italic leading-relaxed text-slate-700 font-medium line-clamp-3">
                    {s.message}
                  </p>
                </div>

                {/* 3. Poster Footer / Signature */}
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
