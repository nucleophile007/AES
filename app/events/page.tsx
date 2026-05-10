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

interface Event {
  id: number;
  title: string;
  description: string;
  category: string;
  date: string;
  displayDate?: string;
  time: string;
  location: string;
  image: string;
  maxParticipants?: number;
  availableSpots?: number;
  registrationFee?: number;
  requiresPayment?: boolean;
  isFeatured?: boolean;
  registerHref?: string;
}

const HARD_CODED_UPCOMING_EVENTS: Event[] = [
  {
    id: 102,
    title: "AP Bridge Summer Program",
    description:
      "Bridge into AP success with guided prep, concept strengthening, and structured summer sessions.",
    category: "Summer Program",
    date: "2026-06-01",
    displayDate: "Jun 8 - Jul 31",
    time: "Online",
    location: "Live virtual sessions",
    image: "/program-image/ap-bridge-summer-program.png",
    registerHref: "/events/register/ap-bridge",
  },
  {
    id: 103,
    title: "AES Explorers Summer Camp",
    description:
      "Research-focused summer camp with mentor guidance across Engineering, Law & Humanities, Pre-Med, and AI/ML tracks.",
    category: "Research Camp",
    date: "2026-06-01",
    displayDate: "Jun 1 - Aug 7",
    time: "Online",
    location: "Live virtual sessions",
    image: "/program-image/aes-explorers-summer-camp.png",
    registerHref: "/events/register/aes-explorers",
  },
  {
    id: 104,
    title: "AES Champions Math Competition Prep",
    description:
      "Weekly cohort-based math competition prep with limited batch sizes, practice tests, and mock exams.",
    category: "Math Competition Prep",
    date: "2026-06-08",
    displayDate: "Starts Jun 8",
    time: "Online",
    location: "Live virtual sessions",
    image: "/program-image/math-new-event.png",
    registerHref: "/events/register/aes-champions",
  },
];

const HARD_CODED_PAST_EVENTS: Event[] = [
  {
    id: 201,
    title: "Greater Sancrento Math League",
    description:
      "High-energy math competition with medals and certificates for top performers and participants.",
    category: "Math Competition",
    date: "2026-04-25",
    time: "10:00 AM - 1:00 PM",
    location: "Chinmaya Mission, Sacramento",
    image: "/program-image/greater-sacramento-math-league.png",
  },
];

export default function EventsPage() {
  const upcomingEvents = HARD_CODED_UPCOMING_EVENTS;
  const pastEvents = HARD_CODED_PAST_EVENTS;
  const featuredEvent = upcomingEvents[0];
  const supportingEvents = upcomingEvents.slice(1, 3);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getEventDateLabel = (event: Event) => event.displayDate || formatDate(event.date);
  const isExternalLink = (href: string) => /^https?:\/\//i.test(href);

  return (
    <main className="min-h-screen theme-bg-dark flex flex-col">
      <Header />
      <section className="theme-bg-dark pt-24 pb-10 lg:pt-28 lg:pb-12 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 left-1/2 h-64 w-[34rem] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute top-16 right-10 h-48 w-48 rounded-full bg-yellow-400/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-40 w-full bg-gradient-to-t from-slate-950/25 to-transparent" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7 text-center lg:text-left">
              <Badge className="mb-4 bg-yellow-400/10 text-yellow-300 border-yellow-300/30 hover:bg-yellow-400/20 px-4 py-1 text-sm">
                Community & Learning
              </Badge>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight theme-text-light mb-4 leading-tight">
                Upcoming <span className="text-yellow-400">Events</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-300/90 max-w-2xl mx-auto lg:mx-0 mb-6">
                High-impact competitions and summer intensives for middle and high school students across online and in-person formats.
              </p>
              <div className="mb-7 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto lg:mx-0 text-sm">
                <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-slate-200">Mixed format: in-person and live online events</div>
            
              </div>
              <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                <Button asChild className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold">
                  <a href="#upcoming-events">
                    Explore Events
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>

            <div className="lg:col-span-5">
              {featuredEvent && (
                <div className="rounded-2xl border border-white/20 bg-white/5 p-3 backdrop-blur-sm shadow-[0_20px_50px_rgba(2,6,23,0.5)]">
                  <div className="relative h-56 sm:h-64 rounded-xl overflow-hidden">
                    <Image src={featuredEvent.image} alt={featuredEvent.title} fill className="object-cover" priority />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                    <Badge className="absolute top-3 left-3 bg-slate-900/85 text-white border-slate-500">Featured</Badge>
                    <div className="absolute bottom-3 left-3 right-3 rounded-lg border border-white/20 bg-slate-950/85 px-3 py-2 backdrop-blur-sm">
                      <p className="text-xs font-semibold tracking-wide text-yellow-200 mb-1">{getEventDateLabel(featuredEvent)} • {featuredEvent.category}</p>
                      <h3 className="text-lg font-bold text-white leading-tight drop-shadow-sm">{featuredEvent.title}</h3>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {supportingEvents.map((event) => (
                      <div key={event.id} className="rounded-lg border border-white/15 bg-slate-900/40 p-2">
                        <div className="relative h-20 rounded-md overflow-hidden">
                          <Image src={event.image} alt={event.title} fill className="object-cover" />
                        </div>
                        <p className="mt-2 text-xs text-slate-200 line-clamp-2">{event.title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <section id="upcoming-events" className="py-12 md:py-14 theme-bg-medium relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-10">
            <Calendar className="h-6 w-6 text-yellow-400" />
            <h2 className="text-3xl font-bold theme-text-light">Upcoming Events</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingEvents.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <Calendar className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No Upcoming Events</h3>
                <p className="text-gray-500">Check back soon for new events!</p>
              </div>
            ) : (
              upcomingEvents.map((event) => (
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
                      <div className="flex items-center gap-2 text-sm theme-text-muted"><Calendar className="h-4 w-4 text-yellow-400" /><span>{getEventDateLabel(event)}</span></div>
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
                            <a href={href} target="_blank" rel="noopener noreferrer">
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
