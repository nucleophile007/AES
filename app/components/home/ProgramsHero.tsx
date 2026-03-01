"use client";

import { useEffect, useState, useRef } from "react";
import { HeroSliderAlways } from "./HeroSliderAlways";

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
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function ProgramsHero() {
  const [latestEvent, setLatestEvent] = useState<Event | null>(cachedEvent);
  const [isLoading, setIsLoading] = useState(!cachedEvent);
  const fetchedRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate fetches
    if (fetchedRef.current) return;

    const now = Date.now();
    const isCacheValid = cachedEvent && (now - cacheTimestamp < CACHE_DURATION);

    // Use cached event if available and valid
    if (isCacheValid) {
      setLatestEvent(cachedEvent);
      setIsLoading(false);
      return;
    }

    // Fetch latest event
    fetchedRef.current = true;
    setIsLoading(true);

    fetch("/api/events/latest", {
      // Use Next.js cache
      next: { revalidate: 300 }, // 5 minutes
    })
      .then((res) => {
        if (res.status === 404) return null;
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((event) => {
        if (!event) {
          setIsLoading(false);
          return;
        }
        cachedEvent = event;
        cacheTimestamp = Date.now();
        setLatestEvent(event);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching latest event:", error);
        setIsLoading(false);
      });
  }, []);

  const programSlides = [
    {
      title: "Academic Tutoring",
      subtitle: "Master Your Subjects",
      description:
        "Personalized, mastery-focused tutoring across STEM and humanities. Build strong foundations, gain confidence, and excel in your studies.",
      cta: { label: "Explore Tutoring", href: "/academictutoring" },
      imageSrc: "/program-image/acharyaes-academic-hero.jpg",
      imageAlt: "Students engaged in personalized academic tutoring",
    },
    {
      title: "AES Explorers",
      subtitle: "Discover & Innovate",
      description:
        "Guided research with faculty and industry mentors. Develop real projects, publish findings, and present your work at conferences.",
      cta: { label: "See Research Tracks", href: "/aes-explorers" },
      imageSrc: "/program-image/acharyaes-research-hero.jpg",
      imageAlt: "Students collaborating on cutting-edge research projects",
    },
    {
      title: "AES Champions",
      subtitle: "Compete & Excel",
      description: "AMC, AIME, and Olympiad preparation with proven problem-solving frameworks, mock contests, and expert feedback.",
      cta: { label: "Join Training", href: "/mathcompetition" },
      imageSrc: "/program-image/acharyaes-math-hero.jpg",
      imageAlt: "Students preparing for prestigious math competitions",
    },
    {
      title: "UAchieve",
      subtitle: "Your Path Forward",
      description:
        "Strategic guidance on essays, profile building, and applications that highlight your authentic strengths for selective admissions.",
      cta: { label: "Start Your Journey", href: "/collegeprep" },
      imageSrc: "/program-image/acharyaes-college-hero.jpg",
      imageAlt: "Students preparing for college admissions success",
    },
  ];

  // Add latest event as first slide if available (don't wait for loading to finish)
  const slides = latestEvent
    ? [
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
    : programSlides;

  // Show carousel immediately with program slides, event will be injected when ready
  return <HeroSliderAlways slides={slides} intervalMs={4500} ariaLabel="AcharyaES Programs" className="w-full pt-20" />;
}

export default ProgramsHero;

