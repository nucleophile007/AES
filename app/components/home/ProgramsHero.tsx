"use client";

import { useEffect } from "react";
import Image from "next/image";
import { Lightbulb, Telescope, Zap, Trophy } from "lucide-react";
import { BannerItem } from "./banner-item";
import { GridBackground } from "./grid-background";
import { HeroSliderAlways, type Slide } from "./HeroSliderAlways";

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
      title: "UACHIEVE",
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

  const programsSlide: Slide = {
    title: "Programs",
    imageSrc: "/program-image/banner-tutoring.png",
    imageAlt: "AcharyaES programs",
    customContent: (
      <section className="relative w-full bg-slate-950 overflow-hidden h-full">
        {/* Fixed height container */}
        <div className="relative mx-auto w-full max-w-none h-[100svh] px-2 sm:px-4 lg:px-6 xl:px-8 pb-6 sm:pb-8 md:pb-10 pt-20 sm:pt-24">
          {/* Grid background */}
          <GridBackground />

          {/* Content container */}
          <div className="h-[calc(100svh-5rem)] sm:h-[calc(100svh-6rem)] w-full relative z-20 flex flex-col justify-between pb-4 sm:pb-6">
            {/* Header */}
            <div className="flex-shrink-0 space-y-3 sm:space-y-4 flex flex-col items-center">
              <div className="flex items-center gap-2 rounded-full border border-yellow-400/40 bg-yellow-400/15 px-4 py-2 backdrop-blur-sm mb-5 w-fit">
                <div className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                <span className="text-xs sm:text-sm font-semibold uppercase tracking-[0.15em] text-yellow-200">Transform Your Journey</span>
              </div>
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

  const programSlides: Slide[] = [
    {
      title: "College Admissions 2026",
      imageSrc: "/program-image/acharyaes-college-hero.jpg",
      imageAlt: "ACHARYA college admissions highlights",
      customContent: (
        <div className="relative w-full h-full overflow-hidden bg-[#091636]">
          <Image
            src="/program-image/acharyaes-college-hero.jpg"
            alt="Students celebrating admissions"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#070f2fb5] via-[#091636b3] to-[#091636eb]" />

          <div className="relative mx-auto max-w-7xl h-full px-3 sm:px-6 lg:px-8 py-20 sm:py-24 md:py-28 flex flex-col items-center justify-center text-center">
            <h2 className="text-5xl sm:text-6xl lg:text-8xl font-black font-serif italic text-white leading-none">ACHARYA</h2>
            <p className="mt-2 text-2xl sm:text-3xl lg:text-5xl font-extrabold font-serif italic text-yellow-400">Class of 2026</p>

            <div className="mt-6 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              {preMedTier1.map((college) => (
                <div
                  key={college.name}
                  className="px-3 py-3 sm:py-4 text-white flex flex-col items-center"
                >
                  <div className="mx-auto mb-3 h-24 w-24 sm:h-28 sm:w-28">
                    <Image
                      src={college.logo}
                      alt={`${college.name} logo`}
                      width={112}
                      height={112}
                      loading="eager"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <p className="text-sm sm:text-base font-bold font-serif italic leading-snug text-center">{college.name}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 sm:mt-10">
              <p className="text-4xl sm:text-5xl font-black font-serif italic text-white">We Did It!</p>
              <p className="mt-2 text-xl sm:text-3xl font-serif italic text-yellow-300">Congratulations to our students</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Greater Sacramento Math League",
      subtitle: "Apr 25 • Sacramento • Grades 6-12",
      description:
        "High-energy math competition with medals and certificates for top performers and participants.",
      cta: { label: "Register Now", href: "/events/register/math-league" },
      imageSrc: "/program-image/greater-sacramento-math-league.png",
      imageAlt: "Greater Sacramento Math League event poster",
      visualStyle: "poster",
      hideSecondaryCta: true,
      hideContent: true,
      showCtaWhenHidden: true,
    },
    {
      title: "AP Bridge Summer Program",
      cta: { label: "Register Now", href: "/events/register/ap-bridge" },
      imageSrc: "/program-image/ap-bridge-summer-program.png",
      imageAlt: "AP Bridge Summer Program poster",
      visualStyle: "poster",
      hideContent: true,
      showCtaWhenHidden: true,
    },
    {
      title: "AES Explorers Summer Camp",
      cta: { label: "Register Now", href: "/events/register/aes-explorers" },
      imageSrc: "/program-image/aes-explorers-summer-camp.png",
      imageAlt: "AES Explorers summer camp poster",
      visualStyle: "poster",
      hideContent: true,
      showCtaWhenHidden: true,
    },
  ];

  const slides: Slide[] = [programsSlide, ...programSlides];

  return (
    <HeroSliderAlways
      slides={slides}
      intervalMs={4500}
      ariaLabel="AcharyaES Programs"
      className="w-full pt-20 sm:pt-24"
    />
  );
}

export default ProgramsHero;
