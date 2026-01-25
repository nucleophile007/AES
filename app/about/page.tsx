"use client";

import React from 'react';
import { motion } from "framer-motion";
import Image from "next/image";
import useSWR from "swr";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Users, BookOpen, Target, Trophy, Linkedin, Globe, Mail, GraduationCap, Star, Calculator, Atom } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import Chatbot from "@/components/home/Chatbot";
import { useScroll, useTransform } from "framer-motion";
import { MentorGridSkeleton } from "@/components/ui/MentorSkeleton";

// Faculty data fetched from API now

const webTeam = [
  {
    name: "Luv Shanker",
    role: "Full Stack Web Developer",
    education: "B.Tech from IIT Dharwad (Final Year)",
    institution: "Indian Institute of Technology Dharwad, India",
    experience: "Web Development & Software Engineering",
    specialties: ["Full Stack Development", "React & Next.js", "Backend Development", "UI/UX Design"],
    achievements: ["2+ years web development experience", "Modern web technologies expert", "Full stack proficiency", "IIT Dharwad student"],
    bio: "Final year student at IIT Dharwad with over 2 years of hands-on experience in web development. Specializes in building scalable web applications using modern technologies and frameworks.",
    image: "/luv.png",
  },
  {
    name: "Deepak Kumar Singh",
    role: "Full Stack Web Developer",
    education: "B.Tech from IIT Dharwad (Final Year)",
    institution: "Indian Institute of Technology Dharwad, India",
    experience: "Web Development & Software Engineering",
    specialties: ["Full Stack Development", "Frontend Technologies", "Database Management", "API Development"],
    achievements: ["2+ years web development experience", "Problem-solving expertise", "Collaborative development", "IIT Dharwad student"],
    bio: "Final year student at IIT Dharwad with 2+ years of professional web development experience. Passionate about creating efficient, user-friendly web solutions and working with cutting-edge technologies.",
    image: "/deepak.png",
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

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AboutPage() {
  const { scrollYProgress } = useScroll();
  const [selectedCategory, setSelectedCategory] = React.useState<string>("engg-ai");

  // Use SWR for caching and stale-while-revalidate
  const { data, error, isLoading } = useSWR('/api/mentors', fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: true,
    dedupingInterval: 60000, // 1 minute deduplication
  });

  const mentors = data?.mentors || [];

  // Create transform values at the top level to avoid hooks in callbacks
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const backgroundOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.6, 0.3]);

  // Mentor categories (removed "All Mentors" option)
  const categories = [
    {
      id: "engg-ai",
      label: "Engg & AI",
      mentors: mentors.filter(m => m.department === "engg-ai")
    },
    {
      id: "premed-bio-chem",
      label: "Pre-Med, BIO & CHEM",
      mentors: mentors.filter(m => m.department === "premed-bio-chem")
    },
    {
      id: "law-humanities",
      label: "Law, Humanities & Social Sciences",
      mentors: mentors.filter(m => m.department === "law-humanities")
    },
    {
      id: "associate",
      label: "Associate Mentors",
      mentors: mentors.filter(m => m.department === "associate")
    }
  ];

  const filteredFaculty = categories.find(cat => cat.id === selectedCategory)?.mentors || [];

  return (
    <main className="min-h-screen theme-bg-dark flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="theme-bg-dark py-4 lg:py-6 relative overflow-hidden">
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
                      <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>

                    <filter id="mediumGlow" x="-40%" y="-40%" width="180%" height="180%">
                      <feGaussianBlur stdDeviation="5" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>

                    <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>

                    {/* Pulsing Glow Filter */}
                    <filter id="pulsingGlow" x="-60%" y="-60%" width="220%" height="220%">
                      <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                      <animate attributeName="stdDeviation" values="6;12;6" dur="2s" repeatCount="indefinite" />
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
                  <rect x="110" y="120" width="80" height="50" rx="6" fill="url(#screenGradient)" stroke="#FCD34D" strokeWidth="3" filter="url(#mediumGlow)" />
                  <rect x="115" y="125" width="70" height="35" rx="2" fill="#0F172A" filter="url(#softGlow)" />

                  {/* Screen Content Lines with Individual Glows */}
                  <rect x="120" y="130" width="30" height="2" fill="#FCD34D" opacity="0.9" filter="url(#softGlow)" />
                  <rect x="120" y="135" width="45" height="2" fill="#60A5FA" opacity="0.8" filter="url(#softGlow)" />
                  <rect x="120" y="140" width="35" height="2" fill="#34D399" opacity="0.8" filter="url(#softGlow)" />
                  <rect x="120" y="145" width="50" height="2" fill="#A78BFA" opacity="0.8" filter="url(#softGlow)" />
                  <rect x="120" y="150" width="25" height="2" fill="#F87171" opacity="0.8" filter="url(#softGlow)" />

                  {/* Laptop Base with Glow */}
                  <rect x="105" y="170" width="90" height="8" rx="4" fill="#374151" filter="url(#softGlow)" />

                  {/* Floating Knowledge Elements with Enhanced Effects */}

                  {/* Mathematics Symbol with Strong Glow */}
                  <g transform="translate(80, 80)" filter="url(#strongGlow)">
                    <circle cx="0" cy="0" r="20" fill="url(#primaryGradient)" opacity="0.3" />
                    <circle cx="0" cy="0" r="15" fill="url(#primaryGradient)" opacity="0.5" />
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
                    <circle cx="0" cy="0" r="18" fill="#3B82F6" opacity="0.4" />
                    <circle cx="0" cy="0" r="12" fill="#60A5FA" opacity="0.3" />
                    <circle cx="0" cy="0" r="4" fill="#93C5FD" />
                    <ellipse cx="0" cy="0" rx="15" ry="6" fill="none" stroke="#60A5FA" strokeWidth="2" />
                    <ellipse cx="0" cy="0" rx="6" ry="15" fill="none" stroke="#93C5FD" strokeWidth="1.5" />
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
                    <circle cx="0" cy="-5" r="16" fill="url(#primaryGradient)" opacity="0.9" />
                    <circle cx="0" cy="-5" r="12" fill="#FCD34D" opacity="0.8" />
                    <rect x="-5" y="7" width="10" height="8" rx="3" fill="#6B7280" />
                    <path d="M-10 -8 Q0 -18 10 -8" stroke="#FEF3C7" strokeWidth="2" fill="none" opacity="0.9" />
                    <path d="M-6 -12 Q0 -16 6 -12" stroke="#FCD34D" strokeWidth="1.5" fill="none" opacity="0.8" />
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
                    <ellipse cx="0" cy="0" rx="18" ry="5" fill="#1F2937" />
                    <rect x="-18" y="-5" width="36" height="3" rx="1.5" fill="#374151" />
                    <circle cx="15" cy="-3" r="3" fill="#FCD34D" />
                    <line x1="15" y1="-3" x2="22" y2="-10" stroke="#F59E0B" strokeWidth="2" />
                    <circle cx="0" cy="-8" r="12" fill="none" stroke="#FCD34D" strokeWidth="1" opacity="0.3" />
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
                    <rect x="0" y="0" width="28" height="5" rx="2.5" fill="#F87171" />
                    <rect x="0" y="-7" width="28" height="5" rx="2.5" fill="#34D399" />
                    <rect x="0" y="-14" width="28" height="5" rx="2.5" fill="#A78BFA" />
                    <rect x="0" y="-21" width="28" height="5" rx="2.5" fill="#60A5FA" />
                  </g>

                  {/* Trophy with Strong Glow */}
                  <g transform="translate(240, 150)" filter="url(#strongGlow)">
                    <path d="M-10 0 Q-10 -10 0 -10 Q10 -10 10 0 Q10 5 5 7 L5 10 L-5 10 L-5 7 Q-10 5 -10 0" fill="url(#primaryGradient)" />
                    <rect x="-8" y="10" width="16" height="5" rx="2.5" fill="#6B7280" />
                    <circle cx="-15" cy="-2" r="4" fill="none" stroke="#FCD34D" strokeWidth="2" />
                    <circle cx="15" cy="-2" r="4" fill="none" stroke="#FCD34D" strokeWidth="2" />
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
                    <animate attributeName="stroke-dashoffset" values="0;8;0" dur="2s" repeatCount="indefinite" />
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
                    <animate attributeName="stroke-dashoffset" values="0;8;0" dur="2.5s" repeatCount="indefinite" />
                  </path>

                  {/* Success Indicator with Glow */}
                  <g transform="translate(150, 200)" filter="url(#mediumGlow)">
                    <circle cx="0" cy="0" r="10" fill="#34D399" opacity="0.3" />
                    <path d="M-4 0 L-1 3 L4 -3" stroke="#10B981" strokeWidth="3" fill="none" strokeLinecap="round" />
                  </g>

                  {/* Enhanced Floating Particles with Strong Glows */}
                  <circle cx="70" cy="180" r="3" fill="#FCD34D" opacity="0.8" filter="url(#strongGlow)">
                    <animate attributeName="cy" values="180;170;180" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="230" cy="130" r="2.5" fill="#34D399" opacity="0.9" filter="url(#mediumGlow)">
                    <animate attributeName="cy" values="130;120;130" dur="2.8s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.9;0.3;0.9" dur="2.8s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="180" cy="250" r="3" fill="#A78BFA" opacity="0.7" filter="url(#strongGlow)">
                    <animate attributeName="cy" values="250;240;250" dur="3.2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.7;0.2;0.7" dur="3.2s" repeatCount="indefinite" />
                  </circle>

                  {/* Additional Sparkling Effects */}
                  <circle cx="50" cy="100" r="2" fill="#F59E0B" opacity="0.6" filter="url(#mediumGlow)">
                    <animate attributeName="r" values="2;4;2" dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.6;0.1;0.6" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="250" cy="250" r="2" fill="#60A5FA" opacity="0.7" filter="url(#mediumGlow)">
                    <animate attributeName="r" values="2;5;2" dur="2.2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.7;0.1;0.7" dur="2.2s" repeatCount="indefinite" />
                  </circle>

                </svg>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Elite Educators Section */}
      <section className="theme-bg-dark relative overflow-hidden">
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
      <section className="py-12 theme-bg-dark relative overflow-hidden -mt-16">
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
              <Badge className="bg-yellow-400/10 text-yellow-400 border-yellow-400/30 px-5 py-2 text-sm font-medium">
                Our Expert Team
              </Badge>
            </motion.div>

            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="text-4xl lg:text-5xl font-bold text-white mb-6"
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
              whileInView={{ width: "100px", opacity: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 1.2, delay: 0.8 }}
              className="h-1 bg-yellow-400 mx-auto mt-6"
            />
          </motion.div>

          {/* Filter Section - 4 Categories Only */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-7xl mx-auto px-4 mb-12"
          >
            <div className="flex flex-wrap justify-center items-center gap-3">
              {categories.map((category) => (
                <motion.button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${selectedCategory === category.id
                    ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-900 shadow-lg shadow-yellow-400/30"
                    : "bg-slate-800/60 text-slate-300 border border-slate-700/50 hover:border-yellow-400/50 hover:text-yellow-400"
                    }`}
                >
                  {category.label}
                  <span className="ml-2 text-xs opacity-75">
                    ({category.mentors.length})
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Individual Mentor Sections - Separated Tiles Design */}
          {isLoading ? (
            <MentorGridSkeleton count={3} />
          ) : (
            <div className="space-y-8 max-w-7xl mx-auto px-4">
              {filteredFaculty.map((member, index) => (
                <motion.div
                  key={`detailed-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.05,
                    ease: "easeOut"
                  }}
                  className="group"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Left Tile - Image Section (Separated) */}
                    <motion.div
                      className="md:w-80 flex-shrink-0"
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="relative p-[1px] rounded-2xl bg-gradient-to-br from-yellow-400/50 via-amber-500/50 to-yellow-600/50 h-full">
                        <div className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-2xl p-8 h-full flex flex-col items-center justify-center relative overflow-hidden">
                          {/* Animated background orbs */}
                          <motion.div
                            className="absolute top-0 right-0 w-40 h-40 bg-yellow-400/20 rounded-full blur-3xl"
                            animate={{
                              scale: [1, 1.3, 1],
                              opacity: [0.2, 0.4, 0.2],
                            }}
                            transition={{
                              duration: 5,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                          <motion.div
                            className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/15 rounded-full blur-2xl"
                            animate={{
                              scale: [1.2, 1, 1.2],
                              opacity: [0.15, 0.3, 0.15],
                            }}
                            transition={{
                              duration: 4,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: 1
                            }}
                          />

                          <div className="relative z-10 text-center">
                            {/* High Quality Image */}
                            <motion.div
                              className="relative w-48 h-48 mx-auto mb-6 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-yellow-400/40 group-hover:ring-yellow-400/70 transition-all duration-300"
                              whileHover={{ scale: 1.05 }}
                              transition={{ duration: 0.3 }}
                            >
                              <Image
                                src={member.image}
                                alt={`${member.name}`}
                                width={256}
                                height={256}
                                quality={100}
                                priority={index < 2}
                                className="w-full h-full object-cover object-top"
                                style={{ objectPosition: 'center top' }}
                              />
                              {/* Gradient overlay on hover */}
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </motion.div>

                            {/* Name in Image Tile */}
                            <div className="space-y-2">
                              <h4 className="text-2xl font-bold bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
                                {member.name}
                              </h4>
                              <p className="text-base text-slate-300 font-medium">
                                {member.role}
                              </p>
                              {member.workplace && (
                                <p className="text-sm text-yellow-400/80 font-normal italic">
                                  {member.workplace}
                                </p>
                              )}
                            </div>

                            {/* Decorative bottom accent */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent"></div>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Right Tile - Content Section (Separated) */}
                    <motion.div
                      className="flex-1"
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="relative p-[1px] rounded-2xl bg-gradient-to-br from-yellow-400/50 via-amber-500/50 to-yellow-600/50 h-full">
                        <div className="bg-gradient-to-br from-slate-800 via-slate-800/95 to-slate-900 rounded-2xl p-8 md:p-10 h-full">
                          <div className="space-y-7">
                            {/* Education */}
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 }}
                              className="group/item"
                            >
                              <div className="flex items-start gap-4 mb-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400/25 to-amber-500/25 flex items-center justify-center flex-shrink-0 group-hover/item:scale-110 transition-transform duration-300 shadow-lg">
                                  <GraduationCap className="w-6 h-6 text-yellow-400" />
                                </div>
                                <div className="flex-1">
                                  <h5 className="text-sm font-bold text-yellow-400 uppercase tracking-wider mb-3">Education</h5>
                                  <p className="text-lg text-white font-semibold leading-snug mb-2">
                                    {member.education}
                                  </p>
                                  <p className="text-sm text-yellow-400/90 font-medium">
                                    {member.institution}
                                  </p>
                                </div>
                              </div>
                            </motion.div>

                            {/* Divider */}
                            <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>

                            {/* About */}
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.2 }}
                              className="group/item"
                            >
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400/25 to-amber-500/25 flex items-center justify-center flex-shrink-0 group-hover/item:scale-110 transition-transform duration-300 shadow-lg">
                                  <BookOpen className="w-6 h-6 text-yellow-400" />
                                </div>
                                <div className="flex-1">
                                  <h5 className="text-sm font-bold text-yellow-400 uppercase tracking-wider mb-3">About</h5>
                                  <p className="text-base text-slate-300 leading-relaxed">
                                    {member.bio || `${member.name} brings extensive experience in ${member.experience.toLowerCase()}, specializing in ${member.specialties?.slice(0, 2).join(" and ") || "their field"}.`}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Kavya S Rentachintala - Director of Operations & Marketing Strategy */}
      <section className="py-12 theme-bg-dark relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ y: [0, -50, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-yellow-400/10 to-amber-500/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ y: [0, 50, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-20 right-20 w-24 h-24 bg-gradient-to-br from-orange-400/10 to-red-500/10 rounded-full blur-2xl"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-yellow-400/10 text-yellow-400 border-yellow-400/30 px-5 py-2 text-sm font-medium">
              Leadership Team
            </Badge>
            <h3 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Meet Our Director
            </h3>
            <div className="h-1 w-24 bg-yellow-400 mx-auto"></div>
          </motion.div>

          {/* Kavya Card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-5xl mx-auto"
          >
            <div className="grid lg:grid-cols-[300px_1fr] gap-8 bg-[#1a2236]/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-yellow-400/10 hover:border-yellow-400/30 transition-all duration-300">
              {/* Image Section */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="relative h-[400px] lg:h-auto overflow-hidden bg-gradient-to-br from-yellow-500/10 to-orange-500/10 flex items-center justify-center p-8"
              >
                <div className="relative w-56 h-56 rounded-full overflow-hidden border-4 border-yellow-400/20 shadow-2xl">
                  <Image
                    src="/kavya.png"
                    alt="Kavya S Rentachintala"
                    fill
                    className="object-cover object-center"
                    quality={95}
                  />
                </div>
              </motion.div>

              {/* Content Section */}
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <h4 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                    Kavya S Rentachintala
                  </h4>
                  <p className="text-yellow-400 font-semibold text-xl mb-6">
                    Director of Operations & Marketing Strategy
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="space-y-4"
                >
                  <p className="text-base theme-text-muted leading-relaxed">
                    As a Silicon Engineer in a day and a super mom for two ambitious kids in the evening, Kavya is driving the Marketing and Operations activities including the day-to-day operations.
                  </p>

                  <p className="text-base theme-text-muted leading-relaxed">
                    Leveraging her creativity, acumen and AI skills, she rose to be the prime contact for scheduling our events, webinars and yearly seminars with local organizations. She also handles "on-the-board" intitation meetings with potential parents/students to customize services based on student's profiles. As bearing the marketing hat, she creates lively flyers, digital content, drive ads and social campaigns for ACHARYA.
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Web Team Section */}
      <section className="py-12 theme-bg-dark relative overflow-hidden">
        {/* Background Elements */}
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
            className="absolute top-16 left-16 w-28 h-28 bg-gradient-to-br from-blue-400/20 to-cyan-500/20 rounded-full blur-3xl"
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
            className="absolute bottom-16 right-16 w-20 h-20 bg-gradient-to-br from-purple-400/15 to-pink-500/15 rounded-full blur-2xl"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-blue-400/10 text-blue-400 border-blue-400/30 px-5 py-2 text-sm font-medium">
              Web Development Team
            </Badge>
            <h3 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Our Web Team
            </h3>
            <div className="h-1 w-24 bg-blue-400 mx-auto"></div>
          </motion.div>

          {/* Web Team Members - Side by Side */}
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-6">
            {webTeam.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="group"
              >
                <div className="grid grid-cols-[200px_1fr] gap-4 bg-[#1a2236]/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-blue-400/10 hover:border-blue-400/30 transition-all duration-300 h-full">
                  {/* Image Tile */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                    className="relative h-full min-h-[300px] overflow-hidden bg-gradient-to-br from-blue-500/10 to-purple-500/10"
                  >
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className={`object-cover ${member.name === "Deepak Kumar Singh" ? "object-[center_15%] scale-110" : "object-center"}`}
                      quality={90}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a2236] via-transparent to-transparent opacity-60"></div>
                  </motion.div>

                  {/* Content Tile */}
                  <div className="p-6 flex flex-col justify-center">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.2 + 0.2 }}
                    >
                      <h4 className="text-xl lg:text-2xl font-bold text-white mb-2">
                        {member.name}
                      </h4>
                      <p className="text-blue-400 font-semibold text-base mb-4">
                        {member.role}
                      </p>
                    </motion.div>

                    {/* Education */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.2 + 0.4 }}
                      className="mb-4"
                    >
                      <div className="flex items-start gap-2">
                        <GraduationCap className="h-4 w-4 text-blue-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-white font-semibold text-sm">{member.education}</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Bio */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.2 + 0.6 }}
                      className="mb-4"
                    >
                      <p className="text-sm theme-text-muted leading-relaxed">
                        {member.bio}
                      </p>
                    </motion.div>

                    {/* Specialties */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.2 + 0.8 }}
                    >
                      <div className="flex flex-wrap gap-2">
                        {member.specialties.map((specialty, idx) => (
                          <Badge
                            key={idx}
                            className="bg-blue-400/10 text-blue-400 border-blue-400/30 hover:bg-blue-400/20 transition-colors text-xs"
                          >
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      <Chatbot />
      <Footer />
    </main>
  );
}
