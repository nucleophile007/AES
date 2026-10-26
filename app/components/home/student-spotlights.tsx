"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Medal, Trophy, Sparkles } from "lucide-react";
import megaphoneHand from "@/assets/megaphone-hand.png";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

interface Spotlight {
  name: string;
  school: string;
  competition: string;
  date: string;
  topic: string;
  achievement: string;
  icon: "medal" | "trophy";
  accent: {
    badgeBg: string;
    badgeBorder: string;
    badgeText: string;
    quoteText: string;
    podiumTop: string;
    podiumFront: string;
    podiumDeep: string;
    bulbColor: string;
  };
}

const SPOTLIGHTS: Spotlight[] = [
  {
    name: "Nithila Shanmugham",
    school: "Granite Bay High School",
    competition: "ISRC",
    date: "Sept 2025",
    topic:
      "A Parametric Study of Human Balance with Delays using Delay Differential Equations",
    achievement: "Finalist · Top 20",
    icon: "medal",
    accent: {
      badgeBg: "bg-amber-50",
      badgeBorder: "border-amber-300",
      badgeText: "text-amber-800",
      quoteText: "text-amber-900",
      podiumTop: "#fef08a",
      podiumFront: "#f59e0b",
      podiumDeep: "#b45309",
      bulbColor: "#f59e0b",
    },
  },
  {
    name: "Atreya Kulkarni",
    school: "Vista del Lago High School",
    competition: "Sac STEM Fair",
    date: "March 2026",
    topic:
      "A Geometric Approach for Thickness Prediction in Incremental Sheet Forming",
    achievement: "Citadel Innovation Prize",
    icon: "trophy",
    accent: {
      badgeBg: "bg-sky-50",
      badgeBorder: "border-sky-300",
      badgeText: "text-[#073b6b]",
      quoteText: "text-[#073b6b]",
      podiumTop: "#bae6fd",
      podiumFront: "#0284c7",
      podiumDeep: "#073b6b",
      bulbColor: "#f59e0b",
    },
  },
  {
    name: "Nithya Reddy Pathi",
    school: "Vista del Lago High School",
    competition: "USABO",
    date: "2025",
    topic: "Elite national recognition in the biological sciences",
    achievement: "USABO '26 Semi-Finalist",
    icon: "medal",
    accent: {
      badgeBg: "bg-emerald-50",
      badgeBorder: "border-emerald-300",
      badgeText: "text-emerald-800",
      quoteText: "text-emerald-900",
      podiumTop: "#a7f3d0",
      podiumFront: "#10b981",
      podiumDeep: "#047857",
      bulbColor: "#f59e0b",
    },
  },
];

/** Layout of the three lamp + card units on the 1920x1080 canvas, evenly spaced with 80px gaps. */
const UNITS = [
  { x: 660, cordLen: 370, cardTop: 590, delay: 0.55 },
  { x: 1140, cordLen: 254, cardTop: 454, delay: 0.85 },
  { x: 1620, cordLen: 138, cardTop: 318, delay: 1.15 },
];

const CARD_W = 400;

/** 1920x1080 slide scaled to fit any viewport. */
export function SpotlightSlide({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth || window.innerWidth;
      const h = el.clientHeight || window.innerHeight;
      if (w > 0 && h > 0) {
        setScale(Math.min(w / 1920, h / 1080));
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className={`font-spot relative h-full w-full overflow-hidden ${className || ""}`}
      style={{
        background:
          "linear-gradient(180deg, #b4d2f7 0%, #b4d2f7 35%, #a8c8ec 65%, #94b9e4 100%)",
      }}
    >
      {/* Background Architectural Blueprint Grid Lines (Matching Site Theme) */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,59,107,0.04)_1px,transparent_1px),linear-gradient(180deg,rgba(7,59,107,0.04)_1px,transparent_1px)] bg-[size:44px_44px] pointer-events-none" />

      {/* Ambient Lighting Blurs Matching Theme */}
      <div className="pointer-events-none absolute -right-24 -top-10 h-[450px] w-[450px] rounded-full bg-blue-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-0 h-[450px] w-[450px] rounded-full bg-indigo-500/20 blur-3xl" />

      <style>{`
        @keyframes spotSwing {
          0%, 100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(2.4deg);
          }
          75% {
            transform: rotate(-2.4deg);
          }
        }
        .spot-swing {
          transform-origin: 200px 0px;
          animation-name: spotSwing;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
      `}</style>

      {/* Scaled canvas positioned with clear vertical offset so title is 100% below navbar */}
      <div
        className="absolute left-1/2 top-[54%] sm:top-[55%]"
        style={{
          width: 1920,
          height: 1080,
          transform: `translate(-50%, -47%) scale(${scale})`,
          visibility: scale === 0 ? "hidden" : "visible",
        }}
      >
        <SlideCanvas />
      </div>
    </div>
  );
}

function SlideCanvas() {
  const imgSrc =
    typeof megaphoneHand === "string"
      ? megaphoneHand
      : (megaphoneHand as any)?.src || "/megaphone-hand.png";

  return (
    <div className="relative h-full w-full">
      {/* ─── ACHARYA SITE THEME BEAM: SHIFTED LEFT TO AVOID OVERLAPPING CARDS ─── */}
      <motion.svg
        className="absolute inset-0"
        width="1920"
        height="1080"
        viewBox="0 0 1920 1080"
        initial={{ opacity: 0, scaleX: 0.45 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 1.1, ease: EASE_OUT }}
        style={{ transformOrigin: "360px 660px" }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id="beam-g"
            gradientUnits="userSpaceOnUse"
            x1="360"
            y1="760"
            x2="1920"
            y2="1050"
          >
            <stop offset="0" stopColor="#008fa8" />
            <stop offset="0.32" stopColor="#073b6b" />
            <stop offset="1" stopColor="#0c1e38" />
          </linearGradient>
        </defs>

        {/* Soft floor shadow under the megaphone shifted left */}
        <ellipse
          cx="310"
          cy="1052"
          rx="270"
          ry="18"
          fill="rgba(7, 59, 107, 0.16)"
        />

        {/* Dynamic Megaphone Projection Beam originating at x=360 to leave clear space for Card 1 */}
        <path
          d="M 360 570
             C 490 520, 620 480, 770 450
             C 910 415, 1000 330, 1080 240
             C 1135 165, 1160 75, 1175 0
             L 1920 0
             L 1920 1080
             C 1810 985, 1680 955, 1520 905
             C 1380 862, 1260 888, 1120 852
             C 980 822, 870 842, 740 812
             C 590 782, 470 802, 360 748
             Z"
          fill="url(#beam-g)"
        />
      </motion.svg>

      {/* ─── TITLE & EDITORIAL BADGE: MATCHING ACHARYA THEME ─── */}
      <motion.div
        className="absolute left-[90px] top-[180px] max-w-[550px]"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.35, ease: EASE_OUT }}
      >
        <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[12px] font-bold uppercase tracking-[0.18em] bg-white border border-slate-300 text-slate-800 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          ACHARYA Student Spotlights
        </span>
        <h1 className="mt-2 text-[60px] font-black tracking-tight text-slate-900 leading-[1.05]">
          Student Spotlights
        </h1>
        <p className="mt-2 text-[26px] font-serif italic text-[#073b6b] font-semibold">
          Research &amp; Competition Excellence
        </p>
      </motion.div>

      {/* ─── DYNAMIC MEGAPHONE SHIFTED LEFT (NO OVERLAP WITH CARD 1) ─── */}
      <motion.div
        className="absolute bottom-[6px] left-[-125px]"
        initial={{ opacity: 0, x: -150, rotate: -7 }}
        animate={{ opacity: 1, x: 0, rotate: 0 }}
        transition={{ type: "spring", stiffness: 90, damping: 14, delay: 0.15 }}
      >
        <motion.img
          src={imgSrc}
          alt=""
          width={620}
          height={613}
          className="block drop-shadow-2xl"
          animate={{ rotate: [0, -1.6, 1.2, 0], y: [0, -7, 0] }}
          transition={{
            duration: 3.4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.6,
          }}
        />
      </motion.div>

      {/* ─── THREE HANGING LAMPS + CONES + STUDENT CARDS ─── */}
      {SPOTLIGHTS.map((data, i) => {
        const unit = UNITS[i];
        if (!unit) return null;
        return (
          <SpotlightUnit key={data.name} unit={unit} data={data} index={i} />
        );
      })}
    </div>
  );
}

function SpotlightUnit({
  unit,
  data,
  index,
}: {
  unit: (typeof UNITS)[number];
  data: Spotlight;
  index: number;
}) {
  const bulbCenterY = unit.cordLen + 46;
  const baseY = unit.cardTop + 170;
  const AchIcon = data.icon === "medal" ? Medal : Trophy;

  return (
    <div
      className="pointer-events-none absolute top-0 h-full"
      style={{ left: unit.x - CARD_W / 2, width: CARD_W }}
    >
      {/* ─── LINKED HANGING LAMP & LIGHT CONE (SWINGING AS ONE HARMONIOUS UNIT) ─── */}
      <motion.div
        className="absolute top-0 left-0 w-full"
        initial={{ y: -260, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 110,
          damping: 13,
          delay: unit.delay,
        }}
      >
        <div
          className="spot-swing"
          style={{
            transformOrigin: "200px 0px",
            animationDelay: `${unit.delay + 0.8}s`,
            animationDuration: `${5.2 + index * 0.6}s`,
          }}
        >
          <svg
            width={CARD_W}
            height={baseY + 40}
            viewBox={`0 0 ${CARD_W} ${baseY + 40}`}
            className="overflow-visible"
          >
            <defs>
              {/* Radial glow for the bulb */}
              <radialGradient id={`bulb-glow-${index}`}>
                <stop offset="0" stopColor={data.accent.bulbColor} stopOpacity="0.75" />
                <stop offset="1" stopColor={data.accent.bulbColor} stopOpacity="0" />
              </radialGradient>

              {/* Luminous light cone beam - direct hex colors for reliable cross-browser rendering */}
              <linearGradient id={`cone-g-${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#fde047" stopOpacity="0.95" />
                <stop offset="0.4" stopColor="#fde047" stopOpacity="0.70" />
                <stop offset="0.85" stopColor="#facc15" stopOpacity="0.25" />
                <stop offset="1" stopColor="#facc15" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            {/* 1. Light Cone Beam (Starts directly at bulb center Y, physically attached to bulb) */}
            <polygon
              points={`182,${bulbCenterY} 218,${bulbCenterY} ${CARD_W},${baseY} 0,${baseY}`}
              fill={`url(#cone-g-${index})`}
            />

            {/* 2. Hanging electrical cord */}
            <line
              x1="200"
              y1="0"
              x2="200"
              y2={unit.cordLen + 8}
              stroke="#0f172a"
              strokeWidth="4"
            />

            {/* 3. Halo bulb glow circle */}
            <circle
              cx="200"
              cy={bulbCenterY}
              r="52"
              fill={`url(#bulb-glow-${index})`}
            />

            {/* 4. Socket fixture */}
            <path
              d={`M 183 ${unit.cordLen} L 217 ${unit.cordLen} L 224 ${unit.cordLen + 18} L 176 ${unit.cordLen + 18} Z`}
              fill="#0f172a"
            />

            {/* 5. Glowing amber bulb (rendered on top of the beam's apex) */}
            <circle
              cx="200"
              cy={bulbCenterY}
              r="27"
              fill={data.accent.bulbColor}
            />

            {/* 6. Bulb specular highlight */}
            <circle
              cx="192"
              cy={unit.cordLen + 38}
              r="8"
              fill="#ffffff"
              opacity="0.5"
            />
          </svg>
        </div>
      </motion.div>

      {/* ─── CONTENT CARD (100% SOLID OPAQUE WHITE, ZERO TRANSPARENCY) + NUMBER + PODIUM ─── */}
      <motion.div
        className="absolute flex flex-col items-center"
        style={{ top: unit.cardTop, width: CARD_W }}
        initial={{ opacity: 0, y: 46 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, delay: unit.delay + 0.55, ease: EASE_OUT }}
      >
        <motion.article
          className="pointer-events-auto rounded-3xl px-7 pb-6 pt-7 border border-slate-200"
          style={{
            backgroundColor: "#ffffff",
            boxShadow: "0 24px 60px -12px rgba(7, 59, 107, 0.28), 0 6px 20px rgba(0, 0, 0, 0.1)",
          }}
          whileHover={{ y: -8 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
        >
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[15px] font-bold uppercase tracking-[0.08em] ${data.accent.badgeBg} ${data.accent.badgeBorder} ${data.accent.badgeText}`}
          >
            <AchIcon className="h-4 w-4" />
            {data.achievement}
          </span>
          <h3 className="mt-3 text-[32px] font-extrabold leading-[1.15] tracking-tight text-[#0f172a]">
            {data.name}
          </h3>
          <p className="mt-1 text-[17px] font-semibold text-[#475569]">
            {data.competition} · {data.date} · {data.school}
          </p>
          <p className={`mt-3 line-clamp-3 text-[19px] font-medium italic leading-snug ${data.accent.quoteText}`}>
            &ldquo;{data.topic}&rdquo;
          </p>
        </motion.article>

        {/* Number with Drop Shadow */}
        <motion.div
          className="z-10 -mt-1 flex h-[88px] items-center text-[92px] font-black leading-none text-white"
          style={{ textShadow: "0 10px 24px rgba(7, 59, 107, 0.55)" }}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 14,
            delay: unit.delay + 0.75,
          }}
        >
          0{index + 1}
        </motion.div>

        {/* Thematic 3D Isometric Podium in Acharya Palette */}
        <motion.svg
          width="250"
          height="140"
          viewBox="0 0 250 140"
          className="-mt-3"
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: unit.delay + 0.85, ease: EASE_OUT }}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={`pod-front-${index}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={data.accent.podiumTop} />
              <stop offset="1" stopColor={data.accent.podiumFront} />
            </linearGradient>
          </defs>
          <ellipse cx="128" cy="128" rx="112" ry="9" fill="rgba(7, 59, 107, 0.22)" />
          <polygon points="28,46 222,46 246,20 52,20" fill={data.accent.podiumTop} />
          <polygon points="28,46 222,46 222,118 28,118" fill={`url(#pod-front-${index})`} />
          <polygon points="222,46 246,20 246,92 222,118" fill={data.accent.podiumDeep} />
        </motion.svg>
      </motion.div>
    </div>
  );
}

export const StudentSpotlights = SpotlightSlide;
export default SpotlightSlide;
