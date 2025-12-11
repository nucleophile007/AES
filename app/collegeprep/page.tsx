"use client";
import React from "react";
import { motion } from "framer-motion";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import Chatbot from "@/components/home/Chatbot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Star, Target, Users, FileText, Trophy, Lightbulb, Globe, Calendar, ArrowRight, CheckIcon, ChevronDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import Link from "next/link";
import { CardStack } from "@/components/ui/card-stack";
import { Highlight } from "@/components/ui/highlight";
import ImageVideoCard from "@/components/ui/image-video-card";
import StepCard from "@/components/ui/step-card";
import { DraggableCardBody, DraggableCardContainer } from "@/components/ui/draggable-card";
import EffortLevelInfographic from "@/components/home/effort-level-infographic"

// StrengthBasedDiscoveryInfographic Component
const StrengthBasedDiscoveryInfographic = () => {
  const [cardsVisible, setCardsVisible] = React.useState(false)

  const createPillar = (centerX: number, pillarIndex: number) => {
    const getGradientIds = (index: number) => {
      switch (index) {
        case 0:
          return {
            column: "columnGradient",
            capital: "capitalGradient",
            title: "titleGradient",
            stroke: "#b45309", // Warm amber
          }
        case 1:
          return {
            column: "blueColumnGradient",
            capital: "blueCapitalGradient",
            title: "blueTitleGradient",
            stroke: "#075985", // Deep ocean blue
          }
        case 2:
          return {
            column: "greenColumnGradient",
            capital: "greenCapitalGradient",
            title: "greenTitleGradient",
            stroke: "#1e40af", // Theme blue
          }
        default:
          return {
            column: "columnGradient",
            capital: "capitalGradient",
            title: "titleGradient",
            stroke: "#b45309", // Warm amber
          }
      }
    }

    const gradients = getGradientIds(pillarIndex)

    return (
      <g
                 className="transition-all duration-300"
        
      >
        <circle
          cx={centerX}
          cy="80"
          r="45"
          fill={`url(#${gradients.capital})`}
          stroke={gradients.stroke}
          strokeWidth="3"
          filter="url(#shadow)"
        />

        <rect
          x={centerX - 75}
          y="115"
          width="150"
          height="10"
          rx="5"
          fill={`url(#${gradients.capital})`}
          stroke={gradients.stroke}
          strokeWidth="2"
        />

        <rect
          x={centerX - 65}
          y="135"
          width="130"
          height="8"
          rx="4"
          fill={`url(#${gradients.column})`}
          stroke={gradients.stroke}
          strokeWidth="1"
        />
        <rect
          x={centerX - 65}
          y="148"
          width="130"
          height="6"
          rx="3"
          fill={`url(#${gradients.column})`}
          stroke={gradients.stroke}
          strokeWidth="1"
        />

        <rect
          x={centerX - 60}
          y="160"
          width="120"
          height="350"
          fill={`url(#${gradients.column})`}
          stroke={gradients.stroke}
          strokeWidth="3"
          filter="url(#shadow)"
        />

        <line
          x1={centerX - 35}
          y1="165"
          x2={centerX - 35}
          y2="505"
          stroke={gradients.stroke}
          strokeWidth="1.5"
          opacity="0.6"
        />
        <line
          x1={centerX - 15}
          y1="165"
          x2={centerX - 15}
          y2="505"
          stroke={gradients.stroke}
          strokeWidth="1.5"
          opacity="0.6"
        />
        <line x1={centerX} y1="165" x2={centerX} y2="505" stroke={gradients.stroke} strokeWidth="2" opacity="0.8" />
        <line
          x1={centerX + 15}
          y1="165"
          x2={centerX + 15}
          y2="505"
          stroke={gradients.stroke}
          strokeWidth="1.5"
          opacity="0.6"
        />
        <line
          x1={centerX + 35}
          y1="165"
          x2={centerX + 35}
          y2="505"
          stroke={gradients.stroke}
          strokeWidth="1.5"
          opacity="0.6"
        />

        <rect
          x={centerX - 90}
          y="510"
          width="180"
          height="25"
          rx="4"
          fill={`url(#${gradients.capital})`}
          stroke={gradients.stroke}
          strokeWidth="3"
          filter="url(#shadow)"
        />

        <rect
          x={centerX - 120}
          y="550"
          width="240"
          height="80"
          rx="25"
          ry="25"
          fill={`url(#${gradients.title})`}
          filter="url(#shadow)"
        />

        <text
          x={centerX}
          y="580"
          textAnchor="middle"
          fill="white"
          fontSize="18"
          fontWeight="700"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          {pillarIndex === 1 ? "Research &" : pillarIndex === 2 ? "Strategic College" : "Strength-Based"}
        </text>
        <text
          x={centerX}
          y="605"
          textAnchor="middle"
          fill="white"
          fontSize="18"
          fontWeight="700"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          {pillarIndex === 1 ? "Competitive Excellence" : pillarIndex === 2 ? "Planning" : "Discovery"}
        </text>

        {/* Base foundation with more padding */}
        <rect
          x={centerX - 140}
          y="640"
          width="280"
          height="50"
          rx="25"
          ry="25"
          fill={`url(#${gradients.capital})`}
          stroke={gradients.stroke}
          strokeWidth="2"
          filter="url(#shadow)"
        />
      </g>
    )
  }

  const createCards = (centerX: number, pillarIndex: number) => {
    const isVisible = cardsVisible

    const getCardContent = (cardIndex: number) => {
      if (pillarIndex === 1) {
        // Pillar 2 content
        switch (cardIndex) {
          case 0:
            return "We handpick high-impact competitions and research opportunities matching the student's strengths"
          case 1:
            return "Support for national and international Olympiads, science fairs, hackathons, business case competitions, social impact initiatives, and more"
          case 2:
            return "Personalized research mentorship for students to publish original work or present at top student conferences, thus showcasing their intellectual curiosity and leadership"
          default:
            return ""
        }
      }
      if (pillarIndex === 0) {
        switch (cardIndex) {
          case 0:
            return "Align emerging interests with long-term capabilities"
          case 1:
            return "Identify core academic and personal strengths using assessments and mentorship"
          case 2:
            return "Help students understand who they are and what drives them"
          default:
            return ""
        }
      }
      if (pillarIndex === 2) {
        switch (cardIndex) {
          case 0:
            return "Curate a balanced college list tailored to academic, personal, and financial fit"
          case 1:
            return "Timeline-driven, step-by-step guidance from early high school to application submission"
          case 2:
            return "Expert coaching on college essays, interviews, extracurricular positioning, and letters of recommendation"
          default:
            return ""
        }
      }
      return ""
    }

    if (pillarIndex === 1 || pillarIndex === 0 || pillarIndex === 2) {
      return (
        <>
          {/* 12 o'clock Card (Top) */}
          <div
             className={`absolute w-48 transition-all duration-700 ease-out ${
               isVisible ? "opacity-100 scale-100 shadow-2xl z-10" : "opacity-0 scale-95"
            }`}
            style={{
               top: pillarIndex === 2 ? "-4%" : pillarIndex === 1 ? "-8%" : "-1%",
               left: pillarIndex === 2 ? `${(centerX - 142) / 16}%` : pillarIndex === 1 ? `${(centerX - 116) / 16}%` : `${(centerX - 92) / 16}%`,
               transform: isVisible ? "translate(0px, -20px)" : `translate(0px, 60px)`,
               transitionDelay: isVisible ? `${pillarIndex * 0.1}s` : "0s",
             }}
           >
                           <div className={`rounded-2xl p-4 shadow-xl backdrop-blur-sm relative overflow-hidden ${
                pillarIndex === 0 
                  ? "bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200" 
                                     : pillarIndex === 1 
                   ? "bg-gradient-to-br from-yellow-50 to-blue-100 border-2 border-yellow-200"
                   : "bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200"
               }`}>
                 <div className={`absolute top-0 right-0 w-12 h-12 rounded-full -translate-y-6 translate-x-6 opacity-30 ${
                   pillarIndex === 0 
                     ? "bg-gradient-to-br from-amber-200 to-amber-300" 
                     : pillarIndex === 1 
                     ? "bg-gradient-to-br from-yellow-200 to-blue-300"
                     : "bg-gradient-to-br from-blue-200 to-blue-300"
                 }`}></div>
              <p className="text-xs text-slate-800 text-center leading-relaxed font-semibold relative z-10">
                {getCardContent(0)}
              </p>
            </div>
          </div>

          {/* 3 o'clock Card (Right) */}
          <div
             className={`absolute w-48 transition-all duration-700 ease-out ${
               isVisible ? "opacity-100 scale-100 shadow-2xl z-10" : "opacity-0 scale-95"
            }`}
            style={{
               top: pillarIndex === 2 ? "55%" : pillarIndex === 0 ? "60%" : "22%",
               left: pillarIndex === 1 ? `${(centerX + 50) / 16}%` : pillarIndex === 2 ? `${(centerX + 22) / 16}%` : `${(centerX - 350) / 16}%`,
               transform: isVisible ? "translate(30px, 0px)" : `translate(-40px, 0px)`,
               transitionDelay: isVisible ? `${pillarIndex * 0.1 + 0.05}s` : "0s",
             }}
           >
                           <div className={`rounded-2xl p-4 shadow-xl backdrop-blur-sm relative overflow-hidden ${
                pillarIndex === 0 
                  ? "bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-amber-300" 
                                     : pillarIndex === 1 
                   ? "bg-gradient-to-br from-yellow-100 to-blue-200 border-2 border-yellow-300"
                   : "bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-blue-300"
               }`}>
                 <div className={`absolute top-0 left-0 w-10 h-10 rounded-full -translate-y-5 -translate-x-5 opacity-30 ${
                   pillarIndex === 0 
                     ? "bg-gradient-to-br from-amber-300 to-amber-400" 
                     : pillarIndex === 1 
                     ? "bg-gradient-to-br from-yellow-300 to-blue-400"
                     : "bg-gradient-to-br from-blue-300 to-blue-400"
                 }`}></div>
              <p className="text-xs text-slate-800 text-center leading-relaxed font-semibold relative z-10">
                {getCardContent(1)}
              </p>
            </div>
          </div>

          {/* 9 o'clock Card (Left) */}
          <div
             className={`absolute w-48 transition-all duration-700 ease-out ${
               isVisible ? "opacity-100 scale-100 shadow-2xl z-10" : "opacity-0 scale-95"
            }`}
            style={{
              top: "22%",
               left: pillarIndex === 1 ? `${(centerX - 292) / 16}%` : pillarIndex === 2 ? `${(centerX + 92) / 16}%` : `${(centerX - 272) / 16}%`,
               transform: isVisible ? "translate(-30px, 0px)" : `translate(40px, 0px)`,
               transitionDelay: isVisible ? `${pillarIndex * 0.1 + 0.1}s` : "0s",
             }}
           >
                           <div className={`rounded-2xl p-4 shadow-xl backdrop-blur-sm relative overflow-hidden ${
                pillarIndex === 0 
                  ? "bg-gradient-to-br from-amber-200 to-amber-300 border-2 border-amber-400" 
                                     : pillarIndex === 1 
                   ? "bg-gradient-to-br from-yellow-200 to-blue-300 border-2 border-yellow-400"
                   : "bg-gradient-to-br from-blue-200 to-blue-300 border-2 border-blue-400"
               }`}>
                 <div className={`absolute bottom-0 right-0 w-8 h-8 rounded-full translate-y-4 translate-x-4 opacity-30 ${
                   pillarIndex === 0 
                     ? "bg-gradient-to-tl from-amber-400 to-amber-500" 
                     : pillarIndex === 1 
                     ? "bg-gradient-to-tl from-yellow-400 to-blue-500"
                     : "bg-gradient-to-tl from-blue-400 to-blue-500"
                 }`}></div>
              <p className="text-xs text-slate-800 text-center leading-relaxed font-semibold relative z-10">
                {getCardContent(2)}
              </p>
            </div>
          </div>
        </>
      )
    }

    return null
  }

  return (
         <motion.div 
       className="relative w-full max-w-7xl mx-auto theme-bg-dark rounded-2xl p-8"
       initial={{ opacity: 0, y: 20 }}
       whileInView={{ opacity: 1, y: 0 }}
       onViewportEnter={() => {
         // Show all cards together when scrolling into view
         setCardsVisible(true);
       }}
       onViewportLeave={() => {
         // Hide cards when scrolling away from view
         setCardsVisible(false);
       }}
       transition={{ duration: 1.2, ease: "easeOut" }}
       viewport={{ once: false, amount: 0.3 }}
     >
      <svg viewBox="0 0 1600 700" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* First Pillar - Warm Amber to Gold */}
          <linearGradient id="columnGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          <linearGradient id="capitalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>

          <linearGradient id="titleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>

          {/* Second Pillar - Gradient Color */}
          <linearGradient id="blueColumnGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>

          <linearGradient id="blueCapitalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>

          <linearGradient id="blueTitleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#1e40af" />
          </linearGradient>

          {/* Third Pillar - Blue */}
          <linearGradient id="greenColumnGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#dbeafe" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>

          <linearGradient id="greenCapitalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          <linearGradient id="greenTitleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#075985" />
          </linearGradient>

          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000000" floodOpacity="0.15" />
          </filter>
        </defs>

        {createPillar(250, 0)}
        {createPillar(800, 1)}
        {createPillar(1350, 2)}
      </svg>

      {createCards(250, 0)}
      {createCards(800, 1)}
      {createCards(1350, 2)}
    </motion.div>
  )
}

// TestimonialsSection Component
// // TestimonialsSection Component
const TestimonialsSection = () => {
  const [selectedTestimonial, setSelectedTestimonial] = React.useState(testimonialCards[0])
  const [isVisible, setIsVisible] = React.useState(false)
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [animatingIndex, setAnimatingIndex] = React.useState(0)

  const intervalRef = React.useRef<NodeJS.Timeout | null>(null)

  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300)
    return () => clearTimeout(timer)
  }, [])

  const startAutoRotation = React.useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % testimonialCards.length
        setSelectedTestimonial(testimonialCards[nextIndex])
        setAnimatingIndex(nextIndex)
        return nextIndex
      })
    }, 5500)
  }, [])

  React.useEffect(() => {
    startAutoRotation()
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [startAutoRotation])

  const handleAvatarClick = (testimonial: typeof testimonialCards[0], index: number) => {
    setSelectedTestimonial(testimonial)
    setCurrentIndex(index)
    setAnimatingIndex(index)
    startAutoRotation()
  }

  const goToPrevious = () => {
    const prevIndex = currentIndex === 0 ? testimonialCards.length - 1 : currentIndex - 1
    setSelectedTestimonial(testimonialCards[prevIndex])
    setCurrentIndex(prevIndex)
    setAnimatingIndex(prevIndex)
    startAutoRotation()
  }

  const goToNext = () => {
    const nextIndex = (currentIndex + 1) % testimonialCards.length
    setSelectedTestimonial(testimonialCards[nextIndex])
    setCurrentIndex(nextIndex)
    setAnimatingIndex(nextIndex)
    startAutoRotation()
  }

  return (
    <div className="w-full relative z-10">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="relative flex flex-col lg:flex-row items-center justify-center gap-16">
          <div className="relative w-[600px] h-[600px] lg:w-[700px] lg:h-[700px]">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] lg:w-[500px] lg:h-[500px] border-2 border-dashed border-yellow-400/30 rounded-full" />
            
                        {/* Testimonials positioned around the circle */}
            {testimonialCards.map((testimonial, index) => {
              // Calculate angle so that active testimonial is always at rightmost (0 degrees)
              const angle = (index - currentIndex) * (360 / testimonialCards.length)
              const radius = 250 // Increased radius for more spacing between avatars
              const x = Math.cos((angle * Math.PI) / 180) * radius
              const y = Math.sin((angle * Math.PI) / 180) * radius

              const isActive = currentIndex === index
              const isAnimating = animatingIndex === index

              return (
                <div
                  key={testimonial.id}
                  className="absolute cursor-pointer hover:scale-110 z-10 transition-all duration-300"
                  style={{
                    left: "50%",
                    top: "50%",
                    transform: `translate(${x - 50}px, ${y - 50}px)`,
                  }}
                  onClick={() => handleAvatarClick(testimonial, index)}
                >
                  <Avatar
                    className={`w-20 h-20 lg:w-24 lg:h-24 ring-2 shadow-lg transition-all duration-500 ${
                      isActive ? "ring-yellow-400 ring-4 scale-110" : "ring-white hover:ring-yellow-300"
                    } ${isAnimating ? "animate-pulse" : ""}`}
                  >
                    <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-[#1a2236] font-semibold">
                      {testimonial.initials || testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  {isActive && (
                    <div className="absolute inset-0 rounded-full border-2 border-yellow-400 animate-ping opacity-75" />
                  )}
                </div>
              )
            })}
          </div>

          <div className="flex-1 max-w-lg">
            <div
              key={selectedTestimonial.id}
              className="bg-gradient-to-br from-[#1a2236]/95 to-[#2a3246]/90 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-yellow-400/30 animate-in fade-in-50 slide-in-from-right-5 duration-500 relative overflow-hidden"
            >
              {/* Content Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-transparent to-blue-400/5 rounded-2xl"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/10 rounded-full blur-3xl"></div>
              <div className="relative z-10">
              <div className="flex gap-1 mb-4">
                {[...Array(selectedTestimonial.rating || 5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <blockquote className="theme-text-light text-lg leading-relaxed mb-6 font-medium">
                {selectedTestimonial.content}
              </blockquote>

              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12 ring-2 ring-yellow-100">
                  <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-[#1a2236] font-semibold">
                    {selectedTestimonial.initials || selectedTestimonial.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold theme-text-light">{selectedTestimonial.name}</div>
                  <div className="text-yellow-400 text-sm font-medium">{selectedTestimonial.designation}</div>
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-8 mt-16">
          <button
            onClick={goToPrevious}
            className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg hover:bg-yellow-500 transition-all duration-200 hover:scale-110 active:scale-95"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-6 h-6 text-[#1a2236]" />
          </button>
          <button
            onClick={goToNext}
            className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg hover:bg-yellow-500 transition-all duration-200 hover:scale-110 active:scale-105"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-6 h-6 text-[#1a2236]" />
          </button>
        </div>
      </div>
    </div>
  )
}

const approachItems = [
  {
    title: "Strength-Based Discovery",
    icon: Target,
    content: [
      "Identify core academic and personal strengths using assessments and mentorship",
      "Help students understand who they are and what drives them",
      "Align emerging interests with long-term capabilities"
    ]
  },
  {
    title: "Research & Competitive Excellence",
    icon: Trophy,
    content: [
      "We handpick high-impact competitions and research opportunities that match the student's strengths and aspirations",
      "Support for national and international Olympiads, science fairs, hackathons, business case competitions, social impact initiatives, and more",
      "Personalized research mentorship for students to publish original work or present at top student conferences, thus showcasing their intellectual curiosity and leadership"
    ]
  },
  {
    title: "Strategic College Planning",
    icon: FileText,
    content: [
      "Curate a balanced college list tailored to academic, personal, and financial fit",
      "Timeline-driven, step-by-step guidance from early high school to application submission",
      "Expert coaching on college essays, interviews, extracurricular positioning, and letters of recommendation"
    ]
  }
];

const highlights = [
  {
    icon: Users,
    title: "Profile Enrichment",
    description: "Comprehensive profile building through strategic activities and leadership development.",
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: FileText,
    title: "Essay Guidance",
    description: "Expert help in crafting authentic, compelling application essays.",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: Globe,
    title: "College List Curation",
    description: "Personalized guidance to select best-fit institutions that reflect both personality and potential.",
    color: "from-teal-500 to-teal-600",
  },
  {
    icon: BookOpen,
    title: "Dedicated Counseling Sessions",
    description: "One-on-one personalized guidance throughout your college journey.",
    color: "from-green-500 to-green-600",
  },
  {
    icon: Star,
    title: "Personalized Profile Roadmap",
    description: "Custom strategic plan tailored to your unique strengths and goals.",
    color: "from-orange-500 to-orange-600",
  },
  {
    icon: Calendar,
    title: "Head Start Advantage for Middle School",
    description: "Early preparation and guidance for middle school students.",
    color: "from-red-500 to-red-600",
  },
];

const colleges = [
  { name: "UWash Seattle", logo: "/college-logos/uwash.png" },
  { name: "UC Davis", logo: "/college-logos/ucdavis.png" },
  { name: "UC Santa Cruz", logo: "/college-logos/ucsc.png" },
  { name: "UC Irvine", logo: "/college-logos/uci.png" },
  { name: "UC Riverside", logo: "/college-logos/ucr.png" },
  { name: "UC Santa Barbara", logo: "/college-logos/ucsb.png" },
  { name: "UC Merced", logo: "/college-logos/ucm.png" },
  { name: "UC Boulder", logo: "/college-logos/ucb.png" },
];

// Helper function to generate initials from name
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2); // Take max 2 initials
}

const testimonialCards = [
  {
    id: 0,
    name: "Eesha's Parent: Srinivas Eerpina",
    designation: "Parent of High School Senior",
    grade: "Parent of High School Senior",
    title: "College Essay Excellence",
    description: "Outstanding guidance in college essay writing and application strategy",
    icon: "👨‍👩‍👧‍👦",
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
    textColor: "text-purple-700",
    rating: 5,
    initials: getInitials("Eesha's Parent: Srinivas Eerpina"),
    content: (
      <p>
        Our daughter is a now a high school senior. She took college preparatory courses at ACHARYA. I am pleased to say that she really enjoyed working with Shanti Swaroop, who assisted her in writing five essays. His coaching helped her identify and outline her <Highlight>strengths, extra curricular activities, achievements and challenges</Highlight> in the correct format. Shanti Swaroop maintains a <Highlight>different strategy for each college</Highlight> that the students wants to apply. Depending on the college and the major she wants to apply for, he summarizes what is important to capture in the essay and how to narrate the story. He usually takes a couple of days for corrections. This strategy worked well and all her essays turned out excellent. Shanti Swaroop and his team has <Highlight>deep knowledge of the college admission process</Highlight> and a very talented in Maths and Science subjects. Although we didn&apos;t get a chance to work with ACHARYA for a long time, I recommend and encourage others to engage with them as early as possible and seek mentorship from them.
      </p>
    ),
  },
  {
    id: 1,
    name: "Athreya",
    designation: "Student",
    grade: "High School Student",
    title: "Comprehensive College Guidance",
    description: "Complete support from course selection to career planning",
    icon: "🎓",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    rating: 5,
    initials: getInitials("Athreya"),
    content: (
      <p>
        I have been working with Shanti Swaroop for about half a year at the time of this testimonial. I attended one of his talks at a stage where he talked about <Highlight>college admissions and what colleges look for in a student</Highlight>. Later on, we scheduled a meeting to talk about my college needs and what I should be looking for. Not long after, my mother enrolled me for counseling. Throughout this journey, he has helped me with everything from <Highlight>volunteering at the library</Highlight>, to helping me select my courses for the next 4 years. Not only that, he has given me guidance on <Highlight>career matters and big picture ambitions</Highlight>.
      </p>
    ),
  },
  {
    id: 2,
    name: "Sahasra",
    designation: "Student",
    grade: "College Applicant",
    title: "Personalized University Selection",
    description: "Expert guidance in choosing the right universities and majors",
    icon: "🎯",
    color: "from-emerald-500 to-emerald-600",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    rating: 5,
    initials: getInitials("Sahasra"),
    content: (
      <p>
        Dr. Shanti Swaroop&apos;s guidance was essential to our understanding of the college application process. His <Highlight>patience and constant encouragement and attention</Highlight> are what truly make him stand apart from other counselors. He helped us narrow down the <Highlight>potential universities I should apply to</Highlight> based on my major and is currently working with me on making my application stand out.
      </p>
    ),
  },
];

export default function CollegePrepPage() {
  const [roadProgress, setRoadProgress] = React.useState(0)
  const [selectedMilestone, setSelectedMilestone] = React.useState<number | null>(null)

  React.useEffect(() => {
    const roadTimer = setInterval(() => {
      setRoadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(roadTimer)
          return 100
        }
        return prev + 2
      })
    }, 50)

    return () => clearInterval(roadTimer)
  }, [])

  // Handle clicking outside to close milestone details
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Check if click is outside milestone elements
      if (!target.closest('[data-milestone]') && !target.closest('[data-milestone-content]')) {
        setSelectedMilestone(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <main className="min-h-screen theme-bg-dark flex flex-col">
      <Header />
      
      {/* Hero/Intro Section */}
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
            <Badge className="mb-4 bg-yellow-400/10 text-yellow-400 border-yellow-400/20">
              🎓 College Prep
            </Badge>
            <h1 className="text-6xl lg:text-7xl font-black bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent mb-4 animate-slide-in-bottom">
              UACHIEVE
            </h1>
            <h2 className="text-4xl lg:text-5xl font-bold theme-text-light mb-6">
              Empowering Students to Achieve Their College Dreams
            </h2>
            <p className="text-lg theme-text-muted max-w-4xl mx-auto animate-slide-in-bottom" style={{ animationDelay: '0.2s' }}>
              UACHIEVE is more than just college counseling. It&apos;s a guided journey of self-discovery, competitive distinction, and strategic planning, crafted to help students unlock their true potential and gain admission to best-fit colleges and unfold their untold stories.
            </p>
          </div>
          
          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/book-session">
                <Button className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#1a2236] hover:from-yellow-300 hover:to-yellow-400 px-6 shadow-lg">
                  <Calendar className="mr-2 h-5 w-5" /> Book a Free 60-min Discovery Session
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3-Pillar Approach Section */}
      <section className="py-20 theme-bg-dark">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <Badge className="mb-4 bg-yellow-400/10 text-yellow-400">Our Approach</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold theme-text-light mb-6">How We Guide Your College Journey</h2>
            <p className="text-xl theme-text-muted max-w-4xl mx-auto">
              The 3-Pillar Approach: We help students build standout profiles, showcase intellectual curiosity, and achieve competitive excellence through research, competitions, and strategic planning.
            </p>
          </motion.div>
          <StrengthBasedDiscoveryInfographic />
        </div>
      </section>

      {/* Program Highlights Section - Replaced with Draggable Cards */}
      <section className="py-20 theme-bg-dark">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-yellow-400/10 text-yellow-400">Program Highlights</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold theme-text-light mb-6">What Sets Our College Prep Apart</h2>
            <p className="text-xl theme-text-muted max-w-3xl mx-auto">From profile enrichment to essay guidance, we help students build a profile that stands out to top colleges.</p>
          </motion.div>
          
          {/* Simple Grid Cards Container */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-6xl mx-auto"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Profile Enrichment Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm p-6 rounded-2xl relative group hover:bg-gradient-to-br hover:from-gray-800/70 hover:to-gray-900/70 transition-all duration-300 border border-gray-700/20 hover:border-yellow-400/20"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center text-gray-900 mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold theme-text-light mb-3 group-hover:text-yellow-400 transition-colors duration-300">
                    Profile Enrichment
                  </h3>
                  <p className="theme-text-muted text-sm leading-relaxed">Comprehensive profile building through strategic activities and leadership development.</p>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-amber-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-b-2xl" />
              </motion.div>

              {/* Essay Guidance Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm p-6 rounded-2xl relative group hover:bg-gradient-to-br hover:from-gray-800/70 hover:to-gray-900/70 transition-all duration-300 border border-gray-700/20 hover:border-amber-500/20"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-gray-900 mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold theme-text-light mb-3 group-hover:text-amber-400 transition-colors duration-300">
                    Essay Guidance
                  </h3>
                  <p className="theme-text-muted text-sm leading-relaxed">Expert help in crafting authentic, compelling application essays.</p>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-b-2xl" />
              </motion.div>

              {/* College List Curation Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm p-6 rounded-2xl relative group hover:bg-gradient-to-br hover:from-gray-800/70 hover:to-gray-900/70 transition-all duration-300 border border-gray-700/20 hover:border-orange-500/20"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-yellow-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-400 rounded-xl flex items-center justify-center text-gray-900 mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Globe className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold theme-text-light mb-3 group-hover:text-orange-400 transition-colors duration-300">
                    College List Curation
                  </h3>
                  <p className="theme-text-muted text-sm leading-relaxed">Personalized guidance to select best-fit institutions that reflect both personality and potential.</p>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-yellow-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-b-2xl" />
              </motion.div>

              {/* Dedicated Counseling Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm p-6 rounded-2xl relative group hover:bg-gradient-to-br hover:from-gray-800/70 hover:to-gray-900/70 transition-all duration-300 border border-gray-700/20 hover:border-yellow-400/20"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center text-gray-900 mb-4 group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold theme-text-light mb-3 group-hover:text-yellow-400 transition-colors duration-300">
                    Dedicated Counseling
                  </h3>
                  <p className="theme-text-muted text-sm leading-relaxed">One-on-one personalized guidance throughout your college journey.</p>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-amber-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-b-2xl" />
              </motion.div>

              {/* Personalized Roadmap Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm p-6 rounded-2xl relative group hover:bg-gradient-to-br hover:from-gray-800/70 hover:to-gray-900/70 transition-all duration-300 border border-gray-700/20 hover:border-amber-500/20"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-gray-900 mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Star className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold theme-text-light mb-3 group-hover:text-amber-400 transition-colors duration-300">
                    Personalized Roadmap
                  </h3>
                  <p className="theme-text-muted text-sm leading-relaxed">Custom strategic plan tailored to your unique strengths and goals.</p>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-b-2xl" />
              </motion.div>

              {/* Research Excellence Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm p-6 rounded-2xl relative group hover:bg-gradient-to-br hover:from-gray-800/70 hover:to-gray-900/70 transition-all duration-300 border border-gray-700/20 hover:border-orange-500/20"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-yellow-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-400 rounded-xl flex items-center justify-center text-gray-900 mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold theme-text-light mb-3 group-hover:text-orange-400 transition-colors duration-300">
                    Research Excellence
                  </h3>
                  <p className="theme-text-muted text-sm leading-relaxed">High-impact research opportunities and competition support for standout profiles.</p>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-yellow-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-b-2xl" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 theme-bg-dark">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <Badge className="mb-4 bg-yellow-400/10 text-yellow-400 border-yellow-400/20 px-4 py-2 text-sm font-semibold">
              🚀 Strategic College Prep Journey
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold theme-text-light mb-6">
            Proven Path to College Success
            </h2>
            <p className="text-xl theme-text-muted max-w-3xl mx-auto leading-relaxed">
              Navigate through strategic levels of college preparation, each building upon the previous to create a comprehensive roadmap to your dream college.
            </p>
          </motion.div>
          
          {/* College Prep Timeline */}
          <div className="max-w-7xl mx-auto relative ">
            <div className="relative h-[700px] w-full">
            <svg
                className="absolute inset-0 w-full h-full overflow-visible "
                viewBox="0 0 300 450"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="roadGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#374151" />
                    <stop offset="25%" stopColor="#4b5563" />
                    <stop offset="50%" stopColor="#6b7280" />
                    <stop offset="75%" stopColor="#4b5563" />
                    <stop offset="100%" stopColor="#374151" />
                  </linearGradient>

                  <linearGradient id="roadEdge" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1f2937" />
                    <stop offset="100%" stopColor="#111827" />
                  </linearGradient>

                  <filter id="roadShadow">
                    <feDropShadow dx="0" dy="3" stdDeviation="2" floodColor="rgba(0,0,0,0.4)" />
                  </filter>


                </defs>

                {/* Shadow path for depth */}
                <path
                  d="M 10 380 
                    C 75 350, 140 320, 180 280 
                    C 220 240, 180 200, 140 170 
                    C 100 140, 140 100, 180 70 
                    C 220 40, 240 20, 260 10"
                  stroke="rgba(0,0,0,0.5)"
                  strokeWidth="40"
                  fill="none"
                  transform="translate(1, 1)"
                />

                {/* Main road path */}
                <path
                  d="M 10 380 
                    C 75 350, 140 320, 180 280 
                    C 220 240, 180 200, 140 170 
                    C 100 140, 140 100, 180 70 
                    C 220 40, 240 20, 260 10"
                  stroke="url(#roadGradient)"
                  strokeWidth="40"
                  fill="none"
                  filter="url(#roadShadow)"
                />

                {/* Road edge for definition */}
                <path
                  d="M 10 380 
                    C 75 350, 140 320, 180 280 
                    C 220 240, 180 200, 140 170 
                    C 100 140, 140 100, 180 70 
                    C 220 40, 240 20, 260 10"
                  stroke="url(#roadEdge)"
                  strokeWidth="40"
                  fill="none"
                  opacity="0.6"
                />

                {/* Yellow dashed line */}
                <path
                  d="M 10 380
                    C 75 350, 140 320, 180 280 
                    C 220 240, 180 200, 140 170 
                    C 100 140, 140 100, 180 70 
                    C 220 40, 240 20, 260 10"
                  stroke="#fbbf24"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray="4 3"
                  opacity="0.9"
                />

                {/* Road texture overlay */}
                <path
                  d="M 10 380 
                    C 75 350, 140 320, 180 280 
                    C 220 240, 180 200, 140 170 
                    C 100 140, 140 100, 180 70 
                    C 220 40, 240 20, 260 10"
                  stroke="url(#roadGradient)"
                  strokeWidth="40"
                  fill="none"
                  opacity="0.3"
                />
      

          <g
            transform="translate(220,-110) scale(0.3)"
            className="flex justify-center"
            style={{
              overflow: "visible", // Ensure group elements can extend beyond boundaries
            }}
          >
            
          <svg viewBox="0 0 1000 500" className="w-full max-w-5xl h-auto">
            <defs>
              <linearGradient id="groundGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>
              <linearGradient id="mainBuilding" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e3a8a" />
                <stop offset="100%" stopColor="#1e40af" />
              </linearGradient>
              <linearGradient id="buildingSide" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e40af" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </linearGradient>
              {/* <linearGradient id="buildingTop" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#1e40af" />
              </linearGradient> */}
              <linearGradient id="roofGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>
              <linearGradient id="roofSide" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>
              <linearGradient id="yellowAccent" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
              <linearGradient id="goldAccent" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fcd34d" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
              <radialGradient id="fountain" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#3b82f6" />
              </radialGradient>

              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.4" />
              </filter>
              <filter id="deepShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="3" dy="6" stdDeviation="4" floodColor="#000000" floodOpacity="0.5" />
              </filter>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <polygon points="50,600 900,600 950,550 100,550" fill="url(#groundGradient)" filter="url(#deepShadow)" />
            <polygon points="900,600 950,550 950,570 900,620" fill="#1e293b" />
            <polygon points="50,600 900,600 900,620 50,620" fill="url(#groundGradient)" />

            {/* Decorative pathway with enhanced 3D depth */}
            <polygon points="200,600 800,600 830,570 230,570" fill="#64748b" />
            <polygon points="800,600 830,570 830,590 800,620" fill="#475569" />
            <polygon points="200,600 800,600 800,620 200,620" fill="#64748b" />

            {/* Garden beds with 3D perspective */}
            <ellipse cx="150" cy="580" rx="40" ry="15" fill="#166534" />
            <ellipse cx="850" cy="580" rx="40" ry="15" fill="#166534" />

            {/* Left wing main structure */}
            <polygon points="80,200 320,200 320,480 80,480" fill="url(#mainBuilding)" />
            <polygon points="320,200 370,150 370,430 320,480" fill="url(#buildingSide)" />
            <polygon points="80,200 320,200 370,150 130,150" fill="url(#buildingTop)" />

            {/* Left wing spire with enhanced 3D */}
            <polygon points="80,180 120,180 120,160 80,160" fill="url(#mainBuilding)" />
            <polygon points="120,180 140,160 140,140 120,160" fill="url(#buildingSide)" />
            <polygon points="80,160 120,160 140,140 100,140" fill="url(#buildingTop)" />

            {/* Left wing roof with proper depth */}
            <polygon points="70,200 330,200 380,150 120,150" fill="url(#roofGradient)" />
            <polygon points="330,200 380,150 380,170 330,220" fill="url(#roofSide)" />

            {/* Left wing spire crown */}
            <polygon points="75,160 125,160 145,140 95,140" fill="url(#goldAccent)" />
            <polygon points="125,160 145,140 145,160 125,180" fill="#f59e0b" />
            <polygon points="95,140 105,140 100,120" fill="url(#goldAccent)" />
            <circle cx="100" cy="125" r="3" fill="#fbbf24" filter="url(#glow)" />

            {/* Left wing windows with side faces */}
            <rect x="100" y="220" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="120,220 125,215 125,245 120,250" fill="#f59e0b" />
            <rect x="130" y="220" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="150,220 155,215 155,245 150,250" fill="#f59e0b" />
            <rect x="160" y="220" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="180,220 185,215 185,245 180,250" fill="#f59e0b" />
            <rect x="190" y="220" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="210,220 215,215 215,245 210,250" fill="#f59e0b" />
            <rect x="220" y="220" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="240,220 245,215 245,245 240,250" fill="#f59e0b" />
            <rect x="250" y="220" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="270,220 275,215 275,245 270,250" fill="#f59e0b" />
            <rect x="280" y="220" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="300,220 305,215 305,245 300,250" fill="#f59e0b" />

            {/* Additional rows of left wing windows */}
            <rect x="100" y="270" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="120,270 125,265 125,295 120,300" fill="#f59e0b" />
            <rect x="130" y="270" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="150,270 155,265 155,295 150,300" fill="#f59e0b" />
            <rect x="160" y="270" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="180,270 185,265 185,295 180,300" fill="#f59e0b" />
            <rect x="190" y="270" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="210,270 215,265 215,295 210,300" fill="#f59e0b" />
            <rect x="220" y="270" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="240,270 245,265 245,295 240,300" fill="#f59e0b" />
            <rect x="250" y="270" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="270,270 275,265 275,295 270,300" fill="#f59e0b" />
            <rect x="280" y="270" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="300,270 305,265 305,295 300,300" fill="#f59e0b" />

            <rect x="100" y="320" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="120,320 125,315 125,345 120,350" fill="#f59e0b" />
            <rect x="130" y="320" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="150,320 155,315 155,345 150,350" fill="#f59e0b" />
            <rect x="160" y="320" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="180,320 185,315 185,345 180,350" fill="#f59e0b" />
            <rect x="190" y="320" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="210,320 215,315 215,345 210,350" fill="#f59e0b" />
            <rect x="220" y="320" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="240,320 245,315 245,345 240,350" fill="#f59e0b" />
            <rect x="250" y="320" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="270,320 275,315 275,345 270,350" fill="#f59e0b" />
            <rect x="280" y="320" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="300,320 305,315 305,345 300,350" fill="#f59e0b" />

            <rect x="100" y="370" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="120,370 125,365 125,395 120,400" fill="#f59e0b" />
            <rect x="130" y="370" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="150,370 155,365 155,395 150,400" fill="#f59e0b" />
            <rect x="160" y="370" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="180,370 185,365 185,395 180,400" fill="#f59e0b" />
            <rect x="190" y="370" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="210,370 215,365 215,395 210,400" fill="#f59e0b" />
            <rect x="220" y="370" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="240,370 245,365 245,395 240,400" fill="#f59e0b" />
            <rect x="250" y="370" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="270,370 275,365 275,395 270,400" fill="#f59e0b" />
            <rect x="280" y="370" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="300,370 305,365 305,395 300,400" fill="#f59e0b" />

            {/* Main central building */}
            <polygon points="350,120 650,120 650,480 350,480" fill="url(#mainBuilding)" />
            <polygon points="650,120 720,50 720,410 650,480" fill="url(#buildingSide)" />
            <polygon points="350,120 650,120 720,50 420,50" fill="url(#buildingTop)" />

            {/* Tower middle section */}
            <polygon points="400,80 600,80 600,120 400,120" fill="url(#mainBuilding)" />
            <polygon points="600,80 650,30 650,70 600,120" fill="url(#buildingSide)" />
            <polygon points="400,80 600,80 650,30 450,30" fill="url(#buildingTop)" />

            {/* Clock tower top */}
            <polygon points="470,50 530,50 530,80 470,80" fill="url(#mainBuilding)" />
            <polygon points="530,50 560,20 560,50 530,80" fill="url(#buildingSide)" />
            <polygon points="470,50 530,50 560,20 500,20" fill="url(#buildingTop)" />

            {/* Tower crown with 3D effect */}
            <polygon points="460,50 540,50 570,20 490,20" fill="url(#goldAccent)" />
            <polygon points="540,50 570,20 570,40 540,70" fill="#f59e0b" />

            {/* Tower spire */}
            <polygon points="495,20 505,20 500,0" fill="url(#goldAccent)" />
            <circle cx="500" cy="5" r="4" fill="#fbbf24" filter="url(#glow)" />

            {/* Main tower roof with enhanced depth */}
            <polygon points="340,140 660,140 730,70 410,70" fill="url(#roofGradient)" />
            <polygon points="660,140 730,70 730,90 660,160" fill="url(#roofSide)" />

            <circle cx="500" cy="65" r="25" fill="#fbbf24" stroke="#f59e0b" strokeWidth="3" filter="url(#glow)" />
            <circle cx="500" cy="65" r="20" fill="#1e3a8a" />
            <line x1="500" y1="65" x2="500" y2="50" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" />
            <line x1="500" y1="65" x2="512" y2="65" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
            <circle cx="500" cy="65" r="3" fill="#fbbf24" />
            <text x="500" y="50" textAnchor="middle" fontSize="8" fill="#fbbf24" fontWeight="bold">
              XII
            </text>
            <text x="515" y="70" textAnchor="middle" fontSize="8" fill="#fbbf24" fontWeight="bold">
              III
            </text>
            <text x="500" y="85" textAnchor="middle" fontSize="8" fill="#fbbf24" fontWeight="bold">
              VI
            </text>
            <text x="485" y="70" textAnchor="middle" fontSize="8" fill="#fbbf24" fontWeight="bold">
              IX
            </text>

            {/* Right wing main structure */}
            <polygon points="680,200 920,200 920,480 680,480" fill="url(#mainBuilding)" />
            <polygon points="920,200 970,150 970,430 920,480" fill="url(#buildingSide)" />
            <polygon points="680,200 920,200 970,150 730,150" fill="url(#buildingTop)" />

            {/* Right wing spire with enhanced 3D */}
            <polygon points="880,180 920,180 920,160 880,160" fill="url(#mainBuilding)" />
            <polygon points="920,180 940,160 940,140 920,160" fill="url(#buildingSide)" />
            <polygon points="880,160 920,160 940,140 900,140" fill="url(#buildingTop)" />

            {/* Right wing roof with proper depth */}
            <polygon points="670,200 930,200 980,150 720,150" fill="url(#roofGradient)" />
            <polygon points="930,200 980,150 980,170 930,220" fill="url(#roofSide)" />

            {/* Right wing spire crown */}
            <polygon points="875,160 925,160 945,140 895,140" fill="url(#goldAccent)" />
            <polygon points="925,160 945,140 945,160 925,180" fill="#f59e0b" />
            <polygon points="895,140 905,140 900,120" fill="url(#goldAccent)" />
            <circle cx="900" cy="125" r="3" fill="#fbbf24" filter="url(#glow)" />

            {/* Right wing windows with 3D depth */}
            <rect x="700" y="220" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="720,220 725,215 725,245 720,250" fill="#f59e0b" />
            <rect x="730" y="220" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="750,220 755,215 755,245 750,250" fill="#f59e0b" />
            <rect x="760" y="220" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="780,220 785,215 785,245 780,250" fill="#f59e0b" />
            <rect x="790" y="220" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="810,220 815,215 815,245 810,250" fill="#f59e0b" />
            <rect x="820" y="220" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="840,220 845,215 845,245 840,250" fill="#f59e0b" />
            <rect x="850" y="220" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="870,220 875,215 875,245 870,250" fill="#f59e0b" />
            <rect x="880" y="220" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="900,220 905,215 905,245 900,250" fill="#f59e0b" />

            {/* Additional rows of right wing windows */}
            <rect x="700" y="270" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="720,270 725,265 725,295 720,300" fill="#f59e0b" />
            <rect x="730" y="270" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="750,270 755,265 755,295 750,300" fill="#f59e0b" />
            <rect x="760" y="270" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="780,270 785,265 785,295 780,300" fill="#f59e0b" />
            <rect x="790" y="270" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="810,270 815,265 815,295 810,300" fill="#f59e0b" />
            <rect x="820" y="270" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="840,270 845,265 845,295 840,300" fill="#f59e0b" />
            <rect x="850" y="270" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="870,270 875,265 875,295 870,300" fill="#f59e0b" />
            <rect x="880" y="270" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="900,270 905,265 905,295 900,300" fill="#f59e0b" />

            <rect x="700" y="320" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="720,320 725,315 725,345 720,350" fill="#f59e0b" />
            <rect x="730" y="320" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="750,320 755,315 755,345 750,350" fill="#f59e0b" />
            <rect x="760" y="320" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="780,320 785,315 785,345 780,350" fill="#f59e0b" />
            <rect x="790" y="320" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="810,320 815,315 815,345 810,350" fill="#f59e0b" />
            <rect x="820" y="320" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="840,320 845,315 845,345 840,350" fill="#f59e0b" />
            <rect x="850" y="320" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="870,320 875,315 875,345 870,350" fill="#f59e0b" />
            <rect x="880" y="320" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="900,320 905,315 905,345 900,350" fill="#f59e0b" />

            <rect x="700" y="370" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="720,370 725,365 725,395 720,400" fill="#f59e0b" />
            <rect x="730" y="370" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="750,370 755,365 755,395 750,400" fill="#f59e0b" />
            <rect x="760" y="370" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="780,370 785,365 785,395 780,400" fill="#f59e0b" />
            <rect x="790" y="370" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="810,370 815,365 815,395 810,400" fill="#f59e0b" />
            <rect x="820" y="370" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="840,370 845,365 845,395 840,400" fill="#f59e0b" />
            <rect x="850" y="370" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="870,370 875,365 875,395 870,400" fill="#f59e0b" />
            <rect x="880" y="370" width="20" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="900,370 905,365 905,395 900,400" fill="#f59e0b" />

            {/* Enhanced university banner with decorative frame */}
            <rect x="410" y="135" width="180" height="40" fill="url(#goldAccent)" rx="6" filter="url(#shadow)" />
            <rect x="415" y="140" width="170" height="30" fill="#1e3a8a" rx="4" />
            <text x="500" y="160" textAnchor="middle" fontSize="20" fill="#fbbf24" fontWeight="bold" fontFamily="serif">
              UNIVERSITY
            </text>
            {/* Decorative corners */}
            <circle cx="420" cy="145" r="3" fill="#fbbf24" />
            <circle cx="580" cy="145" r="3" fill="#fbbf24" />
            <circle cx="420" cy="165" r="3" fill="#fbbf24" />
            <circle cx="580" cy="165" r="3" fill="#fbbf24" />

            {/* Enhanced entrance with grand archway and decorative elements */}
            {/* Grand entrance columns with enhanced depth */}
            <rect x="420" y="320" width="15" height="180" fill="url(#yellowAccent)" filter="url(#deepShadow)" />
            <rect x="445" y="320" width="15" height="180" fill="url(#yellowAccent)" filter="url(#deepShadow)" />
            <rect x="540" y="320" width="15" height="180" fill="url(#yellowAccent)" filter="url(#deepShadow)" />
            <rect x="565" y="320" width="15" height="180" fill="url(#yellowAccent)" filter="url(#deepShadow)" />

            {/* Enhanced column capitals with depth */}
            <rect x="415" y="305" width="25" height="15" fill="#f59e0b" />
            <rect x="440" y="305" width="25" height="15" fill="#f59e0b" />
            <rect x="535" y="305" width="25" height="15" fill="#f59e0b" />
            <rect x="560" y="305" width="25" height="15" fill="#f59e0b" />

            {/* Enhanced column bases */}
            <rect x="415" y="495" width="25" height="10" fill="#f59e0b" />
            <rect x="440" y="495" width="25" height="10" fill="#f59e0b" />
            <rect x="535" y="495" width="25" height="10" fill="#f59e0b" />
            <rect x="560" y="495" width="25" height="10" fill="#f59e0b" />

            {/* Grand entrance doors with panels */}
            <rect x="470" y="420" width="28" height="60" fill="#1e3a8a" stroke="#fbbf24" strokeWidth="3" />
            <rect x="502" y="420" width="28" height="60" fill="#1e3a8a" stroke="#fbbf24" strokeWidth="3" />

            {/* Door panels */}
            <rect x="475" y="430" width="18" height="20" fill="none" stroke="#fbbf24" strokeWidth="2" />
            <rect x="475" y="455" width="18" height="20" fill="none" stroke="#fbbf24" strokeWidth="2" />
            <rect x="507" y="430" width="18" height="20" fill="none" stroke="#fbbf24" strokeWidth="2" />
            <rect x="507" y="455" width="18" height="20" fill="none" stroke="#fbbf24" strokeWidth="2" />

            {/* Ornate door handles */}
            <circle cx="488" cy="450" r="3" fill="#fbbf24" filter="url(#glow)" />
            <circle cx="512" cy="450" r="3" fill="#fbbf24" filter="url(#glow)" />

            {/* Grand archway */}
            <path d="M 465 420 Q 500 385 535 420" fill="none" stroke="#fbbf24" strokeWidth="4" />

            {/* Added decorative fountain in front */}
            <ellipse cx="500" cy="520" rx="45" ry="25" fill="url(#fountain)" filter="url(#shadow)" />
            <ellipse cx="500" cy="515" rx="35" ry="20" fill="#60a5fa" />
            <ellipse cx="500" cy="510" rx="25" ry="15" fill="#93c5fd" />
            {/* Fountain center */}
            <circle cx="500" cy="505" r="8" fill="#fbbf24" />
            <circle cx="500" cy="505" r="5" fill="#1e3a8a" />

            {/* Enhanced landscaping with sophisticated trees */}
            {/* Left side trees */}
            <ellipse cx="120" cy="520" rx="35" ry="25" fill="#166534" />
            <rect x="117" y="530" width="6" height="30" fill="#92400e" />
            <ellipse cx="120" cy="510" rx="25" ry="18" fill="#22c55e" />

            <ellipse cx="180" cy="540" rx="30" ry="22" fill="#166534" />
            <rect x="177" y="548" width="6" height="25" fill="#92400e" />
            <ellipse cx="180" cy="532" rx="20" ry="15" fill="#22c55e" />

            {/* Right side trees */}
            <ellipse cx="880" cy="520" rx="35" ry="25" fill="#166534" />
            <rect x="877" y="530" width="6" height="30" fill="#92400e" />
            <ellipse cx="880" cy="510" rx="25" ry="18" fill="#22c55e" />

            <ellipse cx="820" cy="540" rx="30" ry="22" fill="#166534" />
            <rect x="817" y="548" width="6" height="25" fill="#92400e" />
            <ellipse cx="820" cy="532" rx="20" ry="15" fill="#22c55e" />

            {/* Added decorative lamp posts */}
            <rect x="350" y="500" width="4" height="40" fill="#64748b" />
            <ellipse cx="352" cy="495" rx="8" ry="6" fill="#fbbf24" filter="url(#glow)" />

            <rect x="646" y="500" width="4" height="40" fill="#64748b" />
            <ellipse cx="648" cy="495" rx="8" ry="6" fill="#fbbf24" filter="url(#glow)" />

            {/* Enhanced ceremonial steps with decorative elements */}
            <polygon points="380,480 620,480 640,460 400,460" fill="#64748b" filter="url(#deepShadow)" />
            <polygon points="620,480 640,460 640,470 620,490" fill="#475569" />

            <polygon points="390,490 610,490 630,470 410,470" fill="#64748b" />
            <polygon points="610,490 630,470 630,480 610,500" fill="#475569" />

            <polygon points="400,500 600,500 620,480 420,480" fill="#64748b" />
            <polygon points="600,500 620,480 620,490 600,510" fill="#475569" />

            {/* Added decorative urns on steps */}
            <ellipse cx="430" cy="485" rx="8" ry="6" fill="#fbbf24" />
            <ellipse cx="570" cy="485" rx="8" ry="6" fill="#fbbf24" />

            {/* Added university flags */}
            <rect x="200" y="450" width="3" height="50" fill="#64748b" />
            <polygon points="203,450 203,470 230,460" fill="#1e3a8a" />

            <rect x="797" y="450" width="3" height="50" fill="#64748b" />
            <polygon points="800,450 800,470 773,460" fill="#1e3a8a" />

            {/* Ornate balconies on central tower */}
            <rect x="480" y="180" width="40" height="8" fill="url(#goldAccent)" />
            <rect x="475" y="188" width="50" height="4" fill="#f59e0b" />
            {/* Balcony railings */}
            <rect x="478" y="175" width="2" height="13" fill="#fbbf24" />
            <rect x="485" y="175" width="2" height="13" fill="#fbbf24" />
            <rect x="492" y="175" width="2" height="13" fill="#fbbf24" />
            <rect x="499" y="175" width="2" height="13" fill="#fbbf24" />
            <rect x="506" y="175" width="2" height="13" fill="#fbbf24" />
            <rect x="513" y="175" width="2" height="13" fill="#fbbf24" />
            <rect x="520" y="175" width="2" height="13" fill="#fbbf24" />

            {/* Decorative cornices */}
            <rect x="340" y="195" width="320" height="8" fill="url(#goldAccent)" />
            <rect x="90" y="195" width="270" height="6" fill="url(#goldAccent)" />
            <rect x="640" y="195" width="270" height="6" fill="url(#goldAccent)" />

            {/* University crest above entrance */}
            <circle cx="500" cy="250" r="25" fill="url(#goldAccent)" stroke="#f59e0b" strokeWidth="3" />
            <circle cx="500" cy="250" r="20" fill="#1e3a8a" />
            <polygon points="500,235 510,245 500,255 490,245" fill="#fbbf24" />
            <text x="500" y="270" textAnchor="middle" fontSize="8" fill="#fbbf24" fontWeight="bold">
              EST. 1875
            </text>
          </svg>
          </g>
              </svg>

              {[
                {
                  id: 1,
                  grade: "Grade 7 – 10",
                  title: "Candidacy Building",
                  description: "Build strong academic foundation and explore interests",
                  icon: "🎯",
                  color: "from-purple-500 to-purple-600",
                  bgColor: "bg-purple-50",
                  textColor: "text-purple-700",
                  details: [
                    "Identify academic & EC strengths",
                    "Start building EC profile & leadership projects",
                    "Focus on research project",
                    "Prepare for Competitive Math"
                  ]
                },
                {
                  id: 2,
                  grade: "Grade 10 – 11",
                  title: "Candidacy Application",
                  description: "Begin standardized testing and college research",
                  icon: "📚",
                  color: "from-blue-500 to-blue-600",
                  bgColor: "bg-blue-50",
                  textColor: "text-blue-700",
                  details: [
                    "Strengthen EC & academics",
                    "Deep exploration of areas of interest",
                    "Submitting research paper to a journal",
                    "Top 5% of AMC10, AMC 12",
                    "Top 5% of F = ma",
                    "Take SAT/ACT"
                  ]
                },
                {
                  id: 3,
                  grade: "Grade 11 Spring",
                  title: "Application Preparation",
                  description: "Finalize college list and prepare application materials",
                  icon: "📝",
                  color: "from-emerald-500 to-emerald-600",
                  bgColor: "bg-emerald-50",
                  textColor: "text-emerald-700",
                  details: [
                    "Retake SAT/ACT (if required)",
                    "Giving AIME Exam",
                    "Consider your application strategy: school list and deadlines"
                  ]
                },
                {
                  id: 4,
                  grade: "Grade 12 Summer, Fall",
                  title: "Application Assembly",
                  description: "Submit applications and complete requirements",
                  icon: "📤",
                  color: "from-orange-500 to-orange-600",
                  bgColor: "bg-orange-50",
                  textColor: "text-orange-700",
                  details: [
                    "Decide on essay topics and start drafting them over summer",
                    "Edit the essays and make them camera ready by the fall break",
                    "Compile academic/EC achievements & information",
                    "Recommendations"
                  ]
                },
                {
                  id: 5,
                  grade: "Grade 12 Spring",
                  title: "Decision Released",
                  description: "Receive admissions decisions and make final choice",
                  icon: "🎓",
                  color: "from-rose-500 to-rose-600",
                  bgColor: "bg-rose-50",
                  textColor: "text-rose-700",
                  details: [
                    "Review admission offers",
                    "Compare financial aid packages",
                    "Make final college decision",
                    "Submit enrollment deposit"
                  ]
                },
              ].map((milestone, index) => {
                const getPositionOnCurve = (index: number) => {
                  const progress = index * 25
                  const t = progress / 100
                  let x =
                    Math.pow(1 - t, 4) * 8 +
                    4 * Math.pow(1 - t, 3) * t * 20 +
                    6 * Math.pow(1 - t, 2) * Math.pow(t, 2) * 45 +
                    4 * (1 - t) * Math.pow(t, 3) * 75 +
                    Math.pow(t, 4) * 92

                  let y =
                    Math.pow(1 - t, 4) * 88 +
                    4 * Math.pow(1 - t, 3) * t * 75 +
                    6 * Math.pow(1 - t, 2) * Math.pow(t, 2) * 55 +
                    4 * (1 - t) * Math.pow(t, 3) * 35 +
                    Math.pow(t, 4) * 22

                  if (progress === 0) {
                    x+=2
                    y -= 20 // Grade 7-10: moved up by 2 units (was -12, now -14)
                  } else if (progress === 25) {
                    x+=13
                    y -= 15 // Grade 10-11: moved down by 4 units (was -12, now -8)
                  } else if (progress === 50) {
                    x+=14
                    y -= 20 // Grade 11 Spring: moved down by 12 units (was -14, now -2)
                  } else if (progress === 75) {
                    y -= 28
                    x-=26 // Grade 12 Summer/Fall: moved down by 12 units (was -14, now -2)
                  } else                   if (progress === 100) {
                    y -= 30 // Grade 12 Spring: moved down by 1 unit (was -14, now -13)
                    x -= 15 // Grade 12 Spring: moved left by 2 more units (was -3, now -5)
                  }

                  return { x: `${x}%`, y: `${y}%` }
                }

                const position = getPositionOnCurve(index)
                return (
                  <motion.div
                    key={milestone.id}
                    data-milestone={milestone.id}
                    initial={{ opacity: 0, scale: 0.75 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.3, duration: 0.7 }}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 hover:scale-110 transition-all duration-500 group"
                    style={{
                      left: position.x,
                      top: position.y,
                    }}
                  >
                    <div className="relative">
                      <div
                        className={`absolute inset-0 bg-gradient-to-r ${milestone.color} rounded-full blur-xl transition-all duration-500 opacity-40 scale-125 animate-pulse`}
                      ></div>

                      <div
                        className={`relative w-16 h-16 bg-gradient-to-br ${milestone.color} rounded-full border-3 ${
                          selectedMilestone === milestone.id ? 'border-yellow-400 shadow-yellow-400/50' : 'border-white'
                        } shadow-xl flex items-center justify-center transition-all duration-500 hover:scale-125 group-hover:scale-125 z-20`}
                      >
                        <div className="text-xl">{milestone.icon}</div>
                      </div>

                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-8 bg-gradient-to-b from-gray-500 to-gray-700 shadow-lg"></div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 translate-y-8 w-6 h-2 bg-gradient-to-b from-gray-600 to-gray-800 rounded-sm"></div>
                    </div>

                    <motion.div
                      data-milestone-content={milestone.id}
                      initial={{ opacity: 0, translateY: 4 }}
                      whileInView={{ opacity: 1, translateY: 0 }}
                      transition={{ delay: index * 0.3 + 0.5, duration: 0.7 ,width: { duration: 0.4, ease: "easeInOut" }}}
                      className="absolute cursor-pointer"
                      style={{
                        // Position details card above and to the left for 4th milestone to avoid road overlap
                        top: "80px",
                        left: index === 3 ? "-185px" : "50%",
                        transform: index === 3 ? "translateX(0%)" : "translateX(-50%)",
                      }}
                      animate={{
                        width: selectedMilestone === milestone.id ? "250px" : "200px",
                      }}
                      // transition={{
                      //   duration: 0.4,
                      //   ease: "easeInOut"
                      // }}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent click from bubbling up to background
                        setSelectedMilestone(selectedMilestone === milestone.id ? null : milestone.id);
                      }}
                    >
                      <div
                        className={`relative ${milestone.bgColor} backdrop-blur-sm rounded-lg shadow-xl p-3 border border-white/30 overflow-hidden transition-all duration-300 ${
                          selectedMilestone === milestone.id ? 'border-yellow-400/50 shadow-yellow-400/25' : ''
                        }`}
                      >
                        <div className="relative text-center">
                          <div
                            className={`inline-flex items-center px-2 py-1 bg-gradient-to-r ${milestone.color} text-white text-xs font-semibold rounded-full mb-2`}
                          >
                            {milestone.grade}
                          </div>

                          <h4 className={`font-bold ${milestone.textColor} text-sm mb-1`}>{milestone.title}</h4>

                          {selectedMilestone === milestone.id ? (
                            <motion.div 
                              className="space-y-2"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: 0.1 }}
                            >
                              <p className="text-gray-600 text-xs leading-relaxed mb-3">{milestone.description}</p>
                              <div className="space-y-1">
                                {milestone.details.map((detail, detailIndex) => (
                                  <motion.div 
                                    key={detailIndex} 
                                    className="flex items-start gap-2 text-left"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.2, delay: 0.2 + detailIndex * 0.1 }}
                                  >
                                    <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-1.5 flex-shrink-0"></div>
                                    <span className="text-gray-600 text-xs leading-relaxed">{detail}</span>
                                  </motion.div>
                                ))}
                              </div>
                            </motion.div>
                          ) : (
                            <motion.p 
                              className="text-gray-600 text-xs leading-relaxed"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.2 }}
                            >
                              {milestone.description}
                            </motion.p>
                          )}
                        </div>

                        <div
                          className={`absolute left-1/2 transform -translate-x-1/2 w-3 h-3 ${milestone.bgColor} rotate-45 border border-white/30 top-[-6px]`}
                        ></div>
                      </div>
                    </motion.div>
                  </motion.div>
                )
              })}
            </div>

            {/* <div className="mt-12 text-center">
              <div className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
                <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-white font-semibold text-sm">
                  🎉 Journey Complete! Ready for College!
                </span>
              </div>
            </div> */}
          </div>
        </div>
      </section>
      {/* Infographics Dashboard Section */}
      <section className="py-20 theme-bg-dark relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-400 rounded-full opacity-5 animate-float"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-blue-400 rounded-full opacity-5 animate-float-reverse"></div>
          <div className="absolute top-1/2 left-1/3 w-20 h-20 bg-purple-400 rounded-full opacity-5 animate-float"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-yellow-400/10 text-yellow-400 border-yellow-400/20">
              📊 Data Insights
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold theme-text-light mb-6">
              College Prep Analytics Dashboard
            </h2>
            <p className="text-xl theme-text-muted max-w-3xl mx-auto">
              Visualize your college preparation journey with data-driven insights and competitive achievement tracking
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-7xl mx-auto"
          >
            <EffortLevelInfographic />
          </motion.div>
        </div>
      </section>

      {/* College Acceptances Section */}
      <section className="py-20 theme-bg-dark relative overflow-hidden">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-32 right-10 w-24 h-24 bg-blue-400 rounded-full opacity-5 animate-float-reverse"></div>
          <div className="absolute bottom-32 left-20 w-20 h-20 bg-purple-400 rounded-full opacity-5 animate-float"></div>
          <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-green-400 rounded-full opacity-5 animate-float-reverse"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-yellow-400/10 text-yellow-400">College Acceptances</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold theme-text-light mb-6">Where Our Students Have Been Accepted</h2>
            <p className="text-xl theme-text-muted max-w-3xl mx-auto">Our students have gained admission to top colleges and universities across the country.</p>
          </motion.div>
          
          {/* Infinite Carousel */}
          <div className="relative overflow-hidden group py-8">
            <div className="flex animate-scroll group-hover:pause-animation">
              {[...colleges, ...colleges].map((college, index) => (
                <div
                  key={`${college.name}-${index}`}
                  className="flex-shrink-0 mx-6 md:mx-8 flex flex-col items-center justify-center"
                >
                  <div className="w-32 h-32 bg-white rounded-full shadow-lg flex items-center justify-center mb-3 border-2 border-yellow-400/20 hover:scale-110 hover:shadow-xl transition-transform duration-300 overflow-hidden">
                    <Image
                      src={college.logo}
                      alt={college.name}
                      width={110}
                      height={110}
                      className="object-contain transition-all duration-300"
                    />
                  </div>
                  <span className="text-sm font-semibold theme-text-light text-center whitespace-nowrap">{college.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {/* <section className="py-20 relative overflow-hidden bg-gradient-to-br from-[#1a2236] via-[#1a2236] to-[#2a3246]"> */}
        {/* Background Pattern */}
        {/* <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                              radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }} />
        </div> */}
        
        {/* Subtle Glow Effects */}
        {/* <div className="absolute top-20 left-20 w-40 h-40 bg-yellow-400/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-blue-400/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-purple-400/5 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-yellow-400/10 text-yellow-400">Student Success</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold theme-text-light mb-6">What Parents & Students Say</h2>
            <p className="text-xl theme-text-muted max-w-3xl mx-auto">Hear from our successful students and their parents about their UACHIEVE experience.</p>
          </motion.div> */}
          
          {/* Rotating Circular Testimonials */}
          {/* <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="max-w-6xl mx-auto relative"
          >
            <TestimonialsSection />
          </motion.div>
        </div>
      </section> */}
                  {/* Testimonials Section */}
      <section className="py-20 theme-bg-dark">

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-yellow-400/10 text-yellow-400">Student Success</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold theme-text-light mb-6">What Parents & Students Say</h2>
            <p className="text-xl theme-text-muted max-w-3xl mx-auto">Hear from our successful students and their parents about their AES tutoring experience.</p>
          </motion.div>
          
          {/* Rotating Circular Testimonials */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="max-w-6xl mx-auto relative"
          >
            <TestimonialsSection />
          </motion.div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-12 sm:py-16 lg:py-20 theme-bg-dark relative overflow-hidden">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-400 rounded-full opacity-5 animate-float"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-blue-400 rounded-full opacity-5 animate-float-reverse"></div>
          <div className="absolute top-1/2 left-1/3 w-20 h-20 bg-purple-400 rounded-full opacity-5 animate-float"></div>
          <div className="absolute bottom-32 left-1/4 w-16 h-16 bg-green-400 rounded-full opacity-5 animate-float-reverse"></div>
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-amber-500/10"></div>
        
        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto space-y-6 sm:space-y-8"
          >
            <Badge className="mb-4 bg-yellow-400/10 text-yellow-400 border-yellow-400/20">
              🚀 Start Your Journey Today
            </Badge>
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold theme-text-light leading-tight">
              Ready to Discover Your Potential?
            </h2>
            
            <p className="text-base sm:text-lg lg:text-xl theme-text-muted px-4 leading-relaxed max-w-3xl mx-auto">
              Schedule a FREE Discovery Session with a UACHIEVE Mentor and explore how we can help you build a future that reflects your true potential.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center pt-4">
              <Link href="/book-session">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 hover:from-yellow-300 hover:to-yellow-400 text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold w-full sm:w-auto"
                >
                  <Calendar className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Book a Free Consultation
                </Button>
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="pt-8 border-t border-gray-700/30"
            >
              <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 text-sm theme-text-muted">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>100% Free Initial Session</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>No Commitment Required</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Expert Mentorship</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
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
        @keyframes slideInBottom {
          from { opacity: 0; transform: translateY(60px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in-bottom {
          animation: slideInBottom 1s;
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.7s;
        }
        @keyframes morphing {
          0% { border-radius: 2rem 2rem 2rem 2rem; }
          50% { border-radius: 2.5rem 1.5rem 2.5rem 1.5rem; }
          100% { border-radius: 2rem 2rem 2rem 2rem; }
        }
        .animate-morphing {
          animation: morphing 6s infinite alternate ease-in-out;
        }
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .animate-shimmer {
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%);
          background-size: 400px 100%;
          animation: shimmer 2s infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-16px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        @keyframes floatReverse {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(16px); }
        }
        .animate-float-reverse {
          animation: floatReverse 4s ease-in-out infinite;
        }
        .glass-effect {
          background: rgba(26, 34, 54, 0.8);
          backdrop-filter: blur(12px) saturate(120%);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
        }
        @keyframes road-flow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-road-flow {
          animation: road-flow 3s linear infinite;
        }
      `}</style>
    </main>
  );
}