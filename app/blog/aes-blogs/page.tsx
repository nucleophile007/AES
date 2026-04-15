"use client";
import React from "react";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import Chatbot from "@/components/home/Chatbot";
import { Badge } from "@/components/ui/badge";
import AESBlogsContent from "./AESBlogsContent";

export default function AESBlogsPage() {
  return (
    <main className="min-h-screen theme-bg-dark flex flex-col">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="theme-bg-dark py-12 lg:py-16 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-400 rounded-full opacity-10 animate-float"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-blue-400 rounded-full opacity-10 animate-float-reverse"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-purple-400 rounded-full opacity-10 animate-float"></div>
          <div className="absolute top-1/3 right-1/3 w-8 h-8 bg-green-400 rounded-full opacity-10 animate-float-reverse"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-yellow-400/10 text-yellow-400 border-yellow-400/20">
              📚 Student Blogs
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent mb-4">
              AES Student Blogs
            </h1>
            <p className="text-lg theme-text-muted max-w-3xl mx-auto">
              Explore research insights, academic journeys, and creative perspectives from our talented student community
            </p>
              <p className="text-base theme-text-muted max-w-3xl mx-auto mt-4 leading-7">
                This section is meant for families who want practical explanations, not just headlines. We publish short guides and reflections on academic planning, student growth, and the habits that help learners stay consistent. The goal is to make complex topics easier to understand while still giving enough detail to be genuinely useful.
              </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <AESBlogsContent />
        <section className="container mx-auto px-4 pb-10">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 text-slate-200 max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold theme-text-light mb-3">
              Why these articles exist
            </h2>
            <p className="theme-text-muted leading-7 mb-3">
              AES blogs are written to answer the kinds of questions parents and students ask before they commit to a program. That includes how to choose a tutor, how to think about long-term admissions strategy, how to approach competitions, and how to build productive study routines at home. Each post is meant to be a helpful reference rather than a sales pitch.
            </p>
            <p className="theme-text-muted leading-7">
              If you are comparing program options, these posts can give you more context about the methods we use and why they matter. They also complement our testimonials and program pages by showing the reasoning behind our approach.
            </p>
          </div>
        </section>

      {/* Footer */}
      <Footer />
      <Chatbot />
    </main>
  );
}
