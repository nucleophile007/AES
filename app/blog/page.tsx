"use client";
import React from "react";
import Header from "@/components/home/Header";
import { Badge } from "@/components/ui/badge";

import Footer from "@/components/home/Footer";
import Chatbot from "@/components/home/Chatbot";
import { BookOpen, Search, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Blog categories matching website theme
const heroCategories = [
  {
    id: "student-spotlights",
    title: "Student Spotlights",
    icon: (props: React.SVGProps<SVGSVGElement>) => <User className="h-6 w-6 text-yellow-400 group-hover:scale-125 group-hover:rotate-6 transition-transform duration-300" {...props} />, 
  },
  {
    id: "research-opportunities",
    title: "Research Opportunities and Ideas",
    icon: (props: React.SVGProps<SVGSVGElement>) => <BookOpen className="h-6 w-6 text-yellow-400 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300" {...props} />, 
  },
  {
    id: "education-admissions",
    title: "Education and College Admissions",
    icon: (props: React.SVGProps<SVGSVGElement>) => <BookOpen className="h-6 w-6 text-yellow-400 group-hover:rotate-180 group-hover:scale-110 transition-transform duration-300" {...props} />, 
  },
  {
    id: "conduct-research",
    title: "Research Showcase",
    icon: (props: React.SVGProps<SVGSVGElement>) => <Search className="h-6 w-6 text-yellow-400 group-hover:scale-125 group-hover:-rotate-6 transition-transform duration-300" {...props} />, 
  },
];



export default function AESBlogPage() {

  return (
    <main className="min-h-screen theme-bg-dark flex flex-col">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="theme-bg-dark py-16 lg:py-24 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-400 rounded-full opacity-10 animate-float"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-blue-400 rounded-full opacity-10 animate-float-reverse"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-purple-400 rounded-full opacity-10 animate-float"></div>
          <div className="absolute top-1/3 right-1/3 w-8 h-8 bg-green-400 rounded-full opacity-10 animate-float-reverse"></div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 animate-slide-in-bottom">
            <h1 className="text-4xl lg:text-5xl font-bold theme-text-light mb-6">
              Acharya Blog
            </h1>
            <p className="text-lg theme-text-muted max-w-3xl mx-auto animate-slide-in-bottom" style={{ animationDelay: '0.2s' }}>
              Based on our experience at some of the top research institutions, the Acharya team and community have a lot of insights to offer you on all sorts of topics!
            </p>
          </div>
          {/* Category Cards Grid - vibrant and eye-catching */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {heroCategories.map(({ title, icon: Icon, id }, index) => {
              // Different gradient colors for each card
              const gradients = [
                "from-blue-500/20 via-purple-500/20 to-pink-500/20",
                "from-yellow-400/20 via-orange-500/20 to-red-500/20",
                "from-emerald-500/20 via-teal-500/20 to-cyan-500/20",
                "from-rose-500/20 via-fuchsia-500/20 to-violet-500/20",
              ];
              const accentGradients = [
                "from-blue-400 via-purple-400 to-pink-400",
                "from-yellow-400 via-orange-400 to-red-400",
                "from-emerald-400 via-teal-400 to-cyan-400",
                "from-rose-400 via-fuchsia-400 to-violet-400",
              ];
              
              const card = (
                <div
                  key={index}
                  className="bg-gradient-to-br from-slate-800 via-slate-800/95 to-slate-900 border-2 border-slate-700/50 rounded-2xl p-8 cursor-pointer shadow-2xl relative overflow-hidden h-full"
                >
                  {/* Vibrant accent bar on left - always visible */}
                  <div className={`absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b ${accentGradients[index]} opacity-60`}></div>
                  
                  {/* Background gradient overlay - always visible */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradients[index]} opacity-40 pointer-events-none`}></div>

                  {/* Content */}
                  <div className="relative z-10 flex flex-col h-full">
                    {/* Icon section */}
                    <div className="mb-6">
                      {id === "conduct-research" ? (
                        <div className="relative w-20 h-20 flex items-center justify-center">
                          <div className="absolute -inset-4 rounded-full bg-yellow-400/10 blur-2xl" />
                          <div className="relative">
                            <Search className="h-16 w-16 text-yellow-400" strokeWidth={2.75} />
                            <div className="absolute top-[14px] left-[22px] h-8 w-8 rounded-full bg-slate-900/60 border-2 border-yellow-400 flex items-center justify-center shadow-2xl">
                              <div className="h-4 w-4 rounded-full bg-slate-200/80" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className={`w-20 h-20 bg-gradient-to-br ${accentGradients[index]} border-2 border-yellow-400/50 rounded-2xl flex items-center justify-center shadow-2xl`}>
                          <div className="w-full h-full bg-slate-900/40 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            {typeof Icon === 'function' ? <Icon /> : null}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-2xl sm:text-3xl mb-4 leading-tight drop-shadow-lg">
                        {title}
                      </h3>
                      
                      {/* Decorative line - always visible */}
                      <div className={`h-1 bg-gradient-to-r ${accentGradients[index]} rounded-full opacity-50 w-16`}></div>
                    </div>
                  </div>
                </div>
              );

              if (id === "conduct-research") {
                return (
                  <Link key={index} href="/research" className="block h-full">
                    {card}
                  </Link>
                );
              }

              return card;
            })}
          </div>
        </div>
      </section>



      {/* Dummy Content Section for Future Use */}
      <section className="container mx-auto mt-20 mb-10 animate-fadeIn theme-bg-dark">
        <div className="glass-effect rounded-2xl shadow-lg p-10 text-center border border-yellow-400/40">
          <h2 className="text-2xl font-bold mb-4 text-yellow-400 animate-typewriter">More Coming Soon</h2>
          <p className="text-blue-100/90 mb-2 animate-fadeInUp">Stay tuned for more stories, interviews, and research highlights.</p>
          {/* AI generated placeholder image */}
          <Image
            src="/placeholder.svg"
            alt="Placeholder"
            width={160}
            height={160}
            className="mx-auto mt-6 w-40 h-40 object-contain opacity-90 animate-float border-4 border-yellow-400/60 rounded-full shadow-lg"
          />
        </div>
      </section>

      {/* Footer */}
      <Footer />
      <Chatbot />

      {/* Animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 1s;
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-30px);}
          to { opacity: 1; transform: translateY(0);}
        }
        .animate-fadeInDown {
          animation: fadeInDown 0.7s;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px);}
          to { opacity: 1; transform: translateY(0);}
        }
        .animate-fadeInUp {
          animation: fadeInUp 1s;
        }
        // @keyframes slideInBottom {
        //   from { opacity: 0; transform: translateY(60px); }
        //   to { opacity: 1; transform: translateY(0); }
        // }
        // .animate-slide-in-bottom {
        //   animation: slideInBottom 1s;
        // }
        // @keyframes slideInRight {
        //   from { opacity: 0; transform: translateX(40px); }
        //   to { opacity: 1; transform: translateX(0); }
        // }
        // .animate-slide-in-right {
        //   animation: slideInRight 0.7s;
        // }
        // @keyframes morphing {
        //   0% { border-radius: 2rem 2rem 2rem 2rem; }
        //   50% { border-radius: 2.5rem 1.5rem 2.5rem 1.5rem; }
        //   100% { border-radius: 2rem 2rem 2rem 2rem; }
        // }
        // .animate-morphing {
        //   animation: morphing 6s infinite alternate ease-in-out;
        // }
        // @keyframes shimmer {
        //   0% { background-position: -400px 0; }
        //   100% { background-position: 400px 0; }
        // }
        // .animate-shimmer {
        //   background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%);
        //   background-size: 400px 100%;
        //   animation: shimmer 2s infinite;
        // }
        // @keyframes float {
        //   0%, 100% { transform: translateY(0); }
        //   50% { transform: translateY(-16px); }
        // }
        // .animate-float {
        //   animation: float 4s ease-in-out infinite;
        // }
        // @keyframes floatReverse {
        //   0%, 100% { transform: translateY(0); }
        //   50% { transform: translateY(16px); }
        // }
        // .animate-float-reverse {
        //   animation: floatReverse 4s ease-in-out infinite;
        // }
        // @keyframes pulseGlow {
        //   0%, 100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.7); }
        //   50% { box-shadow: 0 0 16px 4px rgba(251, 191, 36, 0.7); }
        // }
        // .animate-pulse-glow {
        //   animation: pulseGlow 2s infinite;
        // }
        // @keyframes typewriter {
        //   from { width: 0; }
        //   to { width: 100%; }
        // }
        // .animate-typewriter {
        //   overflow: hidden;
        //   white-space: nowrap;
        //   border-right: 2px solid #0f3460;
        //   width: 100%;
        //   animation: typewriter 2s steps(40, end) 1;
        // }
        // .glass-effect {
        //   background: rgba(255,255,255,0.7);
        //   backdrop-filter: blur(12px) saturate(120%);
        //   box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
        // }
        .animate-wiggle { animation: wiggle 0.5s ease-in-out; }
        @keyframes wiggle { 0%, 100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
      `}</style>
    </main>
  );
}