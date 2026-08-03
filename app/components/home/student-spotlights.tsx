// "use client";
// import Image from "next/image";

// import { Award, Quote, Medal, Trophy, Microscope } from "lucide-react";

// interface StudentSpotlight {
//   logo: string;
//   studentName: string;
//   grade: string;
//   school: string;
//   competition: string;
//   competitionDate: string;
//   topic: string;
//   achievement: string;
//   achievementIcon: "medal" | "trophy";
//   competitionIcon: "microscope" | "award";
//   message: string;
//   accent: {
//     border: string;
//     glow: string;
//     text: string;
//     badgeBg: string;
//     badgeBorder: string;
//     iconStroke: string;
//     quoteColor: string;
//     dividerFrom: string;
//   };
// }

// const spotlights: StudentSpotlight[] = [
//   {
//     logo: "/program-image/isrc.png",
//     studentName: "Nithila Shanmugham",
//     grade: "Current Senior",
//     school: "Granite Bay High School",
//     competition: "ISRC",
//     competitionDate: "Sept 2025",
//     topic: "A Parametric Study of Human Balance with Delays using Delay Differential Equations",
//     achievement: "FINALIST · TOP 20",
//     achievementIcon: "medal",
//     competitionIcon: "microscope",
//     message:
//       "Congratulations to Nithila, a premed aspirant, on being a finalist at ISRC-2025. ACHARYA is proud of your achievement and dedication during the IGNITE'25 research program, which is truly inspirational.",
//     accent: {
//       border: "border-amber-500/40",
//       glow: "shadow-[0_0_60px_-15px_rgba(245,158,11,0.35)]",
//       text: "text-amber-400",
//       badgeBg: "bg-amber-500/15",
//       badgeBorder: "border-amber-500/40",
//       iconStroke: "text-amber-400",
//       quoteColor: "text-amber-400/30",
//       dividerFrom: "from-amber-400",
//     },
//   },
//   {
//     logo: "/program-image/sac.jpg",
//     studentName: "Atreya Kulkarni",
//     grade: "Current Junior",
//     school: "Vista del Lago High School",
//     competition: "Sac STEM Fair",
//     competitionDate: "March 2026",
//     topic: "A Geometric Approach for Thickness Prediction in Incremental Sheet Forming",
//     achievement: "CITADEL INNOVATION PRIZE",
//     achievementIcon: "trophy",
//     competitionIcon: "award",
//     message:
//       "From TRANSFORM'25 to the Sac STEM Fair, your dedication to aerospace engineering continues to inspire us. Congratulations on this well-deserved win! We wish you boundless success as you continue your journey with ACHARYA.",
//     accent: {
//       border: "border-blue-500/40",
//       glow: "shadow-[0_0_60px_-15px_rgba(59,130,246,0.35)]",
//       text: "text-blue-400",
//       badgeBg: "bg-blue-500/15",
//       badgeBorder: "border-blue-500/40",
//       iconStroke: "text-blue-400",
//       quoteColor: "text-blue-400/30",
//       dividerFrom: "from-blue-400",
//     },
//   },
// ];

// export function StudentSpotlights() {
//   return (
//     <div className="relative w-full min-h-screen overflow-hidden bg-[#0a0e1a] py-10 px-4 sm:px-6 lg:px-8">
//       {/* Subtle background glows */}
//       <div className="pointer-events-none absolute top-0 right-0 h-96 w-96 rounded-full bg-amber-500/5 blur-3xl" />
//       <div className="pointer-events-none absolute bottom-0 left-0 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl" />

//       <div className="relative z-10 mx-auto w-full max-w-6xl">
//         {/* Header pill */}
//         <div className="mb-8 flex justify-center">
//           <div className="inline-flex items-center gap-3 rounded-full border border-amber-500/40 bg-[#0f1422] px-6 py-2.5">
//             {/* <span className="text-amber-400">★</span>
//             <span className="text-sm font-bold tracking-[0.25em] text-amber-400">
//               STUDENT SPOTLIGHTS
//             </span>
//             <span className="text-amber-400">★</span> */}
//           </div>
//         </div>

//         {/* Cards */}
//         <div className="flex flex-col gap-6">
//           {spotlights.map((s, i) => {
//             // const CompIcon = s.competitionIcon === "microscope" ? Microscope : Award;
//             const AchIcon = s.achievementIcon === "medal" ? Medal : Trophy;
//             return (
//               <div
//                 key={i}
//                 className={`relative overflow-hidden rounded-2xl border ${s.accent.border} bg-gradient-to-br from-[#0f1422] to-[#0a0e1a] ${s.accent.glow}`}
//               >
//                 <div className="flex flex-col gap-6 p-6 sm:flex-row sm:p-8">
//                   {/* Left: logo block */}
//                   <div className="flex flex-shrink-0 flex-col items-center gap-3 sm:w-44">
//                     <div className="h-32 w-32 overflow-hidden rounded-full">
//                     <Image
//                         src={s.logo}
//                         alt={s.competition}
//                         width={128}
//                         height={128}
//                         className="h-full w-full object-cover"
//                     />
//                     </div>
//                     <div className="text-center">
//                       <p className="text-[11px] font-bold tracking-[0.2em] text-white/50">
//                         COMPETITION
//                       </p>
//                       <p className={`mt-1 text-lg font-bold ${s.accent.text}`}>{s.competition}</p>
//                       <p className="mt-1 text-xs text-white/40">{s.competitionDate}</p>
//                     </div>
//                   </div>

//                   {/* Right: content */}
//                   <div className="relative flex-1">
//                     <Quote
//                       className={`absolute -top-2 left-0 h-8 w-8 ${s.accent.quoteColor}`}
//                       fill="currentColor"
//                     />

//                     {/* Header row */}
//                     <div className="flex flex-col gap-3 pl-10 sm:flex-row sm:items-start sm:justify-between">
//                       <div className="min-w-0">
//                         <h3 className="font-serif text-3xl font-bold text-white sm:text-4xl">
//                           {s.studentName}
//                         </h3>
//                         <p className="mt-1 text-sm text-white/60">
//                           {s.grade} · {s.school}
//                         </p>
//                       </div>
//                       <div
//                         className={`inline-flex flex-shrink-0 items-center gap-2 rounded-full border ${s.accent.badgeBorder} ${s.accent.badgeBg} px-4 py-2`}
//                       >
//                         <AchIcon className={`h-4 w-4 ${s.accent.text}`} />
//                         <span className={`text-xs font-bold tracking-wider ${s.accent.text}`}>
//                           {s.achievement}
//                         </span>
//                       </div>
//                     </div>

//                     {/* Topic */}
//                     <p
//                       className={`mt-5 pl-10 font-serif text-xl italic font-bold ${s.accent.text} leading-snug`}
//                     >
//                       {s.topic}
//                     </p>

//                     {/* Message with vertical bar */}
//                     <div className={`mt-4 ml-10 border-l-2 ${s.accent.border} pl-4`}>
//                       <p className="text-base italic leading-relaxed text-white/75">{s.message}</p>
//                     </div>

//                     {/* Signature */}
//                     <div className="mt-5 flex items-center gap-3 pl-10">
//                       <span
//                         className={`h-px w-10 bg-gradient-to-r ${s.accent.dividerFrom} to-transparent`}
//                       />
//                       <span
//                         className={`text-xs font-bold tracking-[0.2em] ${s.accent.text}`}
//                       >
//                         — ACHARYA TEAM
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";
import Image from "next/image";

import { Award, Medal, Trophy, Microscope } from "lucide-react";

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
    iconStroke: string;
    dividerFrom: string;
    achievementGradient: string;
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
      border: "border-amber-500/40",
      glow: "shadow-[0_0_60px_-15px_rgba(245,158,11,0.35)]",
      text: "text-amber-400",
      iconStroke: "text-amber-400",
      dividerFrom: "from-amber-400",
      achievementGradient: "from-amber-300 via-amber-400 to-yellow-500",
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
      border: "border-blue-500/40",
      glow: "shadow-[0_0_60px_-15px_rgba(59,130,246,0.35)]",
      text: "text-blue-400",
      iconStroke: "text-blue-400",
      dividerFrom: "from-blue-400",
      achievementGradient: "from-blue-300 via-blue-400 to-cyan-500",
    },
  },
];

export function StudentSpotlights() {
  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-[#0a0e1a] py-10 px-4 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute top-0 right-0 h-96 w-96 rounded-full bg-amber-500/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="mb-8 flex justify-center">
          {/* <div className="inline-flex items-center gap-3 rounded-full border border-amber-500/40 bg-[#0f1422] px-6 py-2.5">
            <span className="text-amber-400">★</span>
            <span className="text-sm font-bold tracking-[0.25em] text-amber-400">
              STUDENT SPOTLIGHTS
            </span>
            <span className="text-amber-400">★</span>
          </div> */}
        </div>

        <div className="flex flex-col gap-6">
          {spotlights.map((s, i) => {
            const CompIcon = s.competitionIcon === "microscope" ? Microscope : Award;
            const AchIcon = s.achievementIcon === "medal" ? Medal : Trophy;
            return (
              <div
                key={i}
                className={`relative overflow-hidden rounded-2xl border ${s.accent.border} bg-gradient-to-br from-[#0f1422] to-[#0a0e1a] ${s.accent.glow}`}
              >
                <div className="flex flex-col gap-6 p-6 sm:flex-row sm:p-8">
                  {/* Left: logo block */}
                  <div className="flex flex-shrink-0 flex-col items-center gap-3 sm:w-56">
                     <div className="h-48 w-48 overflow-hidden rounded-full">
                     <Image
                        src={s.logo}
                        alt={s.competition}
                        width={128}
                        height={128}
                        className="h-full w-full object-cover"
                    />
                    </div>
                    <div className="text-center">
                      {/* <p className="text-[11px] font-bold tracking-[0.2em] text-white/50">
                        COMPETITION
                      </p> */}
                      <p className={`mt-1 text-3xl font-bold ${s.accent.text}`}>
                        {s.competition}
                      </p>
                      <p className="mt-1 text-xs text-white/40">{s.competitionDate}</p>
                    </div>
                  </div>

                  {/* Right: content */}
                  <div className="relative flex-1">
                    {/* Achievement above name */}
                    <div className="flex items-center gap-3">
                      <AchIcon className={`h-7 w-7 ${s.accent.text}`} />
                      <span
                        className={`bg-gradient-to-r ${s.accent.achievementGradient} bg-clip-text text-xl font-extrabold uppercase tracking-[0.18em] text-transparent sm:text-2xl`}
                      >
                        {s.achievement}
                      </span>
                    </div>

                    <h3 className="mt-2 font-serif text-3xl font-bold text-white sm:text-3xl">
                      {s.studentName}
                    </h3>
                    <p className="mt-1 text-sm text-white/60">
                      {s.grade} · {s.school}
                    </p>

                    <p
                      className={`mt-4 font-serif text-xl italic font-bold ${s.accent.text} leading-snug`}
                    >
                      {s.topic}
                    </p>

                    <p className="mt-3 text-base italic leading-relaxed text-white/75">
                      {s.message}
                    </p>

                    <div className="mt-4 flex items-center gap-3">
                      <span
                        className={`h-px w-10 bg-gradient-to-r ${s.accent.dividerFrom} to-transparent`}
                      />
                      <span className={`text-xs font-bold tracking-[0.2em] ${s.accent.text}`}>
                        — ACHARYA TEAM
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
