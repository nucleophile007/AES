"use client";

import { useEffect, useState, useRef } from "react";
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

  // Add latest event as first slide if available (don't wait for loading to finish)
  const slides: Slide[] = latestEvent
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
  return (
    <HeroSliderAlways
      slides={slides}
      intervalMs={4500}
      ariaLabel="AcharyaES Programs"
      className="w-full mt-20 h-[calc(100vh-5rem)]"
    />
  );
}

export default ProgramsHero;
