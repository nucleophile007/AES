"use client";
import React from "react";
import Image from "next/image";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import Chatbot from "@/components/home/Chatbot";
import { Calendar, Clock, MapPin, ArrowRight, Users, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { HeroSliderAlways } from "@/components/home/HeroSliderAlways";

interface Event {
  id: number;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  location: string;
  image: string;
  registrationDeadline?: string | null;
  maxParticipants?: number;
  availableSpots?: number;
  registrationFee?: number;
  requiresPayment?: boolean;
  isFeatured?: boolean;
  registerHref?: string;
}

const HARD_CODED_UPCOMING_EVENTS: Event[] = [
  {
    id: 103,
    title: "Fall 2026 Enrollments Open",
    description:
      "Tutoring for all grades and districts in math, physics, biology, chemistry, and English with personalized lesson plans.",
    category: "Fall Enrollment",
    date: "2026-09-01",
    time: "In-person and online classes",
    location: "All grades, all districts",
    image: "/events/AES_Fall_2026_Flyer_1_FREE_TRIAL(1).png",
    registrationDeadline: "2026-06-01",
    registerHref: "/events/register/fall-enrollments",
  },
  {
    id: 104,
    title: "AES Explorers",
    description:
      "10/16/32-week college-level research program with university faculty, researchers, PhD mentors, and publication opportunities.",
    category: "Research Camp",
    date: "2026-06-01",
    time: "All sessions are online",
    location: "Research mentorship and publishing support",
    image: "/events/AES_Explorers_Research.png",
    registrationDeadline: "2026-06-01",
    registerHref: "/events/register/aes-explorers",
  },
  {
    id: 105,
    title: "UACHIEVE College Prep",
    description:
      "College prep support with college list building, essay guidance, extracurricular counseling, and deadline tracking.",
    category: "College Prep",
    date: "2026-09-01",
    time: "In-person and virtual sessions",
    location: "All grades and service-based packages",
    image: "/events/AES_College_Prep%20(1)%20(1).png",
    registrationDeadline: "2026-07-15",
    registerHref: "/events/register/college-prep",
  },
];

const HARD_CODED_PAST_EVENTS: Event[] = [
  {
    id: 101,
    title: "AP Bridge Summer Program",
    description:
      "Bridge into AP success with guided prep, concept strengthening, and structured summer sessions.",
    category: "Summer Program",
    date: "2026-07-31",
    time: "Online",
    location: "Live virtual sessions",
    image: "/program-image/ap-bridge-summer-program.png",
    registrationDeadline: "2026-06-08",
  },
  {
    id: 102,
    title: "AES Explorers Summer Camp",
    description:
      "Research-focused summer camp with mentor guidance across Engineering, Law & Humanities, Pre-Med, and AI/ML tracks.",
    category: "Research Camp",
    date: "2026-08-07",
    time: "Online",
    location: "Live virtual sessions",
    image: "/program-image/aes-explorers-summer-camp.png",
    registrationDeadline: "2026-06-01",
  },
  {
    id: 103,
    title: "AES Champions Math Competition Prep",
    description:
      "Weekly cohort-based math competition prep with limited batch sizes, practice tests, and mock exams.",
    category: "Math Competition Prep",
    date: "2026-06-08",
    time: "Online",
    location: "Live virtual sessions",
    image: "/program-image/math-new-event.png",
    registrationDeadline: "2026-06-08",
  },
];

export default function EventsPage() {
  const ongoingEvents = HARD_CODED_UPCOMING_EVENTS;
  const pastEvents = HARD_CODED_PAST_EVENTS;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getEventDateLabel = (event: Event) => formatDate(event.date);
  const isExternalLink = (href: string) => /^https?:\/\//i.test(href);

  return (
    <main className="min-h-screen theme-bg-dark flex flex-col">
      <Header />
      {ongoingEvents.length > 0 ? (
        <HeroSliderAlways
          slides={ongoingEvents.map((event, index) => {
            const aiImages = [
              "/events/fall_enrollment_hero.jpg",
              "/events/research_camp_hero.jpg",
              "/events/college_prep_hero.jpg"
            ];
            return {
              title: event.title,
              subtitle: event.category,
              imageSrc: aiImages[index % aiImages.length],
              imageAlt: event.title,
              cta: {
                label: event.availableSpots === 0 ? "Event Full" : "Register Now",
                href: event.registerHref || "/book-session",
              },
              hideSecondaryCta: true,
              visualStyle: "default",
            };
          })}
          intervalMs={5000}
        />
      ) : (
        <section className="theme-bg-dark min-h-[58vh] pt-24 pb-10 lg:pt-28 lg:pb-12 relative overflow-hidden flex items-center">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 left-1/2 h-64 w-[34rem] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="absolute top-16 right-10 h-48 w-48 rounded-full bg-yellow-400/10 blur-3xl" />
            <div className="absolute bottom-8 left-10 h-56 w-56 rounded-full bg-fuchsia-400/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-40 w-full bg-gradient-to-t from-slate-950/25 to-transparent" />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
                <h1 className="bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 bg-clip-text text-5xl font-black text-transparent sm:text-6xl lg:text-7xl">
                  EVENTS
                </h1>
                <p className="mx-auto mt-5 mb-4 max-w-4xl text-base theme-text-muted sm:text-lg lg:text-4">
                  High-impact competitions and summer intensives for middle and high school students across online and in-person formats.
                </p>
                
                <div className="flex flex-wrap justify-center gap-3">
                  <Button asChild className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold">
                    <a href="#ongoing-events">
                      Explore Events
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
        </section>
      )}
      <section id="ongoing-events" className="py-12 md:py-14 theme-bg-medium relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-10">
            <Calendar className="h-6 w-6 text-yellow-400" />
            <h2 className="text-3xl font-bold theme-text-light">Ongoing Events</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ongoingEvents.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <Calendar className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No Ongoing Events</h3>
                <p className="text-gray-500">Check back soon for newly published events!</p>
              </div>
            ) : (
              ongoingEvents.map((event) => (
                <div key={event.id} className="group bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden hover:border-yellow-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-400/10 flex flex-col">
                  <div className="relative h-48 overflow-hidden">
                    <Image src={event.image} alt={event.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    {event.isFeatured && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-yellow-400 text-gray-900 border-0 font-semibold">Featured</Badge>
                      </div>
                    )}
                    <Badge className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white border-slate-600">{event.category}</Badge>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold theme-text-light mb-3 group-hover:text-yellow-400 transition-colors line-clamp-2">{event.title}</h3>
                    <p className="text-slate-400 mb-4 flex-1 line-clamp-3">{event.description}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm theme-text-muted"><Clock className="h-4 w-4 text-yellow-400" /><span>{event.time}</span></div>
                      <div className="flex items-center gap-2 text-sm theme-text-muted"><MapPin className="h-4 w-4 text-yellow-400" /><span>{event.location}</span></div>
                      {event.maxParticipants && (<div className="flex items-center gap-2 text-sm theme-text-muted"><Users className="h-4 w-4 text-yellow-400" /><span>{event.availableSpots !== undefined && event.availableSpots > 0 ? `${event.availableSpots} spots remaining` : event.availableSpots === 0 ? 'Event Full' : `Limited to ${event.maxParticipants} participants`}</span></div>)}
                      {event.requiresPayment && event.registrationFee !== undefined && (<div className="flex items-center gap-2 text-sm font-semibold text-yellow-400"><DollarSign className="h-4 w-4" /><span>${event.registrationFee}</span></div>)}
                    </div>
                    <Button asChild className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold group-hover:shadow-lg group-hover:shadow-yellow-400/50 transition-all" disabled={event.availableSpots === 0}>
                      {(() => {
                        const href = event.registerHref || "/book-session";
                        const label = event.availableSpots === 0 ? 'Event Full' : 'Register Now';
                        if (isExternalLink(href)) {
                          return (
                            <a href={href}>
                              {label}
                              {event.availableSpots !== 0 && <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />}
                            </a>
                          );
                        }
                        return (
                          <Link href={href}>
                            {label}
                            {event.availableSpots !== 0 && <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />}
                          </Link>
                        );
                      })()}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
      <section className="py-16 theme-bg-dark relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-2"><Clock className="h-6 w-6 text-blue-400" /><h2 className="text-3xl font-bold theme-text-light">Past Events</h2></div>
          </div>
          {pastEvents.length === 0 ? (
            <div className="text-center py-20"><Clock className="h-16 w-16 text-gray-600 mx-auto mb-4" /><p className="text-gray-500">No past events to display</p></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {pastEvents.map((event) => (
                <div key={event.id} className="flex flex-col md:flex-row gap-6 bg-slate-800/50 border border-slate-700 rounded-2xl p-4 hover:bg-slate-800 transition-colors">
                  <div className="relative w-full md:w-48 h-48 md:h-auto shrink-0 rounded-xl overflow-hidden"><Image src={event.image} alt={event.title} fill className="object-cover" /></div>
                  <div className="flex-1 py-2 pr-2">
                    <div className="text-sm text-blue-400 mb-2 font-medium">{getEventDateLabel(event)}</div>
                    <h3 className="text-xl font-bold theme-text-light mb-3">{event.title}</h3>
                    <p className="text-slate-400 mb-4 line-clamp-3">{event.description}</p>
                    <Badge className="bg-slate-700 text-slate-300 border-slate-600">{event.category}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
      <Chatbot />
    </main>
  );
}
