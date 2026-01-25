"use client";
import React from "react";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import Chatbot from "@/components/home/Chatbot";
import { Calendar, Clock, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

// Dummy data for upcoming events
const upcomingEvents = [
    {
        id: 1,
        title: "SAT Prep Workshop: Mastering Math",
        date: "February 15, 2026",
        time: "10:00 AM - 12:00 PM",
        location: "Online (Zoom)",
        description: "Join our expert tutors for a deep dive into the most challenging SAT Math problems. Learn strategies to boost your score.",
        category: "Workshop",
        image: "/nav-sat.png" // Using existing image for now
    },
    {
        id: 2,
        title: "College Application Q&A Session",
        date: "February 22, 2026",
        time: "4:00 PM - 5:30 PM",
        location: "AES Center, San Jose",
        description: "Get your questions answered by former admissions officers from top universities. Perfect for juniors and seniors.",
        category: "Seminar",
        image: "/nav-college.png"
    },
    {
        id: 3,
        title: "Introduction to Research for High Schoolers",
        date: "March 5, 2026",
        time: "6:00 PM - 7:30 PM",
        location: "Online (Zoom)",
        description: "Discover how to get started with research projects and why they matter for college admissions.",
        category: "Webinar",
        image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=400&fit=crop"
    }
];

// Dummy data for recent events
const recentEvents = [
    {
        id: 101,
        title: "Winter Science Olympiad Bootcamp",
        date: "January 10, 2026",
        summary: "A intensive 2-day bootcamp preparing students for regional competitions. Over 50 students participated!",
        image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=400&fit=crop"
    },
    {
        id: 102,
        title: "Essay Writing Masterclass",
        date: "December 15, 2025",
        summary: "Students learned the art of storytelling for their personal statements with our lead writing coach.",
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop"
    }
];

export default function EventsPage() {
    return (
        <main className="min-h-screen theme-bg-dark flex flex-col">
            <Header />

            {/* Hero Section */}
            <section className="theme-bg-dark py-20 lg:py-28 relative overflow-hidden">
                {/* Background Elements */}
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

            {/* Upcoming Events Section */}
            <section className="py-16 theme-bg-medium relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2 mb-10">
                        <Calendar className="h-6 w-6 text-yellow-400" />
                        <h2 className="text-3xl font-bold theme-text-light">Upcoming Events</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {upcomingEvents.map((event) => (
                            <div key={event.id} className="group bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden hover:border-yellow-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-400/10 flex flex-col">
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={event.image}
                                        alt={event.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <Badge className="bg-slate-900/80 backdrop-blur-sm text-yellow-400 border-yellow-400/30">
                                            {event.category}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center gap-2 text-sm text-yellow-400 mb-3 font-medium">
                                        <Calendar className="h-4 w-4" />
                                        <span>{event.date}</span>
                                    </div>

                                    <h3 className="text-xl font-bold theme-text-light mb-3 group-hover:text-yellow-400 transition-colors">
                                        {event.title}
                                    </h3>

                                    <p className="text-slate-400 mb-6 flex-1 line-clamp-3">
                                        {event.description}
                                    </p>

                                    <div className="space-y-3 pt-6 border-t border-slate-700/50">
                                        <div className="flex items-center gap-2 text-sm text-slate-400">
                                            <Clock className="h-4 w-4 text-blue-400" />
                                            <span>{event.time}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-400">
                                            <MapPin className="h-4 w-4 text-green-400" />
                                            <span>{event.location}</span>
                                        </div>
                                    </div>

                                    <Button className="w-full mt-6 bg-yellow-400 text-slate-900 hover:bg-yellow-300 font-semibold group-hover:translate-y-[-2px] transition-transform">
                                        Register Now
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Recent Events Section */}
            <section className="py-16 theme-bg-dark relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-2">
                            <Clock className="h-6 w-6 text-blue-400" />
                            <h2 className="text-3xl font-bold theme-text-light">Recent Highlights</h2>
                        </div>
                        <Link href="/blog" className="text-yellow-400 hover:text-yellow-300 flex items-center gap-1 text-sm font-medium transition-colors">
                            Read more on our blog <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {recentEvents.map((event) => (
                            <div key={event.id} className="flex flex-col md:flex-row gap-6 bg-slate-800/50 border border-slate-700 rounded-2xl p-4 hover:bg-slate-800 transition-colors">
                                <div className="w-full md:w-48 h-48 md:h-auto shrink-0 rounded-xl overflow-hidden">
                                    <img
                                        src={event.image}
                                        alt={event.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 py-2 pr-2">
                                    <div className="text-sm text-blue-400 mb-2 font-medium">{event.date}</div>
                                    <h3 className="text-xl font-bold theme-text-light mb-3">{event.title}</h3>
                                    <p className="text-slate-400 mb-4">{event.summary}</p>
                                    <Button variant="link" className="text-yellow-400 p-0 h-auto hover:text-yellow-300">
                                        View Recap &rarr;
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
            <Chatbot />
        </main>
    );
}
