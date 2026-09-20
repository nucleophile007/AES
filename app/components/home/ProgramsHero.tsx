"use client";

import { useEffect } from "react";
import Image from "next/image";
import {
  Award,
  CalendarDays,
  ExternalLink,
  Lightbulb,
  MapPin,
  Presentation,
  Telescope,
  Trophy,
  Zap,
} from "lucide-react";
import { BannerItem } from "./banner-item";
import { GridBackground } from "./grid-background";
import { HeroSliderAlways, type Slide } from "./HeroSliderAlways";
import { StudentSpotlights } from "./student-spotlights";
import { UsaboSpotlight } from "./usabo";

export function ProgramsHero() {
  useEffect(() => {
    // Preload banner images immediately for instant display (critical assets)
    const bannerImages = [
      "/program-image/banner-tutoring.png",
      "/program-image/banner-explorers.png",
      "/program-image/banner-future.png",
      "/program-image/banner-champions.png",
    ];

    // Load banner images immediately (high priority)
    bannerImages.forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });

    // Preload secondary assets during idle time
    const secondaryAssets = [
      "/program-image/acharyaes-college-hero.jpg",
      "/college-logos/washi.png",
      "/college-logos/north.png",
      "/college-logos/ucsand.png",
      "/college-logos/uwash.png",
      "/college-logos/pomona1.png",
    ];

    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        secondaryAssets.forEach((src) => {
          const img = new window.Image();
          img.src = src;
        });
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      secondaryAssets.forEach((src) => {
        const img = new window.Image();
        img.src = src;
      });
    }
  }, []);

  const preMedTier1 = [
    {
      name: "Washington University, St. Louis",
      accent: "from-amber-500 to-yellow-400",
      logo: "/college-logos/washi.png",
    },
    {
      name: "University of North Carolina Chapel Hill",
      accent: "from-blue-600 to-blue-500",
      logo: "/college-logos/north.png",
    },
    {
      name: "UC San Diego",
      accent: "from-indigo-600 to-violet-500",
      logo: "/college-logos/ucsand.png",
    },
    {
      name: "University of Washington-Seattle",
      accent: "from-cyan-600 to-sky-500",
      logo: "/college-logos/uwash.png",
    },
    {
      name: "Pomona College",
      accent: "from-amber-600 to-orange-500",
      logo: "/college-logos/pomona1.png",
    },
  ];

  const banners = [
    {
      title: "Academic Tutoring",
      tagline: "Learn. Understand. Succeed.",
      features: [
        { icon: <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6" />, text: "Personalized Learning" },
        { icon: <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6" />, text: "One-on-One Support" },
        { icon: <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6" />, text: "Better Results" },
        { icon: <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6" />, text: "Build Confidence" },
      ],
      image: "/program-image/banner-tutoring.png",
      href: "/academictutoring",
    },
    {
      title: "AES Explorers",
      tagline: "Explore. Discover. Innovate.",
      features: [
        { icon: <Telescope className="w-5 h-5 sm:w-6 sm:h-6" />, text: "Hands-on Research" },
        { icon: <Telescope className="w-5 h-5 sm:w-6 sm:h-6" />, text: "Critical Thinking" },
        { icon: <Telescope className="w-5 h-5 sm:w-6 sm:h-6" />, text: "Real-World Impact" },
        { icon: <Telescope className="w-5 h-5 sm:w-6 sm:h-6" />, text: "Curiosity Driven" },
      ],
      image: "/program-image/banner-explorers.png",
      href: "/aes-explorers",
    },
    {
      title: "UAchieve",
      tagline: "Prepare Today. Achieve Tomorrow.",
      features: [
        { icon: <Zap className="w-5 h-5 sm:w-6 sm:h-6" />, text: "College Guidance" },
        { icon: <Zap className="w-5 h-5 sm:w-6 sm:h-6" />, text: "Test Preparation" },
        { icon: <Zap className="w-5 h-5 sm:w-6 sm:h-6" />, text: "Application Support" },
        { icon: <Zap className="w-5 h-5 sm:w-6 sm:h-6" />, text: "Future Ready" },
      ],
      image: "/program-image/banner-future.png",
      href: "/collegeprep",
    },
    {
      title: "AES Champions",
      tagline: "Think. Solve. Excel.",
      features: [
        { icon: <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />, text: "Problem Solving" },
        { icon: <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />, text: "Competitive Excellence" },
        { icon: <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />, text: "Build Confidence" },
        { icon: <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />, text: "Achieve More" },
      ],
      image: "/program-image/banner-champions.png",
      href: "/aes-champions",
    },
  ];

  const mitUrtcSlide: Slide = {
    title: "IEEE MIT URTC",
    imageSrc: "/logos/ieee-logo.svg",
    imageAlt: "IEEE logo",
    hideArrows: true,
    customContent: (
      <section
        className="relative h-full w-full overflow-hidden bg-[#f6f3ed] text-[#151515]"
        style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
      >
        <div className="absolute inset-y-0 right-0 hidden w-[43%] bg-[#a31f34] lg:block" />
        <div className="absolute right-[34%] top-0 hidden h-full w-28 skew-x-[-11deg] bg-[#151515] lg:block" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(21,21,21,0.04)_1px,transparent_1px),linear-gradient(180deg,rgba(21,21,21,0.04)_1px,transparent_1px)] bg-[size:44px_44px]" />

        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col px-4 pb-14 pt-24 sm:px-6 sm:pb-20 sm:pt-28 lg:px-16 lg:pt-28">
          <div className="flex flex-shrink-0 flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-20 items-center justify-center rounded bg-white px-2 shadow-sm ring-1 ring-black/10 sm:h-12 sm:w-24">
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
                <p className="max-w-[14rem] text-[10px] font-black uppercase tracking-[0.2em] text-[#a31f34] sm:max-w-none sm:text-xs sm:tracking-[0.28em]">
                  MIT Undergraduate Research Technology Conference
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-black/65 sm:text-xs">
                  By undergraduates, for undergraduates
                </p>
              </div>
            </div>
            <a
              href="https://urtc.mit.edu/"
              target="_blank"
              rel="noreferrer"
              className="group hidden h-10 items-center gap-2 rounded bg-[#151515] px-4 text-xs font-black uppercase tracking-[0.16em] text-white transition-colors hover:bg-[#a31f34] focus:outline-none focus:ring-2 focus:ring-[#a31f34] focus:ring-offset-2 sm:inline-flex"
            >
              URTC
              <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>

          <div className="grid min-h-0 flex-1 items-center gap-3 py-3 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10 lg:py-5">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#a31f34] sm:text-sm">
                Congratulations to our student researchers
              </p>
              <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#151515] sm:text-xs">
                <span className="inline-flex items-center gap-1.5 border border-black/15 bg-white/70 px-2 py-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#a31f34]" />
                  Cambridge, Massachusetts
                </span>
                <span className="inline-flex items-center gap-1.5 border border-black/15 bg-white/70 px-2 py-1.5">
                  <CalendarDays className="h-3.5 w-3.5 text-[#a31f34]" />
                  Oct 9-11, 2026
                </span>
              </div>

              <h1 className="mt-3 max-w-4xl text-[2.15rem] font-black uppercase leading-[0.94] tracking-normal text-[#151515] sm:text-5xl md:text-6xl lg:text-[4.2rem] 2xl:text-7xl">
                Soham & Pragna
              </h1>

              <p className="mt-2 max-w-3xl text-base font-black uppercase leading-tight tracking-[0.08em] text-[#a31f34] sm:text-xl md:text-2xl">
                Poster presenters at IEEE MIT URTC
              </p>

              <p className="mt-3 max-w-3xl text-xs font-semibold leading-relaxed text-black/70 sm:hidden">
                Celebrating ACHARYA students presenting undergraduate research at MIT URTC.
              </p>
              <p className="mt-3 hidden max-w-3xl text-sm font-semibold leading-relaxed text-black/70 sm:block">
                ACHARYA proudly congratulates our students as they present their research at the IEEE MIT Undergraduate Research Technology Conference.
              </p>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {[
                  {
                    label: "Research Work 01",
                    area: "Piezoelectric Energy Harvesting",
                    presenter: "Soham Daterao",
                    title: "Dynamic Analysis of L-Shaped and U-Shaped Piezoelectric Harvesters",
                  },
                  {
                    label: "Research Work 02",
                    area: "Speech Denoising",
                    presenter: "Pragna Surabathula",
                    title: "Hearing it Clearly: Convolutional Autoencoders for Speech Denoising",
                  },
                ].map((research) => (
                  <article
                    key={research.label}
                    className="group border-l-4 border-[#a31f34] bg-white/90 p-3 shadow-[0_14px_34px_rgba(21,21,21,0.08)] ring-1 ring-black/10 transition-transform duration-300 hover:-translate-y-1 sm:p-4"
                  >
                    <div className="flex items-center gap-2 text-[#a31f34]">
                      <Presentation className="h-4 w-4" />
                      <span className="text-[10px] font-black uppercase tracking-[0.16em]">
                        {research.label}
                      </span>
                    </div>
                    <h2 className="mt-2 text-lg font-black leading-tight text-[#151515] sm:text-xl">
                      {research.area}
                    </h2>
                    <p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#a31f34]/80">
                      Presenter: {research.presenter}
                    </p>
                    <p className="mt-1.5 text-xs font-semibold leading-snug text-black/70 sm:text-[15px]">
                      {research.title}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            <div className="relative hidden h-full min-h-[360px] lg:block">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full max-w-md bg-[#151515] p-6 text-white shadow-[0_28px_80px_rgba(0,0,0,0.28)] xl:p-8">
                  <div className="flex items-start justify-between gap-6 border-b border-white/20 pb-5">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.35em] text-white/60">
                        IEEE MIT
                      </p>
                      <p className="mt-3 text-3xl font-black uppercase leading-none tracking-normal text-white xl:text-4xl 2xl:text-5xl">
                        Congratulations
                      </p>
                    </div>
                    <Award className="h-12 w-12 text-[#a31f34]" />
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    {[
                      { value: "2", label: "Poster presentations" },
                      { value: "MIT", label: "Conference venue" },
                    ].map((item) => (
                      <div key={item.label} className="border border-white/15 bg-white/[0.06] p-4">
                        <p className="text-4xl font-black uppercase leading-none text-white">
                          {item.value}
                        </p>
                        <p className="mt-3 text-[10px] font-black uppercase tracking-[0.18em] text-white/55">
                          {item.label}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 bg-[#a31f34] px-5 py-4 xl:mt-8">
                    <p className="text-sm font-black uppercase tracking-[0.2em] text-white">
                      All the best at your MIT URTC poster presentations
                    </p>
                  </div>

                  <p className="mt-5 text-sm font-semibold leading-relaxed text-white/65">
                    Representing ACHARYA through research in energy harvesting and speech denoising.
                  </p>
                </div>
              </div>
              <p className="absolute bottom-3 right-0 hidden max-w-sm text-right text-xs font-black uppercase tracking-[0.22em] text-white/80 2xl:block">
                Research presentations by ACHARYA students
              </p>
            </div>
          </div>
        </div>
      </section>
    ),
  };

  const programsSlide: Slide = {
    title: "Programs",
    imageSrc: "/program-image/banner-tutoring.png",
    imageAlt: "AcharyaES programs",
    customContent: (
      <section className="relative w-full bg-gradient-to-b from-[#b4d2f7] via-[#b4d2f7] via-[75%] to-[hsl(220,45%,20%)] overflow-hidden h-full">
        {/* Fixed height container */}
        <div className="relative mx-auto w-full max-w-none h-[100svh] px-2 sm:px-4 lg:px-6 xl:px-8 pb-6 sm:pb-8 md:pb-10 pt-20 sm:pt-24">
          {/* Grid background */}
          <GridBackground />

          {/* Content container */}
          <div className="h-[calc(100svh-5rem)] sm:h-[calc(100svh-6rem)] w-full relative z-20 flex flex-col justify-between pb-4 sm:pb-6">
            {/* Header */}
            <div className="flex-shrink-0 space-y-3 sm:space-y-4 flex flex-col items-center">
              {/* <div className="flex items-center gap-2 rounded-full border border-yellow-400/40 bg-yellow-400/15 px-4 py-2 backdrop-blur-sm mb-5 w-fit">
                <div className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                <span className="text-xs sm:text-sm font-semibold uppercase tracking-[0.15em] text-yellow-200">Transform Your Journey</span>
              </div> */}
              {/* <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-white via-yellow-100 to-amber-200 bg-clip-text text-transparent text-balance leading-tight drop-shadow-[0_2px_12px_rgba(250,204,21,0.3)]">
                Our Programs
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-200 text-balance max-w-2xl leading-relaxed font-medium">
                Choose your path to excellence with our comprehensive suite of academic programs designed to unlock your potential
              </p> */}
            </div>

            {/* Banner Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6 flex-1 w-full overflow-hidden">
              {banners.map((banner, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-lg"
                >
                  <BannerItem
                    title={banner.title}
                    tagline={banner.tagline}
                    features={banner.features}
                    textColor="text-white"
                    accentColor="bg-yellow-400"
                    image={banner.image}
                    href={banner.href}
                    priority={true}
                    objectPosition={index === 3 ? "object-cover lg:object-[center_35%] xl:object-[center_40%]" : "object-cover object-center"}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative corner elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />
      </section>
    ),
  };

  const spotlightsSlide: Slide = {
    title: "Student Spotlights",
    customContent: <StudentSpotlights />,
    imageSrc: "/program-image/banner-explorers.png",
    imageAlt: "AcharyaES student spotlights",
  };

  const usabospotlightsSlide: Slide = {
    title: "USABO Spotlights",
    customContent: <UsaboSpotlight />,
    imageSrc: "/program-image/banner-explorers.png",
    imageAlt: "AcharyaES USABO spotlights",
  };

  const programSlides: Slide[] = [
    {
      title: "College Admissions 2026",
      imageSrc: "/program-image/acharyaes-college-hero.jpg",
      imageAlt: "ACHARYA college admissions highlights",
      customContent: (
        <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-[#b4d2f7] via-[#b4d2f7] via-[75%] to-[hsl(220,45%,20%)]">
          <Image
            src="/program-image/acharyaes-college-hero.jpg"
            alt="Students celebrating admissions"
            fill
            priority
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-[#b4d2f7]/90 to-[hsl(220,45%,20%)]" />

          <div className="relative mx-auto max-w-7xl h-full px-3 sm:px-6 lg:px-8 py-20 sm:py-24 md:py-28 flex flex-col items-center justify-center text-center">
            <h2 className="text-5xl sm:text-6xl lg:text-8xl font-black font-serif italic text-slate-900 leading-none">ACHARYA</h2>
            <p className="mt-2 text-2xl sm:text-3xl lg:text-5xl font-extrabold font-serif italic text-emerald-700">Class of 2026</p>

            {/* <p className="mt-8 text-lg sm:text-2xl lg:text-4xl font-extrabold font-serif italic uppercase tracking-[0.12em] text-white">
              Tier 1 - Elite Medical Feeder Schools
            </p> */}

            <div className="mt-6 w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {preMedTier1.map((college) => (
                <div
                  key={college.name}
                  className="text-slate-900 flex flex-col items-center px-2 py-2 sm:px-3 sm:py-4"
                >
                  <div className="mx-auto mb-2 sm:mb-3 h-14 w-14 sm:h-20 sm:w-20 lg:h-28 lg:w-28">
                    <Image
                      src={college.logo}
                      alt={`${college.name} logo`}
                      width={112}
                      height={112}
                      loading="eager"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <p className="text-[11px] sm:text-base font-bold font-serif italic leading-snug text-center line-clamp-2">
                    {college.name}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 sm:mt-10">
              <p className="text-4xl sm:text-5xl font-black font-serif italic text-slate-900">We Did It!</p>
              <p className="mt-2 text-xl sm:text-3xl font-serif italic text-emerald-600">Congratulations to our students</p>
            </div>
          </div>
        </div>
      ),
    },
    // {
    //   title: "AP Bridge Summer Program",
    //   cta: { label: "Register Now", href: "/events/register/ap-bridge" },
    //   imageSrc: "/program-image/ap-bridge-summer-program.png",
    //   imageAlt: "AP Bridge Summer Program poster",
    //   visualStyle: "poster",
    //   hideContent: true,
    //   showCtaWhenHidden: true,
    // },

    // {
    //   title: "AES Explorers Summer Camp",
    //   cta: { label: "Register Now", href: "/events/register/aes-explorers" },
    //   imageSrc: "/program-image/aes-explorers-summer-camp.png",
    //   imageAlt: "AES Explorers summer camp poster",
    //   visualStyle: "poster",
    //   hideContent: true,
    //   showCtaWhenHidden: true,
    // },
    // {
    //   title: "AES Champions Math Competition Prep",
    //   cta: { label: "Register Now", href: "/events/register/aes-champions" },
    //   imageSrc: "/program-image/math-new-event.png",
    //   imageAlt: "AES Champions Math Competition Prep poster",
    //   visualStyle: "poster",
    //   hideContent: true,
    //   showCtaWhenHidden: true,
    // },
  ];

  const slides: Slide[] = [mitUrtcSlide, programsSlide, spotlightsSlide, usabospotlightsSlide, ...programSlides];

  return (
    <HeroSliderAlways
      slides={slides}
      intervalMs={7000}
      ariaLabel="AcharyaES Programs"
      className="w-full pt-20 sm:pt-24"
    />
  );
}

export default ProgramsHero;
