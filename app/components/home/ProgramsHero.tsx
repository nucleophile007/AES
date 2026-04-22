"use client";

import { LayoutGrid } from "@/components/ui/layout-grid";
import { HeroSliderAlways, type Slide } from "./HeroSliderAlways";

export function ProgramsHero() {
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
