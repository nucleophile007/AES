"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, ExternalLink } from "lucide-react";

export function MitUrtcSlide() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation shortly after mount
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      className="relative h-full w-full overflow-hidden bg-sky-200 text-[#151515] flex flex-col"
      style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
    >
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(21,21,21,0.04)_1px,transparent_1px),linear-gradient(180deg,rgba(21,21,21,0.04)_1px,transparent_1px)] bg-[size:44px_44px]" />

      {/* ─── TOP SECTION: Congratulations + Event Identity ─── */}
      <div className="relative z-20 mx-auto flex w-full max-w-[1600px] flex-shrink-0 items-center justify-between gap-6 px-6 pb-3 pt-28 sm:px-10 lg:px-16 lg:pb-4 lg:pt-32">
        <div className={`min-w-0 transition-transform duration-700 ease-out motion-reduce:transition-none ${isVisible ? "translate-y-0" : "translate-y-4"}`}>
          <h1
            className="text-7xl font-black leading-[0.82] tracking-[0.01em] text-[#c2415a] sm:text-8xl lg:text-9xl"
            style={{ fontFamily: '"Brush Script MT", "Segoe Script", cursive' }}
          >
            Congratulations
          </h1>
          <p className="mt-3 text-sm font-black uppercase tracking-[0.12em] text-[#151515] sm:text-base">
            Our student researchers are headed to <span className="text-[#e05a47]">MIT</span>
          </p>
          <a
            href="https://urtc.mit.edu/"
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-2 border-b-2 border-[#a31f34] pb-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#075985] transition-colors hover:text-[#a31f34]"
          >
            URTC <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <div className={`hidden w-[38%] max-w-[480px] shrink-0 transition-transform duration-700 delay-150 ease-out motion-reduce:transition-none sm:block ${isVisible ? "translate-x-0" : "translate-x-6"}`}>
          <Image
            src="/mit_urtc.png"
            alt="MIT Undergraduate Research Technology Conference"
            width={1086}
            height={362}
            priority
            className="h-auto w-full object-contain"
          />
        </div>
      </div>

      {/* ─── BOTTOM SECTION: Featured Researchers ─── */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-[0_0_44%] flex-col overflow-hidden shadow-2xl md:flex-[0_0_46%] md:flex-row">
        
        {/* LEFT: SOHAM */}
        <div className={`relative flex-1 bg-[#151515] min-h-[220px] transition-transform duration-700 ease-out motion-reduce:transition-none md:min-h-0 ${isVisible ? "translate-y-0" : "translate-y-5"}`}>
          {/* Subtle Geometric Background */}
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-[#1e1e1e] blur-3xl opacity-50" />
          <div className="absolute top-0 right-0 h-full w-16 -skew-x-[12deg] bg-[#1a1a1a]" />

          {/* Portrait Image */}
          <div className={`absolute right-10 top-1/2 z-20 h-[48%] aspect-square -translate-y-1/2 overflow-hidden rounded-full border-4 border-white/70 shadow-2xl transition-all duration-1000 ease-out motion-reduce:transition-none md:right-16 lg:h-[62%] ${isVisible ? "translate-x-0 opacity-100" : "-translate-x-16 opacity-0"}`}>
            <Image 
              src="/soham.png"
              alt="Soham Daterao" 
              width={1295}
              height={1215}
              className="h-full w-full object-cover object-center opacity-100"
            />
          </div>

          {/* Content */}
          <div className="relative z-10 flex h-full w-full flex-col justify-center p-5 sm:p-6 md:w-[65%] lg:p-8">
            <h2 className="mb-1 text-4xl font-black uppercase leading-none tracking-tighter text-white lg:text-6xl">
              Soham
            </h2>
            <p className="mb-2 whitespace-nowrap text-[9px] font-black uppercase tracking-[0.18em] text-[#a31f34] lg:text-[10px]">
              Poster Presenter
            </p>
            <div className="max-w-sm border-l-4 border-[#a31f34] py-0.5 pl-3 sm:pl-4">
              <h3 className="mb-1 min-h-[2.25rem] text-sm font-bold leading-snug text-white md:text-base lg:text-lg">
                Piezoelectric Energy Harvesting
              </h3>
              <p className="min-h-[2.5rem] text-xs font-medium leading-snug text-white/80 md:text-sm lg:text-base">
                Dynamic Analysis of L-Shaped and U-Shaped Piezoelectric Harvesters
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.14em] text-[#f8c4cc]">
                MIT URTC presenter <ArrowUpRight className="h-3 w-3" />
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT: PRAGNA */}
        <div className={`relative flex-1 bg-[#8a1a2d] min-h-[220px] transition-transform delay-150 duration-700 ease-out motion-reduce:transition-none ${isVisible ? "translate-y-0" : "translate-y-5"}`}>
          <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-[#a31f34] opacity-50 blur-3xl" />
          <div className="absolute left-0 top-0 h-full w-16 skew-x-[12deg] bg-[#9a1d33]" />
          <div className={`absolute right-10 top-1/2 z-20 h-[48%] aspect-square -translate-y-1/2 overflow-hidden rounded-full border-4 border-white/70 shadow-2xl transition-all delay-200 duration-1000 ease-out motion-reduce:transition-none md:right-16 lg:h-[62%] ${isVisible ? "translate-x-0 opacity-100" : "translate-x-16 opacity-0"}`}>
            <Image src="/pragna.png" alt="Pragna Surabathula" width={1289} height={1221} className="h-full w-full object-cover object-center opacity-100" />
          </div>
          <div className="relative z-10 flex h-full w-full flex-col justify-center p-5 sm:p-6 md:w-[65%] lg:p-8">
            <h2 className="mb-1 text-4xl font-black uppercase leading-none tracking-tighter text-white lg:text-6xl">Pragna</h2>
            <p className="mb-2 whitespace-nowrap text-[9px] font-black uppercase tracking-[0.18em] text-[#151515] lg:text-[10px]">Poster Presenter</p>
            <div className="max-w-sm border-l-4 border-[#151515] py-0.5 pl-3 sm:pl-4">
              <h3 className="mb-1 min-h-[2.25rem] text-sm font-bold leading-snug text-white md:text-base lg:text-lg">Speech Denoising</h3>
              <p className="min-h-[2.5rem] text-xs font-medium leading-snug text-white/80 md:text-sm lg:text-base">Hearing it Clearly: Convolutional Autoencoders for Speech Denoising</p>
              <p className="mt-2 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.14em] text-[#ffd5dc]">MIT URTC presenter <ArrowUpRight className="h-3 w-3" /></p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

export default MitUrtcSlide;
