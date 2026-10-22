"use client";

import { useEffect } from "react";
import Image from "next/image";
import {
  Lightbulb,
  Telescope,
  Trophy,
  Zap,
} from "lucide-react";
import { BannerItem } from "./banner-item";
import { GridBackground } from "./grid-background";
import { HeroSliderAlways, type Slide } from "./HeroSliderAlways";
import { MitUrtcSlide } from "./MitUrtcSlide";
import { AnimatedProgramsHeroSlide } from "./AnimatedProgramsHeroSlide";
import { StudentSpotlights } from "./student-spotlights";

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
    customContent: <MitUrtcSlide />,
  };

  const programsSlide: Slide = {
    title: "Programs",
    imageSrc: "/program-image/banner-tutoring.png",
    imageAlt: "AcharyaES programs",
    customContent: <AnimatedProgramsHeroSlide />,
  };

  const spotlightsSlide: Slide = {
    title: "Student Spotlights",
    customContent: <StudentSpotlights />,
    imageSrc: "/program-image/banner-explorers.png",
    imageAlt: "AcharyaES student spotlights",
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

  const slides: Slide[] = [mitUrtcSlide, programsSlide, spotlightsSlide, ...programSlides];

  return (
    <HeroSliderAlways
      slides={slides}
      intervalMs={7000}
      autoPlay={false}
      ariaLabel="AcharyaES Programs"
      className="w-full pt-20 sm:pt-24"
    />
  );
}

export default ProgramsHero;
