"use client";

import Link from "next/link";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LayoutGrid } from "@/components/ui/layout-grid";
import { HeroSliderAlways } from "./HeroSliderAlways";

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
      thumbnail: "/program-image/acharyaes-academic-hero.jpg",
      label: "Academic Tutoring",
      href: "/academictutoring",
      className: "md:col-span-2",
    },
    {
      id: 2,
      content: <ResearchContent />,
      thumbnail: "/program-image/acharyaes-research-hero.jpg",
      label: "AES Explorers",
      href: "/aes-explorers",
      className: "col-span-1",
    },
    {
      id: 3,
      content: <ChampionsContent />,
      thumbnail: "/program-image/acharyaes-math-hero.jpg",
      label: "AES Champions",
      href: "/mathcompetition",
      className: "col-span-1",
    },
    {
      id: 4,
      content: <CollegeContent />,
      thumbnail: "/program-image/acharyaes-college-hero.jpg",
      label: "UAchieve",
      href: "/collegeprep",
      className: "md:col-span-2",
    },
  ];

  const parallaxSlide = {
    title: "Programs",
    imageSrc: "/program-image/acharyaes-academic-hero.jpg",
    imageAlt: "AcharyaES programs",
    customContent: (
      <div className="relative w-full bg-[#0b0f1f]">
        <div className="relative mx-auto w-full max-w-none h-[100svh] px-2 sm:px-4 lg:px-6 xl:px-8 pb-6 sm:pb-8 md:pb-10 pt-16 sm:pt-20">
          <div className="h-[calc(100svh-4rem)] sm:h-[calc(100svh-5rem)] w-full">
            <LayoutGrid
              cards={heroCards}
              hoverPairs={[
                { expandId: 2, shrinkId: 1 },
                { expandId: 3, shrinkId: 4 },
              ]}
            />
          </div>
        </div>
      </div>
    ),
  };

  return (
    <HeroSliderAlways
      slides={[parallaxSlide]}
      intervalMs={4500}
      ariaLabel="AcharyaES Programs"
      className="w-full pt-16 sm:pt-20"
    />
  );
}

export default ProgramsHero;

