"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ExternalLink, MapPin, CalendarDays, Award } from "lucide-react";

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

      {/* ─── TOP SECTION: Editorial Header ─── */}
      <div className="relative z-20 mx-auto w-full max-w-[1600px] px-6 pt-28 sm:px-10 lg:px-16 lg:pt-32 flex-shrink-0 pb-3 md:pb-4">
        
        {/* IEEE / URTC Header Bar */}
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-20 items-center justify-center rounded bg-white px-2 shadow-sm ring-1 ring-black/10">
              <Image
                src="/logos/ieee-logo.svg"
                alt="IEEE logo"
                width={112}
                height={64}
                priority
                className="h-full w-full object-contain"
              />
            </div>
            <div className="border-l-4 border-[#a31f34] pl-3">
              <p className="text-base sm:text-lg lg:text-2xl font-black uppercase tracking-[0.18em] text-[#075985]">
                MIT Undergraduate Research Technology Conference
              </p>
              <p className="mt-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-[0.14em] text-[#0c4a6e]/70">
                By undergraduates, for undergraduates
              </p>
            </div>
          </div>
          <a
            href="https://urtc.mit.edu/"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-2 rounded bg-[#151515] px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#a31f34]"
          >
            URTC
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* ONE Dominant Congratulations Message */}
        <div className="max-w-5xl">
          <h1 className="text-xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tighter text-[#075985] leading-[0.9]">
            Congratulations<br />
            <span className="text-lg sm:text-2xl lg:text-3xl tracking-tight block mt-1">
              Our Student Researchers
            </span>
          </h1>

          {/* Secondary Conference Metadata */}
          <div className="mt-3 md:mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] text-[#151515]/70">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-[#a31f34]" />
              Cambridge, MA
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-[#a31f34]" />
              Oct 9–11, 2026
            </span>
            <span className="flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-[#a31f34]" />
              2 Poster Presentations @ MIT
            </span>
          </div>
        </div>
      </div>

      {/* ─── BOTTOM SECTION: Featured Researchers ─── */}
      <div className="relative z-10 flex-1 w-full mx-auto max-w-[1600px] flex flex-col md:flex-row shadow-2xl overflow-hidden">
        
        {/* LEFT: SOHAM */}
        <div 
          className={`
            relative flex-1 bg-[#151515] min-h-[250px] md:min-h-0
            transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-12 opacity-0'}
          `}
        >
          {/* Subtle Geometric Background */}
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-[#1e1e1e] blur-3xl opacity-50" />
          <div className="absolute top-0 right-0 h-full w-16 -skew-x-[12deg] bg-[#1a1a1a]" />

          {/* Portrait Image */}
          <div 
            className={`
              absolute inset-y-0 right-0 md:right-4 w-[60%] md:w-[55%] h-full
              transition-all duration-1000 delay-150 ease-out origin-bottom
              ${isVisible ? 'translate-x-0 opacity-100 scale-100' : '-translate-x-8 opacity-0 scale-95'}
            `}
          >
            <Image 
              src="/soham.png"
              alt="Soham Daterao" 
              fill 
              className="object-cover object-center mix-blend-luminosity opacity-80" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#151515] via-[#151515]/60 to-transparent md:w-[50%]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#151515] via-transparent to-transparent h-full" />
          </div>

          {/* Content */}
          <div className="relative h-full z-10 flex flex-col justify-end p-6 sm:p-8 lg:p-12 w-full md:w-[90%] pb-10">
            <h2 
              className={`
                text-6xl sm:text-7xl lg:text-8xl font-black text-white uppercase tracking-tighter leading-none mb-1
                transition-all duration-700 delay-300 ease-out
                ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}
              `}
            >
              Soham
            </h2>
            <p 
              className={`
                text-[#a31f34] text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] mb-4 md:mb-5
                transition-all duration-700 delay-400 ease-out
                ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
              `}
            >
              Poster Presenter
            </p>
            
            <div 
              className={`
                border-l-4 border-[#a31f34] pl-4 sm:pl-5 py-0.5 max-w-sm
                transition-all duration-700 delay-500 ease-out
                ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}
              `}
            >
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1.5 leading-snug">
                Piezoelectric Energy Harvesting
              </h3>
              <p className="text-xs sm:text-sm text-white/60 font-medium leading-relaxed">
                Dynamic Analysis of L-Shaped and U-Shaped Piezoelectric Harvesters
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT: PRAGNA */}
        <div 
          className={`
            relative flex-1 bg-[#8a1a2d] min-h-[250px] md:min-h-0
            transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'}
          `}
        >
          {/* Subtle Geometric Background */}
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[#a31f34] blur-3xl opacity-50" />
          <div className="absolute top-0 left-0 h-full w-16 skew-x-[12deg] bg-[#9a1d33]" />

          {/* Portrait Image */}
          <div 
            className={`
              absolute inset-y-0 right-0 md:left-4 w-[60%] md:w-[55%] h-full
              transition-all duration-1000 delay-150 ease-out origin-bottom
              ${isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-8 opacity-0 scale-95'}
            `}
          >
            <Image 
              src="/pragna.png"
              alt="Pragna Surabathula" 
              fill 
              className="object-cover object-center opacity-95" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#8a1a2d]/20 to-[#8a1a2d]/45 md:w-full hidden md:block" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#8a1a2d]/25 via-[#8a1a2d]/15 to-transparent w-full md:hidden" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#8a1a2d]/25 via-transparent to-transparent h-full" />
          </div>

          {/* Content */}
          <div className="relative h-full z-10 flex flex-col justify-end items-start md:items-end p-6 sm:p-8 lg:p-12 w-full pb-10">
            <div className="w-full max-w-sm flex flex-col items-start md:items-end text-left md:text-right">
              <h2 
                className={`
                  text-6xl sm:text-7xl lg:text-8xl font-black text-white uppercase tracking-tighter leading-none mb-1
                  transition-all duration-700 delay-300 ease-out
                  ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}
                `}
              >
                Pragna
              </h2>
              <p 
                className={`
                  text-[#151515] text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] mb-4 md:mb-5
                  transition-all duration-700 delay-400 ease-out
                  ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
                `}
              >
                Poster Presenter
              </p>
              
              <div 
                className={`
                  border-l-4 md:border-l-0 md:border-r-4 border-[#151515] pl-4 md:pl-0 md:pr-5 py-0.5
                  transition-all duration-700 delay-500 ease-out
                  ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}
                `}
              >
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1.5 leading-snug">
                  Speech Denoising
                </h3>
                <p className="text-xs sm:text-sm text-white/80 font-medium leading-relaxed">
                  Hearing it Clearly: Convolutional Autoencoders for Speech Denoising
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

export default MitUrtcSlide;
