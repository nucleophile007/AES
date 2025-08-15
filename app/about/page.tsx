"use client";

import React from 'react';
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Users, BookOpen, Target, Trophy, Linkedin, Globe, Mail, GraduationCap, Star, Calculator, Atom } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import Chatbot from "@/components/home/Chatbot";

const faculty = [
  {
    name: "Dr. Rajesh Acharya",
    role: "Founder & Lead Mathematics Educator",
    education: "Ph.D. in Applied Mathematics",
    institution: "IIT Delhi Alumni",
    experience: "15+ years",
    specialties: ["Advanced Calculus", "Linear Algebra", "Competition Math", "AP Mathematics"],
    achievements: ["500+ students mentored", "98% improvement rate", "Research publications"],
    image: "/placeholder.svg",
  },
  {
    name: "Dr. Priya Sharma",
    role: "Head of Sciences Department",
    education: "Ph.D. in Biochemistry",
    institution: "University Faculty",
    experience: "12+ years",
    specialties: ["AP Chemistry", "Organic Chemistry", "Biology", "Pre-Med Prep"],
    achievements: ["Medical school guidance", "Research mentor", "Lab experience"],
    image: "/placeholder.svg",
  },
  {
    name: "Prof. Ankit Gupta",
    role: "Physics & Engineering Specialist",
    education: "M.Tech in Engineering Physics",
    institution: "IIT Bombay Alumni",
    experience: "10+ years",
    specialties: ["AP Physics C", "Mechanics", "Electromagnetism", "Engineering Prep"],
    achievements: ["Industry experience", "Patent holder", "Competition coach"],
    image: "/placeholder.svg",
  },
  {
    name: "Dr. Meera Patel",
    role: "SAT & Test Prep Expert",
    education: "Ph.D. in Education",
    institution: "Stanford University",
    experience: "8+ years",
    specialties: ["SAT Math", "SAT Reading", "Test Strategies", "College Prep"],
    achievements: ["1500+ average score improvement", "College counselor", "Admissions expert"],
    image: "/placeholder.svg",
  },
  {
    name: "Prof. Vikram Singh",
    role: "Research Programs Director",
    education: "Ph.D. in Computer Science",
    institution: "IIT Kanpur Alumni",
    experience: "14+ years",
    specialties: ["Research Methodology", "Data Analysis", "Programming", "Project Mentoring"],
    achievements: ["Published researcher", "Startup founder", "Innovation mentor"],
    image: "/placeholder.svg",
  },
  {
    name: "Dr. Kavita Reddy",
    role: "Humanities & Law Coordinator",
    education: "Ph.D. in English Literature",
    institution: "University Faculty",
    experience: "11+ years",
    specialties: ["Academic Writing", "Critical Analysis", "Law Prep", "Liberal Arts"],
    achievements: ["Writing coach", "Publication editor", "Legal education expert"],
    image: "/placeholder.svg",
  },
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
                  About AcharyaES
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



      {/* Elite Educators Section */}
      <section className="py-20 theme-bg-dark">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-yellow-400/10 text-yellow-400 border-yellow-400/20">
              Our Expert Team
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold theme-text-light mb-6">
              Elite Educators & Industry Professionals
            </h2>
            <p className="text-xl theme-text-muted max-w-4xl mx-auto">
              Our team comprises IIT alumni, university faculty, and industry
              professionals with Ph.D. degrees, fostering subject mastery and
              research-driven thinking to guide students toward academic
              excellence.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {[
              {
                icon: Users,
                title: "University Faculty",
                description: "Active professors and researchers from top universities bringing cutting-edge knowledge",
              },
              {
                icon: GraduationCap,
                title: "IIT Alumni", 
                description: "Graduates from India's premier engineering institutes with exceptional academic excellence",
              },
              {
                icon: BookOpen,
                title: "Ph.D. Professionals",
                description: "Industry experts with doctoral degrees combining academic rigor with practical experience",
              },
              {
                icon: Star,
                title: "US Graduates",
                description: "Alumni from prestigious US universities including Ivy League and top-tier institutions",
              },
            ].map((credential, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 bg-gradient-to-br from-yellow-400/10 to-amber-500/10 rounded-2xl border border-yellow-400/10"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <credential.icon className="h-8 w-8 text-[#1a2236]" />
                </div>
                <h3 className="text-xl font-semibold mb-2 theme-text-light">
                  {credential.title}
                </h3>
                <p className="theme-text-muted">{credential.description}</p>
              </motion.div>
            ))}
          </div>
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
      <section className="py-20 theme-bg-dark">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-yellow-400/10 text-yellow-400 border-yellow-400/20">
              Our Team
            </Badge>
            <h3 className="text-3xl font-bold theme-text-light mb-4">
              Meet Our Distinguished Faculty
            </h3>
            <p className="text-lg theme-text-muted max-w-3xl mx-auto">
              Our team combines academic excellence from top institutions with practical teaching experience
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {faculty.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 group border-2 hover:border-yellow-400/20 bg-gradient-to-br from-[#1a2236]/90 to-[#1a2236]/80 backdrop-blur-xl border-yellow-400/10">
                  <CardHeader className="text-center pb-4">
                    <Avatar className="w-20 h-20 mx-auto mb-4 border-4 border-yellow-400/20">
                      <AvatarImage src={member.image} />
                      <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-amber-500 text-[#1a2236] text-lg font-bold">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-lg theme-text-light">{member.name}</CardTitle>
                    <CardDescription className="font-medium text-yellow-400">
                      {member.role}
                    </CardDescription>
                    <Badge className="bg-yellow-400/10 text-yellow-400 border-yellow-400/20 text-xs">
                      {member.experience}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="bg-gradient-to-r from-yellow-400/5 to-amber-500/5 p-3 rounded-lg border border-yellow-400/10">
                        <p className="text-sm font-semibold theme-text-light mb-1">
                          Education & Background
                        </p>
                        <p className="text-xs theme-text-muted">{member.education}</p>
                        <p className="text-xs text-yellow-400 font-medium">{member.institution}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold theme-text-light mb-2">Specialties</p>
                        <div className="flex flex-wrap gap-1">
                          {member.specialties.slice(0, 3).map((specialty, i) => (
                            <Badge key={i} variant="secondary" className="text-xs bg-yellow-400/10 text-yellow-400 border-yellow-400/20">
                              {specialty}
                            </Badge>
                          ))}
                          {member.specialties.length > 3 && (
                            <Badge variant="outline" className="text-xs border-yellow-400/20 text-yellow-400">
                              +{member.specialties.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold theme-text-light mb-2">Key Achievements</p>
                        <div className="space-y-1">
                          {member.achievements.map((achievement, i) => (
                            <div key={i} className="flex items-center text-xs theme-text-muted">
                              <Trophy className="h-3 w-3 text-yellow-400 mr-2 flex-shrink-0" />
                              {achievement}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center space-x-3 pt-2">
                      <a href="#" className="p-2 rounded-full border border-yellow-400/20 hover:border-yellow-400 hover:bg-yellow-400/10 transition-all duration-200 group" title="LinkedIn Profile">
                        <Linkedin className="h-4 w-4 text-yellow-400 group-hover:text-yellow-300" />
                      </a>
                      <a href="#" className="p-2 rounded-full border border-yellow-400/20 hover:border-yellow-400 hover:bg-yellow-400/10 transition-all duration-200 group" title="Personal Website">
                        <Globe className="h-4 w-4 text-yellow-400 group-hover:text-yellow-300" />
                      </a>
                      <a href="#" className="p-2 rounded-full border border-yellow-400/20 hover:border-yellow-400 hover:bg-yellow-400/10 transition-all duration-200 group" title="Email Contact">
                        <Mail className="h-4 w-4 text-yellow-400 group-hover:text-yellow-300" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Philosophy Section */}
      <section className="py-20 theme-bg-dark">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 to-amber-500/5 rounded-3xl border border-yellow-400/10"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a2236]/90 to-[#1a2236]/80 backdrop-blur-sm rounded-3xl"></div>
            <div className="relative z-10 text-center p-12 space-y-8">
              <div className="space-y-4">
                <Badge className="mb-4 bg-yellow-400/10 text-yellow-400 border-yellow-400/20">
                  Our Philosophy
                </Badge>
                <h3 className="text-3xl lg:text-4xl font-bold theme-text-light">
                  Our Teaching Philosophy
                </h3>
              </div>
              <div className="max-w-4xl mx-auto space-y-6">
                <blockquote className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent italic">
                  &quot;Every student can learn, just not on the same day, or in the same way.&quot;
                </blockquote>
                <p className="text-lg theme-text-muted leading-relaxed">
                  Our diverse team of educators brings together academic excellence, research experience, and industry insights to create personalized learning experiences that nurture each student&apos;s unique potential and guide them toward future success.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6 mt-12">
                {pillars.map((pillar, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-br from-[#1a2236]/90 to-[#1a2236]/80 backdrop-blur-xl p-6 rounded-2xl border border-yellow-400/10 hover:border-yellow-400/20 transition-all duration-300"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <pillar.icon className="h-6 w-6 text-[#1a2236]" />
                    </div>
                    <h4 className="font-semibold theme-text-light mb-2">
                      {pillar.title}
                    </h4>
                    <p className="text-sm theme-text-muted">{pillar.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      <Chatbot />
      <Footer />
    </main>
  );
}
