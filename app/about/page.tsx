"use client";

import React from 'react';
import { motion } from "framer-motion";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Users, BookOpen, Target, Trophy, Linkedin, Globe, Mail, GraduationCap, Star, Calculator, Atom } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import Chatbot from "@/components/home/Chatbot";
import { useScroll, useTransform } from "framer-motion";

const faculty = [
  {
    name: "Bhavya Sree Kandala",
    role: "Criminal Defense & Family Law Attorney",
    education: "Master of Laws (LLM) from Seattle University School of Law",
    institution: "Washington State, USA",
    experience: "Criminal Defense & Family Law Practice",
    specialties: ["Family Law", "Criminal Defense", "Divorce & Child Custody", "DUI & Traffic Defense"],
    achievements: ["Licensed Washington State Attorney", "Comprehensive litigation expertise", "Client-centered legal advocacy", "Compassionate legal representation"],
    image: "/bhavya-kandala.png",
  },
  {
    name: "Dr. Manasa Kandula",
    role: "Assistant Professor",
    education: "Ph.D. in Materials Science",
    institution: "University of Massachusetts Amherst, USA",
    experience: "Research & Teaching in Physics & Materials Science",
    specialties: ["Soft Condensed Matter", "Advanced Microscopy", "Biological Materials", "Materials Science Engineering"],
    achievements: ["Faculty Success Fellow 2024", "International research experience", "Undergraduate research mentor", "Interdisciplinary collaboration expert"],
    image: "/mk.png",
  },
  {
    name: "Dr. Thejus R. Kartha",
    role: "Asst. Professor",
    education: "Ph.D in Computational Chemistry",
    institution: "Indian Institute of Technology Hyderabad, India",
    experience: "Research & Teaching",
    specialties: ["Data Science", "AI/ML", "Infrared Signal Processing", "Computational Chemistry"],
    achievements: ["Data-driven solutions expert", "AI/ML lecturer", "Science education advocate", "Arts enthusiast"],
    image: "/thejus-r-kartha.png",
  },
  {
    name: "Dr. Rakesh Lingam",
    role: "Assistant Professor",
    education: "Ph.D in Mechanical and Aerospace Engineering",
    institution: "Indian Institute of Technology Dharwad, India",
    experience: "Research & Mentoring",
    specialties: ["Mechanical Engineering", "Aerospace Engineering", "Innovation Mentoring", "Youth Development"],
    achievements: ["Top engineering faculty", "Innovation advocate", "Youth mentor", "Future-ready education"],
    image: "/rakesh-lingam.png",
  },
  {
    name: "Aneesh Bhardwaj",
    role: "Mathematics Tutor & Speech & Debate Coach",
    education: "Computer Engineering (3rd year undergraduate)",
    institution: "UC Davis, USA",
    experience: "Mathematics Tutoring & Speech & Debate Coaching",
    specialties: ["IM1-IM3 Mathematics", "Precalculus", "Speech & Debate", "Analytical Problem Solving"],
    achievements: ["6 years speech & debate experience", "National tournament competitor", "Science fair presenter", "Community mentor"],
    image: "/aneesh.png",
  },
  {
    name: "Dr. Konjengbam Anand",
    role: "Assistant Professor",
    education: "Ph.D. in Computer Science & Engineering",
    institution: "Indian Institute of Technology Dharwad, India",
    experience: "Research & Teaching in AI/ML",
    specialties: ["Natural Language Processing", "Sentiment Analysis", "Machine Translation", "Generative AI"],
    achievements: ["Suzuki Foundation Research Grant recipient", "IIT Hyderabad Research Excellence Award", "Text-to-Speech synthesis expert", "International research collaboration"],
    image: "/kjba.png",
  }
];

const pillars = [
  {
    icon: Users,
    title: "Personalized Approach",
    description: "Tailored learning paths for every student's unique needs",
  },
  {
    icon: BookOpen,
    title: "Academic Excellence",
    description: "Rigorous standards combined with supportive guidance",
  },
  {
    icon: Target,
    title: "Future Success",
    description: "Preparing students for competitive academic environments",
  },
];

export default function AboutPage() {
  const { scrollYProgress } = useScroll();
  
  // Create transform values at the top level to avoid hooks in callbacks
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const backgroundOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.6, 0.3]);

  return (
    <main className="min-h-screen theme-bg-dark flex flex-col">
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
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-left space-y-8 animate-slide-in-bottom">
              <Badge className="mb-4 bg-yellow-400/10 text-yellow-400 border-yellow-400/20">
                📖 About Us
              </Badge>
              <div>
                <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent mb-4 animate-slide-in-bottom">
                  About Acharya
                </h1>
                                 <h2 className="text-3xl lg:text-4xl font-bold theme-text-light mb-6">
                   Nurturing Students&apos; Intuitive Abilities
                 </h2>
                <p className="text-lg theme-text-muted max-w-2xl animate-slide-in-bottom" style={{ animationDelay: '0.2s' }}>
                  ACHARYA Educational Services is a California-based organization dedicated to guiding students toward academic excellence and future success. We ignite a passion for core concepts and emerging technologies, helping students build lasting connections to the knowledge shaping our world today.
                </p>
              </div>
            </div>

            {/* Right SVG Illustration with Enhanced Glow Effects */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 50 }}
              whileInView={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="flex justify-center items-center"
            >
              <div className="relative w-full max-w-md">
                {/* Enhanced Multiple Glowing Background Effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 to-amber-500/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute inset-4 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute inset-8 bg-gradient-to-tl from-green-400/15 to-cyan-500/15 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                
                <svg
                  viewBox="0 0 300 300"
                  className="w-full h-auto relative z-10"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    {/* Enhanced Gradients with More Vibrant Colors */}
                    <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FCD34D" />
                      <stop offset="50%" stopColor="#F59E0B" />
                      <stop offset="100%" stopColor="#D97706" />
                    </linearGradient>
                    <linearGradient id="bookGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#60A5FA" />
                      <stop offset="50%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#1E40AF" />
                    </linearGradient>
                    <linearGradient id="screenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1E3A8A" />
                      <stop offset="50%" stopColor="#1E40AF" />
                      <stop offset="100%" stopColor="#1E3A8A" />
                    </linearGradient>
                    
                    {/* Strong Glow Filters */}
                    <filter id="strongGlow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
                      <feMerge> 
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                    
                    <filter id="mediumGlow" x="-40%" y="-40%" width="180%" height="180%">
                      <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
                      <feMerge> 
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                    
                    <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge> 
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                    
                    {/* Pulsing Glow Filter */}
                    <filter id="pulsingGlow" x="-60%" y="-60%" width="220%" height="220%">
                      <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                      <feMerge> 
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                      <animate attributeName="stdDeviation" values="6;12;6" dur="2s" repeatCount="indefinite"/>
                    </filter>
                  </defs>

                  {/* Enhanced Central Knowledge Hub with Multiple Layers */}
                  <circle 
                    cx="150" 
                    cy="150" 
                    r="80" 
                    fill="url(#primaryGradient)" 
                    opacity="0.15" 
                    filter="url(#strongGlow)"
                    className="animate-pulse"
                  />
                  <circle 
                    cx="150" 
                    cy="150" 
                    r="60" 
                    fill="url(#primaryGradient)" 
                    opacity="0.1" 
                    filter="url(#mediumGlow)"
                    className="animate-pulse"
                    style={{ animationDelay: '0.5s' }}
                  />

                  {/* Modern Laptop/Screen with Enhanced Glow */}
                  <rect x="110" y="120" width="80" height="50" rx="6" fill="url(#screenGradient)" stroke="#FCD34D" strokeWidth="3" filter="url(#mediumGlow)"/>
                  <rect x="115" y="125" width="70" height="35" rx="2" fill="#0F172A" filter="url(#softGlow)"/>
                  
                  {/* Screen Content Lines with Individual Glows */}
                  <rect x="120" y="130" width="30" height="2" fill="#FCD34D" opacity="0.9" filter="url(#softGlow)"/>
                  <rect x="120" y="135" width="45" height="2" fill="#60A5FA" opacity="0.8" filter="url(#softGlow)"/>
                  <rect x="120" y="140" width="35" height="2" fill="#34D399" opacity="0.8" filter="url(#softGlow)"/>
                  <rect x="120" y="145" width="50" height="2" fill="#A78BFA" opacity="0.8" filter="url(#softGlow)"/>
                  <rect x="120" y="150" width="25" height="2" fill="#F87171" opacity="0.8" filter="url(#softGlow)"/>

                  {/* Laptop Base with Glow */}
                  <rect x="105" y="170" width="90" height="8" rx="4" fill="#374151" filter="url(#softGlow)"/>

                  {/* Floating Knowledge Elements with Enhanced Effects */}
                  
                  {/* Mathematics Symbol with Strong Glow */}
                  <g transform="translate(80, 80)" filter="url(#strongGlow)">
                    <circle cx="0" cy="0" r="20" fill="url(#primaryGradient)" opacity="0.3"/>
                    <circle cx="0" cy="0" r="15" fill="url(#primaryGradient)" opacity="0.5"/>
                    <text x="0" y="0" textAnchor="middle" dominantBaseline="middle" fill="#FCD34D" fontSize="18" fontWeight="bold">∑</text>
                    <animateTransform
                      attributeName="transform"
                      attributeType="XML"
                      type="translate"
                      values="80,80; 85,75; 80,80"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </g>

                  {/* Science Atom with Pulsing Glow */}
                  <g transform="translate(220, 90)" filter="url(#pulsingGlow)">
                    <circle cx="0" cy="0" r="18" fill="#3B82F6" opacity="0.4"/>
                    <circle cx="0" cy="0" r="12" fill="#60A5FA" opacity="0.3"/>
                    <circle cx="0" cy="0" r="4" fill="#93C5FD"/>
                    <ellipse cx="0" cy="0" rx="15" ry="6" fill="none" stroke="#60A5FA" strokeWidth="2"/>
                    <ellipse cx="0" cy="0" rx="6" ry="15" fill="none" stroke="#93C5FD" strokeWidth="1.5"/>
                    <animateTransform
                      attributeName="transform"
                      attributeType="XML"
                      type="translate"
                      values="220,90; 215,85; 220,90"
                      dur="2.5s"
                      repeatCount="indefinite"
                    />
                  </g>

                  {/* Lightbulb with Intense Glow */}
                  <g transform="translate(90, 220)" filter="url(#strongGlow)">
                    <circle cx="0" cy="-5" r="16" fill="url(#primaryGradient)" opacity="0.9"/>
                    <circle cx="0" cy="-5" r="12" fill="#FCD34D" opacity="0.8"/>
                    <rect x="-5" y="7" width="10" height="8" rx="3" fill="#6B7280"/>
                    <path d="M-10 -8 Q0 -18 10 -8" stroke="#FEF3C7" strokeWidth="2" fill="none" opacity="0.9"/>
                    <path d="M-6 -12 Q0 -16 6 -12" stroke="#FCD34D" strokeWidth="1.5" fill="none" opacity="0.8"/>
                    <animateTransform
                      attributeName="transform"
                      attributeType="XML"
                      type="translate"
                      values="90,220; 95,215; 90,220"
                      dur="4s"
                      repeatCount="indefinite"
                    />
                  </g>

                  {/* Graduation Cap with Enhanced Glow */}
                  <g transform="translate(210, 210)" filter="url(#mediumGlow)">
                    <ellipse cx="0" cy="0" rx="18" ry="5" fill="#1F2937"/>
                    <rect x="-18" y="-5" width="36" height="3" rx="1.5" fill="#374151"/>
                    <circle cx="15" cy="-3" r="3" fill="#FCD34D"/>
                    <line x1="15" y1="-3" x2="22" y2="-10" stroke="#F59E0B" strokeWidth="2"/>
                    <circle cx="0" cy="-8" r="12" fill="none" stroke="#FCD34D" strokeWidth="1" opacity="0.3"/>
                    <animateTransform
                      attributeName="transform"
                      attributeType="XML"
                      type="translate"
                      values="210,210; 205,205; 210,210"
                      dur="3.5s"
                      repeatCount="indefinite"
                    />
                  </g>

                  {/* Book Stack with Individual Glows */}
                  <g transform="translate(60, 150)" filter="url(#softGlow)">
                    <rect x="0" y="0" width="28" height="5" rx="2.5" fill="#F87171"/>
                    <rect x="0" y="-7" width="28" height="5" rx="2.5" fill="#34D399"/>
                    <rect x="0" y="-14" width="28" height="5" rx="2.5" fill="#A78BFA"/>
                    <rect x="0" y="-21" width="28" height="5" rx="2.5" fill="#60A5FA"/>
                  </g>

                  {/* Trophy with Strong Glow */}
                  <g transform="translate(240, 150)" filter="url(#strongGlow)">
                    <path d="M-10 0 Q-10 -10 0 -10 Q10 -10 10 0 Q10 5 5 7 L5 10 L-5 10 L-5 7 Q-10 5 -10 0" fill="url(#primaryGradient)"/>
                    <rect x="-8" y="10" width="16" height="5" rx="2.5" fill="#6B7280"/>
                    <circle cx="-15" cy="-2" r="4" fill="none" stroke="#FCD34D" strokeWidth="2"/>
                    <circle cx="15" cy="-2" r="4" fill="none" stroke="#FCD34D" strokeWidth="2"/>
                  </g>

                  {/* Enhanced Connecting Lines with Glow */}
                  <path 
                    d="M 100 100 Q 125 110 140 130" 
                    stroke="#FCD34D" 
                    strokeWidth="2" 
                    fill="none" 
                    opacity="0.6"
                    filter="url(#softGlow)"
                    strokeDasharray="4,4"
                  >
                    <animate attributeName="stroke-dashoffset" values="0;8;0" dur="2s" repeatCount="indefinite"/>
                  </path>
                  
                  <path 
                    d="M 200 110 Q 180 120 160 130" 
                    stroke="#60A5FA" 
                    strokeWidth="2" 
                    fill="none" 
                    opacity="0.6"
                    filter="url(#softGlow)"
                    strokeDasharray="4,4"
                  >
                    <animate attributeName="stroke-dashoffset" values="0;8;0" dur="2.5s" repeatCount="indefinite"/>
                  </path>

                  {/* Success Indicator with Glow */}
                  <g transform="translate(150, 200)" filter="url(#mediumGlow)">
                    <circle cx="0" cy="0" r="10" fill="#34D399" opacity="0.3"/>
                    <path d="M-4 0 L-1 3 L4 -3" stroke="#10B981" strokeWidth="3" fill="none" strokeLinecap="round"/>
                  </g>

                  {/* Enhanced Floating Particles with Strong Glows */}
                  <circle cx="70" cy="180" r="3" fill="#FCD34D" opacity="0.8" filter="url(#strongGlow)">
                    <animate attributeName="cy" values="180;170;180" dur="2s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx="230" cy="130" r="2.5" fill="#34D399" opacity="0.9" filter="url(#mediumGlow)">
                    <animate attributeName="cy" values="130;120;130" dur="2.8s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.9;0.3;0.9" dur="2.8s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx="180" cy="250" r="3" fill="#A78BFA" opacity="0.7" filter="url(#strongGlow)">
                    <animate attributeName="cy" values="250;240;250" dur="3.2s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.7;0.2;0.7" dur="3.2s" repeatCount="indefinite"/>
                  </circle>
                  
                  {/* Additional Sparkling Effects */}
                  <circle cx="50" cy="100" r="2" fill="#F59E0B" opacity="0.6" filter="url(#mediumGlow)">
                    <animate attributeName="r" values="2;4;2" dur="1.5s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.6;0.1;0.6" dur="1.5s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx="250" cy="250" r="2" fill="#60A5FA" opacity="0.7" filter="url(#mediumGlow)">
                    <animate attributeName="r" values="2;5;2" dur="2.2s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.7;0.1;0.7" dur="2.2s" repeatCount="indefinite"/>
                  </circle>

                </svg>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Words from Our Founder Section */}
      <section className="py-24 theme-bg-dark relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-20 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-amber-500/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-br from-blue-400/15 to-purple-500/15 rounded-full blur-2xl animate-float-reverse"></div>
          <div className="absolute bottom-20 left-1/3 w-20 h-20 bg-gradient-to-br from-green-400/10 to-emerald-500/10 rounded-full blur-xl animate-float"></div>
          <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-gradient-to-br from-pink-400/15 to-rose-500/15 rounded-full blur-lg animate-float-reverse"></div>
          
          {/* Floating Geometric Shapes */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/4 left-1/4 w-8 h-8 border-2 border-yellow-400/30 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-1/4 right-1/4 w-6 h-6 border-2 border-blue-400/30 transform rotate-45"
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Enhanced Header with Animated Elements */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-center mb-20"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-block mb-6"
            >
              <Badge className="bg-gradient-to-r from-yellow-400/20 to-amber-500/20 text-yellow-400 border-yellow-400/40 px-6 py-3 text-lg font-semibold shadow-lg backdrop-blur-sm">
                ✨ Founder&apos;s Words ✨
              </Badge>
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent mb-8"
            >
              Words from Our Founder
            </motion.h2>
            
            {/* Animated Underline */}
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "200px" }}
              transition={{ duration: 1.2, delay: 0.6 }}
              className="h-1 bg-gradient-to-r from-yellow-400 to-amber-500 mx-auto rounded-full shadow-lg"
            />
          </motion.div>
          
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Enhanced Founder's Message */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="space-y-8 relative"
              >
                {/* Glowing Background for Message */}
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 to-amber-500/5 rounded-3xl blur-3xl"></div>
                
                                                  <motion.div
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.8, delay: 0.8 }}
                   className="relative z-10"
                 >
                   <motion.div
                     initial={{ opacity: 0, scale: 0.9 }}
                     whileInView={{ opacity: 1, scale: 1 }}
                     transition={{ duration: 0.6, delay: 1 }}
                     className="text-center mb-8"
                   >
                     {/* <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                       <span className="text-3xl">✨</span>
                     </div> */}
                     <h3 className="text-3xl lg:text-4xl font-bold theme-text-light mb-2 bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
                       WELCOME TO ACHARYA
                     </h3>
                     <p className="text-lg theme-text-muted">A Message from Our Founder</p>
                   </motion.div>
                   
                   <div className="space-y-6">
                     <motion.div
                       initial={{ opacity: 0, x: -20 }}
                       whileInView={{ opacity: 1, x: 0 }}
                       transition={{ duration: 0.8, delay: 1.2 }}
                       className="relative"
                     >
                       <div className="flex items-start space-x-4">
                         <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-yellow-400/20 to-amber-500/20 rounded-full flex items-center justify-center text-2xl">
                           ✨
                         </div>
                         <div className="flex-1">
                           <blockquote className="relative">
                             <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-yellow-400 to-amber-500 rounded-full"></div>
                             <div className="pl-6 space-y-4">
                               <p className="text-lg theme-text-muted leading-relaxed italic font-medium">
                                 &quot;Being passionate about teaching and mentoring students, we, at ACHARYA, would be thrilled to help young minds unlock their full potential and to prepare them for lifelong success.&quot;
                               </p>
                               
                               <p className="text-lg theme-text-muted leading-relaxed italic font-medium">
                                 &quot;Instant connection with students as my natural ability, I encourage mentors to strive to create a nurturing and motivating environment for your children to feel empowered and grow.&quot;
                               </p>
                               
                               <p className="text-lg theme-text-muted leading-relaxed italic font-medium">
                                 &quot;Through personalized teaching strategies, we aim to inspire confidence, foster critical thinking and cultivate a love for learning.&quot;
                               </p>
                               
                               <p className="text-lg theme-text-muted leading-relaxed italic font-medium">
                                 &quot;We believe that every student has the potential to excel and with little guidance and encouragement they are bound to achieve their dreams.&quot;
                               </p>
                             </div>
                           </blockquote>
                         </div>
                       </div>
                     </motion.div>
                   </div>
                   
                   <motion.div
                     initial={{ opacity: 0, y: 20 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.8, delay: 2.2 }}
                     className="mt-8 pt-6 border-t border-yellow-400/20"
                   >
                     <div className="text-center">
                       <p className="text-sm theme-text-muted mb-2">With dedication and passion,</p>
                       <p className="text-lg font-semibold theme-text-light">Dr. Shanti Swaroop Kandala</p>
                     </div>
                   </motion.div>
                 </motion.div>
                
                                 
              </motion.div>

                             {/* Enhanced Founder's Image */}
               <motion.div
                 initial={{ opacity: 0, x: 50 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                 className="flex flex-col items-center relative"
               >
                 {/* Reduced Background Glow Effects */}
                 <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-amber-500/20 rounded-full blur-2xl"></div>
                 <div className="absolute inset-8 bg-gradient-to-br from-blue-400/15 to-purple-500/15 rounded-full blur-xl"></div>
                 
                                   {/* Enhanced Founder's Image Container */}
                  <motion.div
                    whileHover={{ scale: 1.05, rotateY: 5 }}
                    transition={{ duration: 0.3 }}
                    className="relative"
                  >
                                         <div className="relative w-80 h-80 rounded-full overflow-hidden border-4 border-gradient-to-r from-yellow-400/30 to-amber-500/30 shadow-2xl">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full"
                      >
                        <Image
                          src="/founder-image.png"
                          alt="Dr. Shanti Swaroop Kandala - Founder of ACHARYA"
                          width={320}
                          height={320}
                          className="w-full h-full object-cover object-center"
                        />
                      </motion.div>
                      
                      {/* Overlay with Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1a2236]/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    
                    {/* Achievement Badges Removed */}
                    
                    {/* Static Decorative Elements */}
                    <div className="absolute top-1/2 -right-8 w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full shadow-lg"></div>
                    
                    <div className="absolute bottom-1/2 -left-8 w-4 h-4 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full shadow-lg"></div>
                  </motion.div>
                 
                                   {/* Founder's Signature Below Image - Now properly positioned */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.5 }}
                    className="mt-8 text-center"
                  >
                    <motion.p
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 1.7 }}
                      className="text-2xl font-bold theme-text-light mb-2"
                    >
                      Dr. Shanti Swaroop Kandala
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 1.9 }}
                      className="text-lg text-yellow-400 font-semibold mb-4"
                    >
                      Founder/CEO/Research Program Director
                    </motion.p>
                    <div className="space-y-2">
                      <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 2.1 }}
                        className="text-sm theme-text-muted font-medium"
                      >
                        Ph.D. in Mechanical and Aerospace Engineering, IITH, India
                      </motion.p>
                      <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 2.3 }}
                        className="text-sm theme-text-muted font-medium"
                      >
                        M.S in Aerospace Engg., KAIST, South Korea
                      </motion.p>
                      <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 2.5 }}
                        className="text-sm theme-text-muted font-medium"
                      >
                        Master in Liberal Arts, Ashoka (UPenn), India
                      </motion.p>
                    </div>
                  </motion.div>
               </motion.div>
             </div>
           </div>
         </div>
        
        {/* Additional CSS Animations */}
        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
          @keyframes float-reverse {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(20px) rotate(-180deg); }
          }
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
          .animate-float-reverse {
            animation: float-reverse 8s ease-in-out infinite;
          }
        `}</style>
      </section>

             {/* Elite Educators Section */}
       <section className="py-20 theme-bg-dark relative overflow-hidden">
         {/* Smart Scrolling Background Elements */}
         <div className="absolute inset-0 overflow-hidden">
           <motion.div
             animate={{ 
               y: [0, -80, 0],
               rotate: [0, 3, 0]
             }}
             transition={{ 
               duration: 18, 
               repeat: Infinity, 
               ease: "linear"
             }}
             className="absolute top-16 left-16 w-28 h-28 bg-gradient-to-br from-yellow-400/20 to-amber-500/20 rounded-full blur-3xl"
           />
           <motion.div
             animate={{ 
               y: [0, 60, 0],
               rotate: [0, -6, 0]
             }}
             transition={{ 
               duration: 22, 
               repeat: Infinity, 
               ease: "linear"
             }}
             className="absolute bottom-16 right-16 w-20 h-20 bg-gradient-to-br from-blue-400/15 to-purple-500/15 rounded-full blur-2xl"
           />
           <motion.div
             animate={{ 
               y: [0, -40, 0],
               scale: [1, 1.1, 1]
             }}
             transition={{ 
               duration: 28, 
               repeat: Infinity, 
               ease: "linear"
             }}
             className="absolute top-1/3 right-1/3 w-12 h-12 bg-gradient-to-br from-green-400/10 to-emerald-500/10 rounded-full blur-xl"
           />
         </div>
         
         <div className="container mx-auto relative z-10">
           <motion.div
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true, amount: 0.3 }}
             transition={{ duration: 0.8, ease: "easeOut" }}
             className="text-center mb-16"
           >
             <motion.div
               initial={{ scale: 0.8, opacity: 0 }}
               whileInView={{ scale: 1, opacity: 1 }}
               viewport={{ once: true, amount: 0.5 }}
               transition={{ duration: 1, delay: 0.2 }}
               className="inline-block mb-6"
             >
                <Badge className="mb-4 bg-yellow-400/10 text-yellow-400 border-yellow-400/20">
              Our Expert Team
            </Badge>
             </motion.div>
             
             <motion.h2
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, amount: 0.5 }}
               transition={{ duration: 1, delay: 0.4 }}
               className="text-4xl lg:text-5xl font-bold theme-text-light mb-6"
             >
               Elite Educators & Industry Professionals
             </motion.h2>
             
             {/* Animated Underline */}
             <motion.div
               initial={{ width: 0, opacity: 0 }}
               whileInView={{ width: "300px", opacity: 1 }}
               viewport={{ once: true, amount: 0.5 }}
               transition={{ duration: 1.2, delay: 0.6 }}
               className="h-1 bg-gradient-to-r from-yellow-400 to-amber-500 mx-auto rounded-full shadow-lg"
             />
           </motion.div>
                      
           {/* Kavya S Rentachintala - Director of Operations & Marketing Strategy */}
           <motion.div
             initial={{ opacity: 0, y: 50, scale: 0.95 }}
             whileInView={{ opacity: 1, y: 0, scale: 1 }}
             viewport={{ once: true, amount: 0.2, margin: "-100px" }}
             transition={{ 
               duration: 1.2, 
               delay: 0.2,
               ease: "easeOut"
             }}
             className="max-w-6xl mx-auto mb-16 relative"
           >
             {/* Parallax Background Effect */}
             <motion.div
               style={{
                 y: backgroundY,
                 opacity: backgroundOpacity
               }}
               className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 to-amber-500/5 rounded-3xl blur-3xl -z-10"
             />
             
             <div className="grid lg:grid-cols-2 gap-16 items-center">
               {/* Left Side - Enhanced Image with Smart Scrolling */}
               <motion.div 
                 className="flex justify-center"
                 whileInView={{ 
                   rotateY: [15, 0],
                   scale: [0.9, 1]
                 }}
                 viewport={{ once: true, amount: 0.3 }}
                 transition={{ duration: 1.5, delay: 0.3 }}
               >
                 <motion.div 
                   className="relative w-80 h-80 rounded-full overflow-hidden"
                   whileHover={{ 
                     scale: 1.05,
                     rotateY: 5,
                     boxShadow: "0 25px 50px -12px rgba(251, 191, 36, 0.25)"
                   }}
                   transition={{ duration: 0.3 }}
                 >
                   {/* Floating Elements Around Image */}
                   <motion.div
                     animate={{ 
                       y: [0, -20, 0],
                       rotate: [0, 360, 0]
                     }}
                     transition={{ 
                       duration: 8, 
                       repeat: Infinity, 
                       ease: "easeInOut",
                       y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
                     }}
                     className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full shadow-lg z-10"
                   />
                   <motion.div
                     animate={{ 
                       y: [0, 15, 0],
                       rotate: [0, -360, 0]
                     }}
                     transition={{ 
                       duration: 10, 
                       repeat: Infinity, 
                       ease: "easeInOut",
                       y: { duration: 7, repeat: Infinity, ease: "easeInOut" }
                     }}
                     className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full shadow-lg z-10"
                   />
                   
                   <Image
                     src="/kavya.png"
                     alt="Kavya S Rentachintala - Director of Operations & Marketing Strategy"
                     width={320}
                     height={320}
                     className="w-full h-full object-cover"
                   />
                   
                   {/* Hover Overlay */}
                   <motion.div
                     initial={{ opacity: 0 }}
                     whileHover={{ opacity: 1 }}
                     className="absolute inset-0 bg-gradient-to-t from-[#1a2236]/80 via-transparent to-transparent flex items-end justify-center pb-8"
                   >
                     <motion.div
                       initial={{ y: 20, opacity: 0 }}
                       whileHover={{ y: 0, opacity: 1 }}
                       transition={{ duration: 0.3 }}
                       className="text-center"
                     >
                       <p className="text-white font-semibold text-lg">Kavya S Rentachintala</p>
                       <p className="text-yellow-300 text-sm">Director of Operations & Marketing Strategy</p>
                     </motion.div>
                   </motion.div>
                 </motion.div>
               </motion.div>
               
               {/* Right Side - Enhanced Details with Smart Scrolling */}
               <motion.div 
                 className="space-y-8"
                 initial={{ opacity: 0, x: 30 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true, amount: 0.3 }}
                 transition={{ duration: 1, delay: 0.5 }}
               >
                 <motion.div
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true, amount: 0.5 }}
                   transition={{ duration: 0.8, delay: 0.7 }}
                 >
                   <motion.h4 
                     className="text-3xl lg:text-4xl font-bold theme-text-light mb-3"
                     whileInView={{ 
                       backgroundPosition: ["0% 50%", "100% 50%"],
                       backgroundSize: ["200% 200%", "200% 200%"]
                     }}
                     viewport={{ once: true, amount: 0.5 }}
                     transition={{ duration: 2, delay: 0.8 }}
                     style={{
                       background: "linear-gradient(90deg, #fbbf24, #f59e0b, #d97706, #fbbf24)",
                       backgroundSize: "200% 200%",
                       backgroundClip: "text",
                       WebkitBackgroundClip: "text",
                       WebkitTextFillColor: "transparent"
                     }}
                   >
                     Kavya S Rentachintala
                   </motion.h4>
                   
                   <motion.p 
                     className="text-xl text-yellow-400 font-semibold mb-6"
                     initial={{ opacity: 0, y: 20 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true, amount: 0.5 }}
                     transition={{ duration: 0.8, delay: 0.9 }}
                   >
                     Director of Operations & Marketing Strategy
                   </motion.p>
                 </motion.div>
                 
                 <motion.div 
                   className="space-y-6"
                   initial={{ opacity: 0, y: 30 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true, amount: 0.3 }}
                   transition={{ duration: 1, delay: 1.0 }}
                 >
                   {/* Experience Description with Staggered Animation */}
                   <motion.div
                     initial={{ opacity: 0, y: 20 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true, amount: 0.5 }}
                     transition={{ duration: 0.8, delay: 1.1 }}
                     className="space-y-4"
                   >
                     <motion.p 
                       className="text-lg theme-text-muted leading-relaxed"
                       initial={{ opacity: 0, y: 20 }}
                       whileInView={{ opacity: 1, y: 0 }}
                       viewport={{ once: true, amount: 0.5 }}
                       transition={{ duration: 0.8, delay: 1.2 }}
                     >
                       As a Silicon Engineer in a day and a super mom for two ambitious kids in the evening, Kavya is driving the Marketing and Operations activities including the day-to-day operations.
                     </motion.p>
                     
                     <motion.p 
                       className="text-lg theme-text-muted leading-relaxed"
                       initial={{ opacity: 0, y: 20 }}
                       whileInView={{ opacity: 1, y: 0 }}
                       viewport={{ once: true, amount: 0.5 }}
                       transition={{ duration: 0.8, delay: 1.3 }}
                     >
                       Leveraging her creativity, acumen and AI skills, she rose to be the prime contact for scheduling our events, webinars and yearly seminars with local organizations. She also handles &quot;on-the-board&quot; intitation meetings with potential parents/students to customize services based on student&apos;s profiles. As bearing the marketing hat, she creates lively flyers, digital content, drive ads and social campaigns for ACHARYA.
                     </motion.p>
                   </motion.div>
                 </motion.div>
               </motion.div>
             </div>
             
             {/* Decorative Bottom Line */}
             <motion.div
               initial={{ width: 0, opacity: 0 }}
               whileInView={{ width: "100%", opacity: 1 }}
               viewport={{ once: true, amount: 0.5 }}
               transition={{ duration: 1.5, delay: 1.5 }}
               className="h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent mt-12"
             />
           </motion.div>
          {/* <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Calculator,
                title: "Mathematics Experts",
                description: "Advanced mathematics specialists from calculus to competitive math",
                expertise: [
                  "Calculus & Advanced Math",
                  "Competition Mathematics", 
                  "Statistical Analysis",
                  "Applied Mathematics",
                ],
                color: "from-blue-500 to-blue-600",
              },
              {
                icon: Atom,
                title: "Sciences Faculty",
                description: "Ph.D. holders in Physics, Chemistry, and Biology with research experience",
                expertise: [
                  "Quantum Physics",
                  "Organic Chemistry",
                  "Molecular Biology", 
                  "Research Methods",
                ],
                color: "from-purple-500 to-purple-600",
              },
              {
                icon: GraduationCap,
                title: "Pre-Med Specialists",
                description: "Medical school preparation experts with healthcare industry background",
                expertise: [
                  "MCAT Preparation",
                  "Medical School Admissions",
                  "Healthcare Research",
                  "Clinical Experience",
                ],
                color: "from-green-500 to-green-600",
              },
              {
                icon: BookOpen,
                title: "Humanities & Law",
                description: "Liberal arts and legal education professionals with advanced degrees",
                expertise: [
                  "Legal Writing",
                  "Critical Analysis",
                  "Research Skills",
                  "Academic Writing",
                ],
                color: "from-red-500 to-red-600",
              },
            ].map((area, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 group border-2 hover:border-yellow-400/20 bg-gradient-to-br from-[#1a2236]/90 to-[#1a2236]/80 backdrop-blur-xl border-yellow-400/10">
                  <CardHeader className="text-center">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${area.color} flex items-center justify-center mx-auto mb-4`}
                    >
                      <area.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-lg theme-text-light">{area.title}</CardTitle>
                    <CardDescription className="text-sm theme-text-muted">
                      {area.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm font-medium theme-text-light mb-2">
                        Areas of Expertise:
                      </p>
                      {area.expertise.map((skill, i) => (
                        <div
                          key={i}
                          className="flex items-center text-sm theme-text-muted"
                        >
                          <Star className="h-3 w-3 text-yellow-400 mr-2 flex-shrink-0" />
                          {skill}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div> */}
        </div>
      </section>

      {/* Faculty Section */}
      <section className="py-20 theme-bg-dark relative overflow-hidden">
        {/* Smart Scrolling Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ 
              y: [0, -100, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity, 
              ease: "linear",
              y: { duration: 15, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-amber-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ 
              y: [0, 80, 0],
              rotate: [0, -8, 0]
            }}
            transition={{ 
              duration: 25, 
              repeat: Infinity, 
              ease: "linear",
              y: { duration: 18, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute bottom-20 right-10 w-24 h-24 bg-gradient-to-br from-blue-400/15 to-purple-500/15 rounded-full blur-2xl"
          />
          <motion.div
            animate={{ 
              y: [0, -60, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 30, 
              repeat: Infinity, 
              ease: "linear",
              y: { duration: 22, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-br from-green-400/10 to-emerald-500/10 rounded-full blur-xl"
          />
        </div>
        
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="inline-block mb-6"
            >
              <Badge className="mb-4 bg-yellow-400/10 text-yellow-400 border-yellow-400/20">
              Our Distinguished Mentors
            </Badge>
            </motion.div>
            
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="text-4xl lg:text-5xl font-bold theme-text-light mb-6"
            >
              Meet Our Distinguished Mentors
            </motion.h3>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="text-lg theme-text-muted max-w-3xl mx-auto"
            >
              Our mentors bring diverse expertise from top institutions, combining academic excellence with real-world experience
            </motion.p>
            
            {/* Animated Underline */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              whileInView={{ width: "300px", opacity: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 1.2, delay: 0.8 }}
              className="h-1 bg-gradient-to-r from-yellow-400 to-amber-500 mx-auto rounded-full shadow-lg mt-6"
            />
          </motion.div>
          
          {/* Individual Mentor Sections - Enhanced with Smart Scrolling */}
          {faculty.map((member, index) => (
            <motion.div
              key={`detailed-${index}`}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2, margin: "-100px" }}
              transition={{ 
                duration: 1.2, 
                delay: index * 0.2,
                ease: "easeOut"
              }}
              className="max-w-6xl mx-auto mb-24 relative"
            >
              {/* Parallax Background Effect */}
              <motion.div
                style={{
                  y: backgroundY,
                  opacity: backgroundOpacity
                }}
                className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 to-amber-500/5 rounded-3xl blur-3xl -z-10"
              />
              
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                {/* Left Side - Enhanced Image with Smart Scrolling */}
                <motion.div 
                  className="flex justify-center"
                  whileInView={{ 
                    rotateY: [15, 0],
                    scale: [0.9, 1]
                  }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 1.5, delay: 0.3 }}
                >
                  <motion.div 
                    className="relative w-80 h-80 rounded-full overflow-hidden"
                    whileHover={{ 
                      scale: 1.05,
                      rotateY: 5,
                      boxShadow: "0 25px 50px -12px rgba(251, 191, 36, 0.25)"
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Floating Elements Around Image */}
                    <motion.div
                      animate={{ 
                        y: [0, -20, 0],
                        rotate: [0, 360, 0]
                      }}
                      transition={{ 
                        duration: 8, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
                      }}
                      className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full shadow-lg z-10"
                    />
                    <motion.div
                      animate={{ 
                        y: [0, 15, 0],
                        rotate: [0, -360, 0]
                      }}
                      transition={{ 
                        duration: 10, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        y: { duration: 7, repeat: Infinity, ease: "easeInOut" }
                      }}
                      className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full shadow-lg z-10"
                    />
                    
                    <Image
                      src={member.image}
                      alt={`${member.name} - ${member.role}`}
                      width={320}
                      height={320}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Hover Overlay */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="absolute inset-0 bg-gradient-to-t from-[#1a2236]/80 via-transparent to-transparent flex items-end justify-center pb-8"
                    >
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        whileHover={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="text-center"
                      >
                        <p className="text-white font-semibold text-lg">{member.name}</p>
                        <p className="text-yellow-300 text-sm">{member.role}</p>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </motion.div>
                
                {/* Right Side - Enhanced Details with Smart Scrolling */}
                <motion.div 
                  className="space-y-8"
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 1, delay: 0.5 }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                  >
                    <motion.h4 
                      className="text-3xl lg:text-4xl font-bold theme-text-light mb-3"
                      whileInView={{ 
                        backgroundPosition: ["0% 50%", "100% 50%"],
                        backgroundSize: ["200% 200%", "200% 200%"]
                      }}
                      viewport={{ once: true, amount: 0.5 }}
                      transition={{ duration: 2, delay: 0.8 }}
                      style={{
                        background: "linear-gradient(90deg, #fbbf24, #f59e0b, #d97706, #fbbf24)",
                        backgroundSize: "200% 200%",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent"
                      }}
                    >
                      {member.name}
                    </motion.h4>
                    
                    <motion.p 
                      className="text-xl text-yellow-400 font-semibold mb-6"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.5 }}
                      transition={{ duration: 0.8, delay: 0.9 }}
                    >
                      {member.role}
                    </motion.p>
                  </motion.div>
                  
                  <motion.div 
                    className="space-y-6"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 1, delay: 1.0 }}
                  >
                    {/* Education Box with Enhanced Animation */}
                    <motion.div 
                      className="bg-gradient-to-r from-yellow-400/10 to-amber-500/10 p-6 rounded-xl border border-yellow-400/20 backdrop-blur-sm"
                      whileHover={{ 
                        scale: 1.02,
                        boxShadow: "0 20px 25px -5px rgba(251, 191, 36, 0.1), 0 10px 10px -5px rgba(251, 191, 36, 0.04)"
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.p 
                        className="text-sm font-semibold theme-text-light mb-3"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.6, delay: 1.1 }}
                      >
                        Education & Background
                      </motion.p>
                      <motion.p 
                        className="text-base theme-text-muted mb-2"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.6, delay: 1.2 }}
                      >
                        {member.education}
                      </motion.p>
                      <motion.p 
                        className="text-base text-yellow-400 font-medium"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.6, delay: 1.3 }}
                      >
                        {member.institution}
                      </motion.p>
                    </motion.div>
                    
                    {/* Experience Description with Staggered Animation */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.5 }}
                      transition={{ duration: 0.8, delay: 1.4 }}
                      className="space-y-4"
                    >
                      <motion.p 
                        className="text-lg theme-text-muted leading-relaxed"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.8, delay: 1.5 }}
                      >
                        {member.name} brings extensive experience in {member.experience.toLowerCase()}, specializing in {member.specialties.slice(0, 2).join(" and ")}. With a strong academic foundation from {member.institution}, they have developed expertise in {member.specialties.slice(2).join(", ")}.
                      </motion.p>
                      
                      <motion.p 
                        className="text-lg theme-text-muted leading-relaxed"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.8, delay: 1.6 }}
                      >
                        Their key achievements include being a {member.achievements[0].toLowerCase()}, {member.achievements[1].toLowerCase()}, and {member.achievements[2].toLowerCase()}. They are committed to {member.achievements[3].toLowerCase()} and helping students achieve their academic goals.
                      </motion.p>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </div>
              
              {/* Decorative Bottom Line */}
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                whileInView={{ width: "100%", opacity: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 1.5, delay: 1.8 }}
                className="h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent mt-12"
              />
            </motion.div>
          ))}
        </div>
      </section>


      
      <Chatbot />
      <Footer />
    </main>
  );
}
