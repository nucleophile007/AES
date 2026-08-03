"use client";
import Image from "next/image";
import { Medal, Microscope, Calendar, ArrowRight } from "lucide-react";

export function UsaboSpotlight() {
  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-[#0a0e1a] py-10 px-4 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute top-0 right-0 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="mb-8 flex justify-center">
          <div className="inline-flex items-center gap-3 rounded-full border border-emerald-500/40 bg-[#0f1422] px-6 py-2.5">
            <span className="text-emerald-400">★</span>
            <span className="text-sm font-bold tracking-[0.25em] text-emerald-400">
              STUDENT SPOTLIGHT
            </span>
            <span className="text-emerald-400">★</span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-[#0f1422] to-[#0a0e1a] shadow-[0_0_60px_-15px_rgba(16,185,129,0.35)]">
          <div className="flex flex-col gap-6 p-6 sm:flex-row sm:p-8">
            {/* Left: logo block */}
            <div className="flex flex-shrink-0 flex-col items-center gap-3 sm:w-56">
              <div className="h-48 w-48 overflow-hidden rounded-full">
              <Image
              src='/program-image/usabo2.jpeg'
              alt='usabo'
              width={128}
              height={128}
              className="h-full w-full object-cover"
              />
              </div>
              <div className="text-center">
               
                <p className="mt-2 text-3xl font-bold text-emerald-400">USABO</p>
                <p className="mt-1 text-xs text-white/40">2025</p>
              </div>
            </div>

            {/* Right: content */}
            <div className="relative flex-1">
              <div className="flex items-center gap-3">
                <Medal className="h-7 w-7 text-emerald-400" />
                <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-500 bg-clip-text text-2xl font-extrabold uppercase tracking-[0.18em] text-transparent sm:text-3xl">
                  USABO&apos;26 SEMI-FINALIST
                </span>
              </div>

              <h3 className="mt-3 font-serif text-3xl font-bold text-white sm:text-4xl">
                Nithya Reddy Pathi
              </h3>
              <p className="mt-1 text-sm text-white/60">
                Current Junior · Vista del Lago High School
              </p>

              <p className="mt-5 font-serif text-xl italic font-bold text-emerald-400 leading-snug">
                Elite national recognition in the biological sciences
              </p>

              <p className="mt-4 text-base italic leading-relaxed text-white/75">
                A huge congratulations to our student on being named a USABO Semifinalist! It is
                incredibly rewarding to see the strategic study plan designed by ACHARYA
                translated into such elite national recognition. Your discipline and mastery of
                the biological sciences are truly inspiring.
              </p>

              <div className="mt-5 flex items-center gap-3">
                <span className="h-px w-10 bg-gradient-to-r from-emerald-400 to-transparent" />
                <span className="text-xs font-bold tracking-[0.2em] text-emerald-400">
                  — ACHARYA TEAM
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <h2 className="font-serif text-2xl font-bold text-white sm:text-3xl">
            Want to be a part of our{" "}
            <span className="text-emerald-400">USABO Camp?</span>
          </h2>
          <p className="mt-3 text-base text-white/70 leading-relaxed max-w-2xl mx-auto">
            Train with mentors who have guided semifinalists and build the mastery that earns
            elite national recognition.
          </p>
          <a
            href="/book-session"
            className="group mt-5 inline-flex items-center gap-2 text-sm font-bold tracking-wider text-emerald-400 hover:text-emerald-300"
          >
            <Calendar className="h-4 w-4" />
            <span>BOOK A FREE SESSION</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </div>
  );
}


// "use client";
// import Image from "next/image";

// import { Quote, Medal, Microscope, Calendar, ArrowRight } from "lucide-react";

// export function UsaboSpotlight() {
//   return (
//     <div className="relative w-full min-h-screen overflow-hidden bg-[#0a0e1a] py-10 px-4 sm:px-6 lg:px-8">
//       {/* Background glows */}
//       <div className="pointer-events-none absolute top-0 right-0 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />
//       <div className="pointer-events-none absolute bottom-0 left-0 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />

//       <div className="relative z-10 mx-auto w-full max-w-6xl">
//         {/* Header pill */}
//         <div className="mb-8 flex justify-center">
//           <div className="inline-flex items-center gap-3 rounded-full border border-emerald-500/40 bg-[#0f1422] px-6 py-2.5">
//             <span className="text-emerald-400">★</span>
//             <span className="text-sm font-bold tracking-[0.25em] text-emerald-400">
//               STUDENT SPOTLIGHT
//             </span>
//             <span className="text-emerald-400">★</span>
//           </div>
//         </div>

//         {/* Top half: Spotlight card */}
//         <div className="relative overflow-hidden rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-[#0f1422] to-[#0a0e1a] shadow-[0_0_60px_-15px_rgba(16,185,129,0.35)]">
//           <div className="flex flex-col gap-6 p-6 sm:flex-row sm:p-8">
//             {/* Left: logo block */}
//             <div className="flex flex-shrink-0 flex-col items-center gap-3 sm:w-44">
//               <div className="h-32 w-32 overflow-hidden rounded-full">
//               <Image
//               src='/program-image/usabo2.jpeg'
//               alt='usabo'
//               width={128}
//               height={128}
//               className="h-full w-full object-cover"
//               />
//               </div>
//               <div className="text-center">
//                 <p className="text-[11px] font-bold tracking-[0.2em] text-white/50">
//                   COMPETITION
//                 </p>
//                 <p className="mt-1 text-lg font-bold text-emerald-400">USABO</p>
//                 <p className="mt-1 text-xs text-white/40">2025</p>
//               </div>
//             </div>

//             {/* Right: content */}
//             <div className="relative flex-1">
//               <Quote
//                 className="absolute -top-2 left-0 h-8 w-8 text-emerald-400/30"
//                 fill="currentColor"
//               />

//               <div className="flex flex-col gap-3 pl-10 sm:flex-row sm:items-start sm:justify-between">
//                 <div className="min-w-0">
//                   <h3 className="font-serif text-3xl font-bold text-white sm:text-4xl">
//                     Nithya Reddy Pathi
//                   </h3>
//                   <p className="mt-1 text-sm text-white/60">
//                     Current Junior · Vista del Lago High School
//                   </p>
//                 </div>
//                 <div className="inline-flex flex-shrink-0 items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-4 py-2">
//                   <Medal className="h-4 w-4 text-emerald-400" />
//                   <span className="text-xs font-bold tracking-wider text-emerald-400">
//                     USABO'26 SEMI-FINALIST
//                   </span>
//                 </div>
//               </div>

//               <p className="mt-5 pl-10 font-serif text-xl italic font-bold text-emerald-400 leading-snug">
//                 Elite national recognition in the biological sciences
//               </p>

//               <div className="mt-4 ml-10 border-l-2 border-emerald-500/40 pl-4">
//                 <p className="text-base italic leading-relaxed text-white/75">
//                   A huge congratulations to our student on being named a USABO Semifinalist! It is
//                   incredibly rewarding to see the strategic study plan designed by ACHARYA
//                   translated into such elite national recognition. Your discipline and mastery of
//                   the biological sciences are truly inspiring.
//                 </p>
//               </div>

//               <div className="mt-5 flex items-center gap-3 pl-10">
//                 <span className="h-px w-10 bg-gradient-to-r from-emerald-400 to-transparent" />
//                 <span className="text-xs font-bold tracking-[0.2em] text-emerald-400">
//                   — ACHARYA TEAM
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Bottom: plain text CTA */}
//         <div className="mt-10 text-center">
//           <h2 className="font-serif text-2xl font-bold text-white sm:text-3xl">
//             Want to be a part of our{" "}
//             <span className="text-emerald-400">USABO Camp?</span>
//           </h2>
//           <p className="mt-3 text-base text-white/70 leading-relaxed max-w-2xl mx-auto">
//             Train with mentors who have guided semifinalists and build the mastery that earns
//             elite national recognition.
//           </p>
//           <a
//             href="/book-session"
//             className="group mt-5 inline-flex items-center gap-2 text-sm font-bold tracking-wider text-emerald-400 hover:text-emerald-300"
//           >
//             <Calendar className="h-4 w-4" />
//             <span>BOOK A FREE SESSION</span>
//             <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
//           </a>
//         </div>
//       </div>
//     </div>
//   );
// }
