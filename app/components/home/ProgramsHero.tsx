"use client";

import { useEffect } from "react";
import Image from "next/image";
import { LayoutGrid } from "@/components/ui/layout-grid";
import { HeroSliderAlways, type Slide } from "./HeroSliderAlways";

export function ProgramsHero() {
  useEffect(() => {
    const admissionSlideAssets = [
      "/program-image/acharyaes-college-hero.jpg",
      "/college-logos/washi.png",
      "/college-logos/north.png",
      "/college-logos/ucsand.png",
      "/college-logos/uwash.png",
      "/college-logos/pomona1.png",
    ];

    admissionSlideAssets.forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
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

  const AcademicContent = () => (
    <div>
      <p className="font-bold md:text-4xl text-xl text-white">Academic Tutoring</p>
      <p className="font-normal text-base text-white"></p>
      <p className="font-normal text-base my-4 max-w-lg text-neutral-200">
        Personalized tutoring across STEM and humanities to build mastery and confidence.
      </p>
    </div>
  );

  const ResearchContent = () => (
    <div>
      <p className="font-bold md:text-4xl text-xl text-white">AES Explorers</p>
      <p className="font-normal text-base text-white"></p>
      <p className="font-normal text-base my-4 max-w-lg text-neutral-200">
        Guided research with mentors to develop projects, publish, and present.
      </p>
    </div>
  );

  const ChampionsContent = () => (
    <div>
      <p className="font-bold md:text-4xl text-xl text-white">AES Champions</p>
      <p className="font-normal text-base text-white"></p>
      <p className="font-normal text-base my-4 max-w-lg text-neutral-200">
        Olympiad and contest preparation with structured practice and feedback.
      </p>
    </div>
  );

  const CollegeContent = () => (
    <div>
      <p className="font-bold md:text-4xl text-xl text-white">UAchieve</p>
      <p className="font-normal text-base text-white"></p>
      <p className="font-normal text-base my-4 max-w-lg text-neutral-200">
        Admissions strategy, essays, and profile building to stand out.
      </p>
    </div>
  );

  const heroCards = [
    {
      id: 1,
      content: <AcademicContent />,
      thumbnail: "/program-image/acharyaes-academic.png",
      label: "Academic Tutoring",
      href: "/academictutoring",
      className: "col-span-1",
    },
    {
      id: 2,
      content: <ResearchContent />,
      thumbnail: "/program-image/acharyaes-research-1.png",
      label: "AES Explorers",
      href: "/aes-explorers",
      className: "col-span-1",
    },
    
    {
      id: 3,
      content: <CollegeContent />,
      thumbnail: "/program-image/acharyaes-college.png",
      label: "UAchieve",
      href: "/collegeprep",
      className: "col-span-1",
    },
    {
      id: 4,
      content: <ChampionsContent />,
      thumbnail: "/program-image/acharyaes-math-1.png",
      label: "AES Champions",
      href: "/aes-champions",
      className: "col-span-1",
    },
  ];

  const programsSlide: Slide = {
    title: "Programs",
    imageSrc: "/program-image/acharyaes-academic-hero.jpg",
    imageAlt: "AcharyaES programs",
    customContent: (
      <div className="relative w-full bg-[#0b0f1f]">
        <div className="relative mx-auto w-full max-w-none h-[100svh] px-2 sm:px-4 lg:px-6 xl:px-8 pb-6 sm:pb-8 md:pb-10 pt-20 sm:pt-24">
          <div className="h-[calc(100svh-5rem)] sm:h-[calc(100svh-6rem)] w-full">
            <LayoutGrid
              cards={heroCards}
              hoverPairs={[]}
            />
          </div>
        </div>
      </div>
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

            {/* <p className="mt-8 text-lg sm:text-2xl lg:text-4xl font-extrabold font-serif italic uppercase tracking-[0.12em] text-white">
              Tier 1 - Elite Medical Feeder Schools
            </p> */}

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
              <p className="mt-2 text-xl sm:text-3xl font-serif italic text-yellow-300">Congratulations to our medical legends</p>
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
