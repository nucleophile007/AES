"use client";
import React from "react";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import Chatbot from "@/components/home/Chatbot";
import { BookOpen, Microscope, User } from "lucide-react";
import Link from "next/link";

export default function AESBlogPage() {
  const categories = [
    {
      title: "AES Blogs",
      description: "Mentor and student blogs with month-wise filters and search.",
      href: "/blog/aes-blogs",
      icon: <BookOpen className="h-8 w-8 text-cyan-300" />,
    },
    {
      title: "Student Spotlights",
      description: "Featured stories from student research and learning journeys.",
      href: "/blog/student-spotlights",
      icon: <User className="h-8 w-8 text-yellow-300" />,
    },
    {
      title: "Research Showcase",
      description: "Browse published research projects and presentation outcomes.",
      href: "/research",
      icon: <Microscope className="h-8 w-8 text-emerald-300" />,
    },
  ];

  return (
    <main className="min-h-screen theme-bg-dark flex flex-col">
      <Header />

      <section className="relative overflow-hidden theme-bg-medium border-b border-yellow-400/10 pt-20 sm:pt-24">
        <div className="absolute inset-0 pointer-events-none">
          <svg
            className="absolute inset-0 h-full w-full text-yellow-400/15"
            viewBox="0 0 1200 420"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <pattern id="blog-landing-contour" width="180" height="180" patternUnits="userSpaceOnUse">
                <path d="M0 90 C 45 60, 90 60, 180 90" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M0 120 C 45 90, 90 90, 180 120" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.7" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#blog-landing-contour)" />
          </svg>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-12 sm:py-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-yellow-400 tracking-tight leading-tight drop-shadow-sm">
            Acharya Blog
          </h1>
          <p className="mt-4 text-lg sm:text-xl theme-text-muted max-w-3xl">
            Choose a section to explore mentor insights, student stories, and research-driven learning.
          </p>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
            {categories.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-yellow-400/40 hover:shadow-[0_16px_36px_rgba(15,23,42,0.45)]"
              >
                <div className="mb-4">{item.icon}</div>
                <h2 className="text-2xl font-semibold text-slate-100">{item.title}</h2>
                <p className="mt-2 text-slate-300 text-sm leading-relaxed">{item.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <Chatbot />
    </main>
  );
}