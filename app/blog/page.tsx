"use client";
import React from "react";
import Header from "@/components/home/Header";
import { Badge } from "@/components/ui/badge";

import Footer from "@/components/home/Footer";
import Chatbot from "@/components/home/Chatbot";
import { BookOpen, User } from "lucide-react";
import Image from "next/image";

// Dummy hero categories with improved pastel gradients and icons
const heroCategories = [
  {
    id: "student-spotlights",
    title: "Student Spotlights",
    gradient: "from-rose-300 via-fuchsia-200 to-indigo-200",
    icon: (props: React.SVGProps<SVGSVGElement>) => <User className="h-6 w-6 text-blue-700 group-hover:scale-125 group-hover:rotate-6 transition-transform duration-300" {...props} />, 
  },
  {
    id: "research-opportunities",
    title: "Research Opportunities and Ideas",
    gradient: "from-orange-200 via-amber-200 to-yellow-100",
    icon: (props: React.SVGProps<SVGSVGElement>) => <BookOpen className="h-6 w-6 text-amber-700 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300" {...props} />, 
  },
  {
    id: "education-admissions",
    title: "Education and College Admissions",
    gradient: "from-sky-200 via-blue-200 to-cyan-100",
    icon: (props: React.SVGProps<SVGSVGElement>) => <BookOpen className="h-6 w-6 text-sky-700 group-hover:rotate-180 group-hover:scale-110 transition-transform duration-300" {...props} />, 
  },
  {
    id: "meet-mentors",
    title: "Meet our Mentors",
    gradient: "from-teal-200 via-emerald-200 to-lime-100",
    icon: () => (
      <div className="grid grid-cols-2 gap-1 group-hover:animate-bounce">
        {[0, 1, 2, 3].map((delay, i) => (
          <div
            key={i}
            className="w-2 h-2 bg-emerald-700 rounded-full animate-pulse"
            style={{ animationDelay: `${i * 0.1}s` }}
          ></div>
        ))}
      </div>
    ),
  },
  {
    id: "conduct-research",
    title: "How to Conduct and Showcase Research",
    gradient: "from-yellow-200 via-orange-200 to-rose-100",
    icon: (props: React.SVGProps<SVGSVGElement>) => <BookOpen className="h-6 w-6 text-orange-700 group-hover:scale-125 group-hover:-rotate-6 transition-transform duration-300" {...props} />, 
  },
  {
    id: "about-aes",
    title: "About AES",
    gradient: "from-violet-200 via-fuchsia-100 to-amber-100",
    icon: () => (
      <div className="w-6 h-6 border-2 border-violet-700 rounded flex items-end justify-center p-1 group-hover:animate-wiggle">
        <div className="flex space-x-0.5 items-end">
          {[2, 3, 1].map((h, i) => (
            <div
              key={i}
              className={`w-1 h-${h} bg-violet-700 rounded-sm animate-pulse`}
              style={{ animationDelay: `${i * 0.1}s` }}
            ></div>
          ))}
        </div>
      </div>
    ),
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
          {/* Category Cards Grid - vibrant Polygence style */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {heroCategories.map(({ title, gradient, icon: Icon, id }, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br ${gradient} rounded-3xl p-6 sm:p-8 cursor-pointer shadow-xl hover:shadow-2xl hover:scale-[1.04] hover:-rotate-1 transition-all duration-300 group relative overflow-hidden animate-float`}

                style={{ willChange: 'transform' }}
              >
                {/* Shimmer */}
                <div className="absolute inset-0 bg-white/10 animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                {/* Content */}
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex-1">
                    <h3 className="text-gray-800 font-semibold text-xl sm:text-2xl mb-1 group-hover:scale-[1.06] transition-transform duration-300">
                      {title}
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base">Click to explore more</p>
                  </div>
                  <div className="ml-4">
                    <div className="w-14 h-14 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                      {typeof Icon === 'function' ? <Icon /> : null}
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
            src="/ai-placeholder.svg"
            alt="AI Placeholder"
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