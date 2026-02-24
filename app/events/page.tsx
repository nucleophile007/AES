"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import Chatbot from "@/components/home/Chatbot";
import { Calendar, Clock, MapPin, ArrowRight, Users, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import EventCardSkeleton from "@/components/skeletons/EventCardSkeleton";

interface Event {
  id: number;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  location: string;
  image: string;
  maxParticipants?: number;
  availableSpots?: number;
  registrationFee?: number;
  requiresPayment?: boolean;
  isFeatured?: boolean;
}

export default function EventsPage() {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/events/all', {
        // Use Next.js cache
        next: { revalidate: 600 }, // 10 minutes
      });
      if (response.ok) {
        const data = await response.json();
        setUpcomingEvents(data.upcoming || []);
        setPastEvents(data.past || []);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <main className="min-h-screen theme-bg-dark flex flex-col">
      <Header />
      <section className="theme-bg-dark py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-10 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-10 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <Badge className="mb-4 bg-yellow-400/10 text-yellow-400 border-yellow-400/20 hover:bg-yellow-400/20 px-4 py-1 text-sm">
            Community & Learning
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold theme-text-light mb-6">
            Upcoming <span className="text-yellow-400">Events</span>
          </h1>
          <p className="text-xl theme-text-muted max-w-2xl mx-auto mb-8">
            Join our workshops, seminars, and webinars to enhance your academic journey and college preparation.
          </p>
        </div>
      </section>
      <section className="py-16 theme-bg-medium relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-10">
            <Calendar className="h-6 w-6 text-yellow-400" />
            <h2 className="text-3xl font-bold theme-text-light">Upcoming Events</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              <>
                <EventCardSkeleton />
                <EventCardSkeleton />
                <EventCardSkeleton />
              </>
            ) : upcomingEvents.length === 0 ? (
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
                      <div className="flex items-center gap-2 text-sm theme-text-muted"><Calendar className="h-4 w-4 text-yellow-400" /><span>{formatDate(event.date)}</span></div>
                      <div className="flex items-center gap-2 text-sm theme-text-muted"><Clock className="h-4 w-4 text-yellow-400" /><span>{event.time}</span></div>
                      <div className="flex items-center gap-2 text-sm theme-text-muted"><MapPin className="h-4 w-4 text-yellow-400" /><span>{event.location}</span></div>
                      {event.maxParticipants && (<div className="flex items-center gap-2 text-sm theme-text-muted"><Users className="h-4 w-4 text-yellow-400" /><span>{event.availableSpots !== undefined && event.availableSpots > 0 ? `${event.availableSpots} spots remaining` : event.availableSpots === 0 ? 'Event Full' : `Limited to ${event.maxParticipants} participants`}</span></div>)}
                      {event.requiresPayment && event.registrationFee !== undefined && (<div className="flex items-center gap-2 text-sm font-semibold text-yellow-400"><DollarSign className="h-4 w-4" /><span>${event.registrationFee}</span></div>)}
                    </div>
                    <Button asChild className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold group-hover:shadow-lg group-hover:shadow-yellow-400/50 transition-all" disabled={event.availableSpots === 0}>
                      <Link href={`/events/register/${event.id}`}>{event.availableSpots === 0 ? 'Event Full' : 'Register Now'}{event.availableSpots !== 0 && <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />}</Link>
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
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex gap-6 bg-slate-800/50 border border-slate-700 rounded-2xl p-4 animate-pulse">
                <div className="relative w-48 h-48 shrink-0 rounded-xl bg-slate-700"></div>
                <div className="flex-1 py-2 space-y-3">
                  <div className="h-4 bg-slate-700 rounded w-24"></div>
                  <div className="h-6 bg-slate-700 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-700 rounded w-full"></div>
                    <div className="h-4 bg-slate-700 rounded w-5/6"></div>
                  </div>
                  <div className="h-6 bg-slate-700 rounded w-24"></div>
                </div>
              </div>
              <div className="flex gap-6 bg-slate-800/50 border border-slate-700 rounded-2xl p-4 animate-pulse">
                <div className="relative w-48 h-48 shrink-0 rounded-xl bg-slate-700"></div>
                <div className="flex-1 py-2 space-y-3">
                  <div className="h-4 bg-slate-700 rounded w-24"></div>
                  <div className="h-6 bg-slate-700 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-700 rounded w-full"></div>
                    <div className="h-4 bg-slate-700 rounded w-5/6"></div>
                  </div>
                  <div className="h-6 bg-slate-700 rounded w-24"></div>
                </div>
              </div>
            </div>
          ) : pastEvents.length === 0 ? (
            <div className="text-center py-20"><Clock className="h-16 w-16 text-gray-600 mx-auto mb-4" /><p className="text-gray-500">No past events to display</p></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {pastEvents.map((event) => (
                <div key={event.id} className="flex flex-col md:flex-row gap-6 bg-slate-800/50 border border-slate-700 rounded-2xl p-4 hover:bg-slate-800 transition-colors">
                  <div className="relative w-full md:w-48 h-48 md:h-auto shrink-0 rounded-xl overflow-hidden"><Image src={event.image} alt={event.title} fill className="object-cover" /></div>
                  <div className="flex-1 py-2 pr-2">
                    <div className="text-sm text-blue-400 mb-2 font-medium">{formatDate(event.date)}</div>
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
