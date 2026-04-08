"use client";

import { useEffect, useRef, useState } from "react";
import { LayoutGrid } from "@/components/ui/layout-grid";
import { HeroSliderAlways, type Slide } from "./HeroSliderAlways";

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  category: string;
  image: string;
}

// Cache for the latest event (in-memory)
let cachedEvent: Event | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function ProgramsHero() {
  const [latestEvent, setLatestEvent] = useState<Event | null>(cachedEvent);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;

    const now = Date.now();
    const isCacheValid = cachedEvent && now - cacheTimestamp < CACHE_DURATION;

    if (isCacheValid) {
      setLatestEvent(cachedEvent);
      return;
    }

    fetchedRef.current = true;

    fetch("/api/events/latest", {
      next: { revalidate: 300 },
    })
      .then((res) => {
        if (res.status === 404) return null;
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((event) => {
        if (!event) return;
        cachedEvent = event;
        cacheTimestamp = Date.now();
        setLatestEvent(event);
      })
      .catch((error) => {
        console.error("Error fetching latest event:", error);
      });
  }, []);

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

  const programsSlide: Slide = {
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

  const programSlides: Slide[] = [
    {
      title: "Greater Sacramento Math League",
      subtitle: "Apr 25 • Sacramento • Grades 6-12",
      description:
        "High-energy math competition with medals and certificates for top performers and participants.",
      cta: { label: "Register Now", href: "/summer-program/register" },
      imageSrc: "/program-image/greater-sacramento-math-league.png",
      imageAlt: "Greater Sacramento Math League event poster",
      visualStyle: "poster",
      hideSecondaryCta: true,
      hideContent: true,
      showCtaWhenHidden: true,
    },
    {
      title: "AP Bridge Summer Program",
      cta: { label: "Register Now", href: "/summer-program/register" },
      imageSrc: "/program-image/ap-bridge-summer-program.png",
      imageAlt: "AP Bridge Summer Program poster",
      visualStyle: "poster",
      hideContent: true,
      showCtaWhenHidden: true,
    },
    {
      title: "AES Explorers Summer Camp",
      cta: { label: "Register Now", href: "/summer-program/register" },
      imageSrc: "/program-image/aes-explorers-summer-camp.png",
      imageAlt: "AES Explorers summer camp poster",
      visualStyle: "poster",
      hideContent: true,
      showCtaWhenHidden: true,
    },
  ];

  const slides: Slide[] = latestEvent
    ? [
        programsSlide,
        {
          title: latestEvent.title,
          subtitle: `${latestEvent.category} • ${latestEvent.date}`,
          description: `${latestEvent.description} Join us ${latestEvent.location} at ${latestEvent.time}.`,
          cta: { label: "Register Now", href: `/events/register/${latestEvent.id}` },
          imageSrc: latestEvent.image,
          imageAlt: latestEvent.title,
          isEvent: true,
        },
        ...programSlides,
      ]
    : [programsSlide, ...programSlides];

  return (
    <HeroSliderAlways
      slides={slides}
      intervalMs={4500}
      ariaLabel="AcharyaES Programs"
      className="w-full pt-16 sm:pt-20"
    />
  );
}

export default ProgramsHero;
