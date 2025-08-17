"use client";
import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, Award, Star, Globe, Clock, Target, TrendingUp, Lightbulb, Briefcase, Heart, Zap, Trophy, Brain, Calculator, Atom, Users2, Calendar, FileText, Crown, ArrowRight, FlaskConical, Code } from "lucide-react";
import Link from "next/link";
import Footer from "@/components/home/Footer";
import Chatbot from "@/components/home/Chatbot";
import Header from "@/components/home/Header";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import ProgramGradeCoverage from "./ProgramGradeCoverage";

const competitionTracks = [
  {
    icon: Calculator,
    title: "Math Olympiad Track",
    description: "AMC8, AMC10, AMC12 preparation with advanced problem-solving techniques",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: Atom,
    title: "Physics Olympiad Track",
    description: "F = ma competition preparation with comprehensive physics concepts",
    color: "from-purple-500 to-purple-600",
  },
];

const programFeatures = [
  {
    icon: Users2,
    title: "Cohort-Based Learning",
    description: "Team of 5 students per batch for collaborative problem-solving and peer learning.",
  },
  {
    icon: Brain,
    title: "Cognitive Flexibility",
    description: "Develop adaptability and creative thinking skills from an early age.",
  },
  {
    icon: Clock,
    title: "Time Management",
    description: "Learn to solve complex problems efficiently under time constraints.",
  },
  {
    icon: Target,
    title: "Stress Management",
    description: "Build resilience and perform under pressure in competitive environments.",
  },
  {
    icon: Trophy,
    title: "Competition Readiness",
    description: "Prepare for MATHCOUNTS, BAYAREA Math Olympiad, Stanford Math Tournament, and Berkeley Math Tournament.",
  },
  {
    icon: Star,
    title: "Expert Mentorship",
    description: "Learn from experienced olympiad mentors and subject matter experts.",
  },
];

const competitionPrograms = [
  {
    name: "AMC8",
    timeline: {
      lt: "June - Jan",
      ft: "Sept - Jan"
    },
    grades: "Rising 5 until 8",
    sessions: "8 classes/month",
    assessments: "4 assignments + 1 test",
    fees: {
      lt: "$300/month",
      ft: "$400/student"
    },
    color: "from-green-500 to-green-600",
  },
  {
    name: "AMC 10",
    timeline: {
      lt: "Jan - Oct",
      ft: "June - Oct"
    },
    grades: "Rising 7 until 10",
    sessions: "8 classes/month",
    assessments: "4 assignments + 1 test",
    fees: {
      lt: "$300/month",
      ft: "$400/student"
    },
    color: "from-blue-500 to-blue-600",
  },
  {
    name: "AMC 12",
    timeline: {
      lt: "Jan - Oct",
      ft: "June - Oct"
    },
    grades: "Rising 9 until 12",
    sessions: "8 classes/month",
    assessments: "4 assignments + 1 test",
    fees: {
      lt: "$300/month",
      ft: "$400/student"
    },
    color: "from-purple-500 to-purple-600",
  },
  {
    name: "F=ma",
    timeline: {
      lt: "June - Jan",
      ft: "Sept - Jan"
    },
    grades: "Rising 9 until 12",
    sessions: "8 classes/month",
    assessments: "4 assignments + 1 test",
    fees: {
      lt: "$300/month",
      ft: "$400/student"
    },
    color: "from-orange-500 to-orange-600",
  },
];

const deliverables = [
  {
    icon: BookOpen,
    title: "Core Concepts",
    description: "Master fundamental mathematical and physical principles",
  },
  {
    icon: Zap,
    title: "Quick Count Techniques",
    description: "Learn efficient problem-solving strategies and shortcuts",
  },
  {
    icon: Users,
    title: "Teamwork Environment",
    description: "Develop collaboration skills in competitive settings",
  },
  {
    icon: Clock,
    title: "Time & Stress Management",
    description: "Build resilience and efficiency under pressure",
  },
  {
    icon: Brain,
    title: "Cognitive Flexibility",
    description: "Enhance adaptability and creative thinking abilities",
  },
];

const faqs = [
  {
    question: "What is the AES CHAMPIONS program?",
    answer: "AES CHAMPIONS is a structured, cohort-based program designed to equip students with the skills and strategies to excel in national-level Olympiad competitions including AMC8, AMC10, AMC12 (Math) and F=ma (Physics).",
  },
  {
    question: "Who is this program designed for?",
    answer: "The program is designed for middle and high school students who want to excel in competitive mathematics and physics. We offer different tracks for different grade levels and competition types.",
  },
  {
    question: "What are the different competition tracks?",
    answer: "We offer two main tracks: Math Olympiad Track (AMC8, AMC10, AMC12) and Physics Olympiad Track (F=ma). Each track is tailored to specific competition requirements and student grade levels.",
  },
  {
    question: "How does the cohort-based learning work?",
    answer: "Students work in teams of 5 per batch, fostering collaborative problem-solving, peer learning, and the development of teamwork skills essential for competitive environments.",
  },
  {
    question: "What competitions do you prepare students for?",
    answer: "Beyond AMC competitions, we prepare teams for MATHCOUNTS, BAYAREA Math Olympiad, Stanford Math Tournament, Berkeley Math Tournament, and other prestigious competitions.",
  },
  {
    question: "What are the different enrollment options?",
    answer: "We offer Long Term (LT) and Fast Track (FT) options for each competition. LT provides extended preparation time while FT offers intensive preparation for students with limited time.",
  },
];

export default function AESChampionsPage() {
  return (
    <main className="min-h-screen theme-bg-dark flex flex-col">
      <Header />
      {/* Hero Section */}
      <section
        id="home"
        className="py-16 lg:py-24 theme-bg-dark relative overflow-hidden"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-400 rounded-full opacity-10 animate-float"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-blue-400 rounded-full opacity-10 animate-float-reverse"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-purple-400 rounded-full opacity-10 animate-float"></div>
          <div className="absolute top-1/3 right-1/3 w-8 h-8 bg-green-400 rounded-full opacity-10 animate-float-reverse"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 animate-slide-in-bottom">
            <Badge className="mb-4 bg-yellow-400/10 text-yellow-400 border-yellow-400/20">
              🏆 AES CHAMPIONS
            </Badge>
            <h1 className="text-6xl lg:text-7xl font-black bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent mb-4 animate-slide-in-bottom">
              AES CHAMPIONS
            </h1>
            <h2 className="text-4xl lg:text-5xl font-bold theme-text-light mb-6">
              Olympiad Excellence Program
            </h2>
            <p className="text-lg theme-text-muted max-w-4xl mx-auto animate-slide-in-bottom" style={{ animationDelay: '0.2s' }}>
              A structured, cohort-based program designed to equip students with the skills and strategies to excel in national-level Olympiad competitions. Master AMC8, AMC10, AMC12, and F=ma with expert guidance.
            </p>
          </div>
          
          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="flex justify-center">
              <Link href="/book-session">
                <Button className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#1a2236] hover:from-yellow-300 hover:to-yellow-400 px-6 shadow-lg">
                  <ArrowRight className="mr-2 h-5 w-5" /> Book Free Session
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

             {/* Competition Tracks Section */}
       <section className="py-20 theme-bg-dark relative overflow-hidden">
         {/* Enhanced Background Elements */}
         <div className="absolute inset-0 overflow-hidden pointer-events-none">
           <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
           <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-green-400/5 to-yellow-500/5 rounded-full blur-3xl"></div>
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-red-400/3 to-orange-500/3 rounded-full blur-3xl"></div>
         </div>
         
         <div className="container mx-auto px-4 relative z-10">
           <motion.div
             initial={{ opacity: 0, y: 40 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8 }}
             className="text-center mb-20"
           >
             <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-yellow-400/20 via-amber-400/20 to-yellow-400/20 backdrop-blur-sm border border-yellow-400/30 rounded-full mb-6 shadow-lg shadow-yellow-400/10">
               <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
               <span className="text-yellow-400 font-bold text-sm tracking-wide">COMPETITION TRACKS</span>
               <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
             </div>
             
                           <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black theme-text-light mb-8 leading-tight">
                <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent">Competition</span>
                <br />
                <span className="text-white">Tracks</span>
              </h2>
             
             <p className="text-xl lg:text-2xl theme-text-muted leading-relaxed mb-6 max-w-4xl mx-auto">
               Choose from our comprehensive competition tracks designed to prepare students for national and international olympiads.
             </p>
           </motion.div>
           
                       {/* Competition Tracks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
              {/* Math Track */}
              <motion.div
                initial={{ opacity: 0, y: 60, scale: 0.8 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
                className="group"
              >
                <div className="relative h-full">
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-400/50 via-blue-500/30 to-blue-600/50 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <Card className="relative h-full flex flex-col bg-gradient-to-br from-[#0f1629] via-[#1a2236] to-[#0f1629] border border-blue-400/20 rounded-2xl overflow-hidden transform-gpu transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-blue-500/10 group-hover:border-blue-400/40">
                    {/* Header with Image */}
                    <div className="relative h-32 bg-gradient-to-br from-blue-400/20 to-blue-600/20 flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-blue-600/10"></div>
                      <div className="relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                        <Calculator className="w-10 h-10 text-white" />
                      </div>
                    </div>
                    
                    <div className="p-6 pb-4">
                      <h3 className="text-xl font-bold theme-text-light mb-4 text-center">Math</h3>
                      
                      {/* Competitions List */}
                      <div className="space-y-3">
                        {[
                          "AMC 8/10/12",
                          "AIME",
                          "USA(J)MO / USAMO"
                        ].map((competition, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                            className="px-3 py-2 bg-blue-400/5 border border-blue-400/10 rounded-lg group-hover:border-blue-400/20 transition-colors duration-300"
                          >
                            <p className="text-sm theme-text-muted group-hover:text-blue-300 transition-colors duration-300">{competition}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </div>
              </motion.div>
             
                           {/* Physics Track */}
              <motion.div
                initial={{ opacity: 0, y: 60, scale: 0.8 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.1, type: "spring", stiffness: 100 }}
                className="group"
              >
                <div className="relative h-full">
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-purple-400/50 via-purple-500/30 to-purple-600/50 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <Card className="relative h-full flex flex-col bg-gradient-to-br from-[#1a0f29] via-[#1a2236] to-[#1a0f29] border border-purple-400/20 rounded-2xl overflow-hidden transform-gpu transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-purple-500/10 group-hover:border-purple-400/40">
                    {/* Header with Image */}
                    <div className="relative h-32 bg-gradient-to-br from-purple-400/20 to-purple-600/20 flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-purple-600/10"></div>
                      <div className="relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                        <Atom className="w-10 h-10 text-white" />
                      </div>
                    </div>
                    
                    <div className="p-6 pb-4">
                      <h3 className="text-xl font-bold theme-text-light mb-4 text-center">Physics</h3>
                      
                      {/* Competitions List */}
                      <div className="space-y-3">
                        {[
                          "F = ma",
                          "USAPhO",
                          "Physics Bowl"
                        ].map((competition, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                            className="px-3 py-2 bg-purple-400/5 border border-purple-400/10 rounded-lg group-hover:border-purple-400/20 transition-colors duration-300"
                          >
                            <p className="text-sm theme-text-muted group-hover:text-purple-300 transition-colors duration-300">{competition}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </div>
              </motion.div>
             
                           {/* Chemistry Track */}
              <motion.div
                initial={{ opacity: 0, y: 60, scale: 0.8 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 100 }}
                className="group"
              >
                <div className="relative h-full">
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-green-400/50 via-green-500/30 to-green-600/50 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <Card className="relative h-full flex flex-col bg-gradient-to-br from-[#0f1920] via-[#1a2236] to-[#0f1920] border border-green-400/20 rounded-2xl overflow-hidden transform-gpu transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-green-500/10 group-hover:border-green-400/40">
                    {/* Header with Image */}
                    <div className="relative h-32 bg-gradient-to-br from-green-400/20 to-green-600/20 flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-green-600/10"></div>
                      <div className="relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:scale-110 transition-transform duration-300">
                        <FlaskConical className="w-10 h-10 text-white" />
                      </div>
                    </div>
                    
                    <div className="p-6 pb-4">
                      <h3 className="text-xl font-bold theme-text-light mb-4 text-center">Chemistry</h3>
                      
                      {/* Competitions List */}
                      <div className="space-y-3">
                        {[
                          "USNCO",
                          "National Science Bowl"
                        ].map((competition, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                            className="px-3 py-2 bg-green-400/5 border border-green-400/10 rounded-lg group-hover:border-green-400/20 transition-colors duration-300"
                          >
                            <p className="text-sm theme-text-muted group-hover:text-green-300 transition-colors duration-300">{competition}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </div>
              </motion.div>
             
                           {/* Biology Track */}
              <motion.div
                initial={{ opacity: 0, y: 60, scale: 0.8 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3, type: "spring", stiffness: 100 }}
                className="group"
              >
                <div className="relative h-full">
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-emerald-400/50 via-emerald-500/30 to-emerald-600/50 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <Card className="relative h-full flex flex-col bg-gradient-to-br from-[#0f1a0f] via-[#1a2236] to-[#0f1a0f] border border-emerald-400/20 rounded-2xl overflow-hidden transform-gpu transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-emerald-500/10 group-hover:border-emerald-400/40">
                    {/* Header with Image */}
                    <div className="relative h-32 bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-emerald-600/10"></div>
                      <div className="relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
                        <Heart className="w-10 h-10 text-white" />
                      </div>
                    </div>
                    
                    <div className="p-6 pb-4">
                      <h3 className="text-xl font-bold theme-text-light mb-4 text-center">Biology</h3>
                      
                      {/* Competitions List */}
                      <div className="space-y-3">
                        {[
                          "USABO Open / Semifinal and National",
                          "National Science Bowl"
                        ].map((competition, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                            className="px-3 py-2 bg-emerald-400/5 border border-emerald-400/10 rounded-lg group-hover:border-emerald-400/20 transition-colors duration-300"
                          >
                            <p className="text-sm theme-text-muted group-hover:text-emerald-300 transition-colors duration-300">{competition}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </div>
              </motion.div>
             
                           {/* Computing Track */}
              <motion.div
                initial={{ opacity: 0, y: 60, scale: 0.8 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4, type: "spring", stiffness: 100 }}
                className="group"
              >
                <div className="relative h-full">
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-orange-400/50 via-orange-500/30 to-orange-600/50 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <Card className="relative h-full flex flex-col bg-gradient-to-br from-[#1a0f0f] via-[#1a2236] to-[#1a0f0f] border border-orange-400/20 rounded-2xl overflow-hidden transform-gpu transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-orange-500/10 group-hover:border-orange-400/40">
                    {/* Header with Image */}
                    <div className="relative h-32 bg-gradient-to-br from-orange-400/20 to-orange-600/20 flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-orange-600/10"></div>
                      <div className="relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform duration-300">
                        <Code className="w-10 h-10 text-white" />
                      </div>
                    </div>
                    
                    <div className="p-6 pb-4">
                      <h3 className="text-xl font-bold theme-text-light mb-4 text-center">Computing</h3>
                      
                      {/* Competitions List */}
                      <div className="space-y-3">
                        {[
                          "USACO"
                        ].map((competition, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
                            className="px-3 py-2 bg-orange-400/5 border border-orange-400/10 rounded-lg group-hover:border-orange-400/20 transition-colors duration-300"
                          >
                            <p className="text-sm theme-text-muted group-hover:text-orange-300 transition-colors duration-300">{competition}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </div>
              </motion.div>
           </div>
           
           
         </div>
       </section>

       

      {/* AES Champions Program Levels Section */}
      <section className="py-24 theme-bg-dark relative overflow-hidden">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-yellow-400/5 to-amber-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-blue-400/5 to-purple-500/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-green-400/3 to-teal-500/3 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Enhanced Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-yellow-400/20 via-amber-400/20 to-yellow-400/20 backdrop-blur-sm border border-yellow-400/30 rounded-full mb-6 shadow-lg shadow-yellow-400/10">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-yellow-400 font-bold text-sm tracking-wide">AES CHAMPIONS PROGRAMS</span>
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black theme-text-light mb-8 leading-tight">
              Pathways to Excellence
            </h2>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-xl lg:text-2xl theme-text-muted leading-relaxed mb-6">
                Students are admitted to various levels based on their performance in our 
                <span className="text-yellow-400 font-bold mx-2 relative">
                  customized assessment test
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-400/0 via-yellow-400 to-yellow-400/0"></span>
                </span>
                ensuring a tailored and effective learning journey.
              </p>
              
              {/* Progress Pathway Indicator */}
              <div className="flex items-center justify-center gap-2 mt-8">
                {Array.from({length: 5}, (_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className={`flex items-center ${i < 4 ? 'gap-2' : ''}`}
                  >
                    <div className={`w-3 h-3 rounded-full ${
                      i === 0 ? 'bg-blue-400' :
                      i === 1 ? 'bg-green-400' :
                      i === 2 ? 'bg-yellow-400' :
                      i === 3 ? 'bg-purple-400' :
                      'bg-red-400'
                    } shadow-lg`}></div>
                    {i < 4 && (
                      <div className="w-8 h-0.5 bg-gradient-to-r from-gray-500 to-gray-600"></div>
                    )}
                  </motion.div>
                ))}
              </div>
              <p className="text-sm theme-text-muted mt-3 font-medium">5 Progressive Levels • Foundation to International Excellence</p>
            </div>
          </motion.div>

          {/* Redesigned Card Grid - First Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center justify-center max-w-6xl mx-auto">
            {/* Level 1: Foundation Builders */}
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
              className="group h-full"
            >
              <div className="relative h-full">
                {/* Glow Effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-400/50 via-blue-500/30 to-blue-600/50 rounded-3xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <Card className="relative h-full flex flex-col bg-gradient-to-br from-[#0f1629] via-[#1a2236] to-[#0f1629] border border-blue-400/20 rounded-3xl overflow-hidden transform-gpu transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-blue-500/10 group-hover:border-blue-400/40">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]"></div>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,197,253,0.05),transparent_50%)]"></div>
                  
                  {/* Level Number Badge */}
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30 border-4 border-[#1a2236] group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl font-black text-white">1</span>
                  </div>
                  
                  <CardHeader className="p-8 pb-6 relative z-10">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                          <BookOpen className="w-8 h-8 text-white" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-blue-400 font-bold text-sm tracking-wide uppercase">Level 1</p>
                          <CardTitle className="text-2xl font-black theme-text-light leading-tight">Foundation<br />Builders</CardTitle>
                        </div>
                      </div>
                      
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400/10 to-amber-400/10 border border-yellow-400/20 rounded-full backdrop-blur-sm">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span className="text-yellow-400 font-bold text-sm">Grades 5–8</span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-8 pt-0 space-y-8 flex-1 relative z-10">
                    {/* Goals Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400/20 to-amber-400/20 flex items-center justify-center border border-yellow-400/30">
                          <Target className="w-5 h-5 text-yellow-400" />
                        </div>
                        <h4 className="text-lg font-bold theme-text-light">Learning Goals</h4>
                      </div>
                      <div className="space-y-3">
                        {[
                          "Develop foundational problem-solving skills",
                          "Ignite curiosity in STEM fields",
                          "Build conceptual understanding"
                        ].map((goal, i) => (
                          <div key={i} className="flex items-start gap-3 group/item">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2.5 flex-shrink-0 group-hover/item:bg-yellow-400 transition-colors"></div>
                            <p className="text-sm theme-text-muted leading-relaxed">{goal}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                    
                    {/* Contests Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400/20 to-amber-400/20 flex items-center justify-center border border-yellow-400/30">
                          <Trophy className="w-5 h-5 text-yellow-400" />
                        </div>
                        <h4 className="text-lg font-bold theme-text-light">Target Contests</h4>
                      </div>
                      <div className="space-y-2">
                        {[
                          "Local School Math/Science Challenges",
                          "Introductory Puzzle Competitions",
                          "Online Practice Contests"
                        ].map((contest, i) => (
                          <div key={i} className="px-3 py-2 bg-blue-400/5 border border-blue-400/10 rounded-lg">
                            <p className="text-sm theme-text-muted">{contest}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Progress Indicator */}
                    <div className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-blue-400">DIFFICULTY LEVEL</span>
                        <span className="text-xs font-bold theme-text-muted">BEGINNER</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: "20%" }}
                          transition={{ delay: 0.5, duration: 1 }}
                          className="h-2 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full"
                        ></motion.div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            {/* Level 2: Skill Explorers */}
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.1, type: "spring", stiffness: 100 }}
              className="group h-full"
            >
              <div className="relative h-full">
                {/* Glow Effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-br from-green-400/50 via-green-500/30 to-green-600/50 rounded-3xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <Card className="relative h-full flex flex-col bg-gradient-to-br from-[#0f1920] via-[#1a2236] to-[#0f1920] border border-green-400/20 rounded-3xl overflow-hidden transform-gpu transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-green-500/10 group-hover:border-green-400/40">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.1),transparent_50%)]"></div>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(74,222,128,0.05),transparent_50%)]"></div>
                  
                  {/* Level Number Badge */}
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-xl shadow-green-500/30 border-4 border-[#1a2236] group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl font-black text-white">2</span>
                  </div>
                  
                  <CardHeader className="p-8 pb-6 relative z-10">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:scale-110 transition-transform duration-300">
                          <Brain className="w-8 h-8 text-white" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-green-400 font-bold text-sm tracking-wide uppercase">Level 2</p>
                          <CardTitle className="text-2xl font-black theme-text-light leading-tight">Skill<br />Explorers</CardTitle>
                        </div>
                      </div>
                      
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400/10 to-amber-400/10 border border-yellow-400/20 rounded-full backdrop-blur-sm">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span className="text-yellow-400 font-bold text-sm">Grades 6–9</span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-8 pt-0 space-y-8 flex-1 relative z-10">
                    {/* Goals Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400/20 to-amber-400/20 flex items-center justify-center border border-yellow-400/30">
                          <Target className="w-5 h-5 text-yellow-400" />
                        </div>
                        <h4 className="text-lg font-bold theme-text-light">Learning Goals</h4>
                      </div>
                      <div className="space-y-3">
                        {[
                          "Master core concepts and advanced techniques",
                          "Build confidence in multi-step problems",
                          "Introduction to competitive formats"
                        ].map((goal, i) => (
                          <div key={i} className="flex items-start gap-3 group/item">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2.5 flex-shrink-0 group-hover/item:bg-yellow-400 transition-colors"></div>
                            <p className="text-sm theme-text-muted leading-relaxed">{goal}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                    
                    {/* Contests Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400/20 to-amber-400/20 flex items-center justify-center border border-yellow-400/30">
                          <Trophy className="w-5 h-5 text-yellow-400" />
                        </div>
                        <h4 className="text-lg font-bold theme-text-light">Target Contests</h4>
                      </div>
                      <div className="space-y-2">
                        {[
                          "AMC 8, MathCounts (Math)",
                          "F=ma Introduction (Physics)",
                          "Regional Science Fairs"
                        ].map((contest, i) => (
                          <div key={i} className="px-3 py-2 bg-green-400/5 border border-green-400/10 rounded-lg">
                            <p className="text-sm theme-text-muted">{contest}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Progress Indicator */}
                    <div className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-green-400">DIFFICULTY LEVEL</span>
                        <span className="text-xs font-bold theme-text-muted">INTERMEDIATE</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: "40%" }}
                          transition={{ delay: 0.6, duration: 1 }}
                          className="h-2 bg-gradient-to-r from-green-400 to-green-500 rounded-full"
                        ></motion.div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            {/* Level 3: Achievers & Qualifiers */}
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 100 }}
              className="group h-full"
            >
              <div className="relative h-full">
                {/* Glow Effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-br from-yellow-400/50 via-amber-500/30 to-yellow-600/50 rounded-3xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <Card className="relative h-full flex flex-col bg-gradient-to-br from-[#1f1a0f] via-[#1a2236] to-[#1f1a0f] border border-yellow-400/20 rounded-3xl overflow-hidden transform-gpu transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-yellow-500/10 group-hover:border-yellow-400/40">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(234,179,8,0.1),transparent_50%)]"></div>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(253,224,71,0.05),transparent_50%)]"></div>
                  
                  {/* Level Number Badge */}
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-xl shadow-yellow-500/30 border-4 border-[#1a2236] group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl font-black text-[#1a2236]">3</span>
                  </div>
                  
                  <CardHeader className="p-8 pb-6 relative z-10">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/20 group-hover:scale-110 transition-transform duration-300">
                          <Award className="w-8 h-8 text-[#1a2236]" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-yellow-400 font-bold text-sm tracking-wide uppercase">Level 3</p>
                          <CardTitle className="text-2xl font-black theme-text-light leading-tight">Achievers &<br />Qualifiers</CardTitle>
                        </div>
                      </div>
                      
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400/10 to-amber-400/10 border border-yellow-400/20 rounded-full backdrop-blur-sm">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span className="text-yellow-400 font-bold text-sm">Grades 7–10</span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-8 pt-0 space-y-8 flex-1 relative z-10">
                    {/* Goals Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400/20 to-amber-400/20 flex items-center justify-center border border-yellow-400/30">
                          <Target className="w-5 h-5 text-yellow-400" />
                        </div>
                        <h4 className="text-lg font-bold theme-text-light">Learning Goals</h4>
                      </div>
                      <div className="space-y-3">
                        {[
                          "Achieve significant qualifying scores",
                          "Master specialized topics and theories",
                          "Strategize for competitive environments"
                        ].map((goal, i) => (
                          <div key={i} className="flex items-start gap-3 group/item">
                            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2.5 flex-shrink-0 group-hover/item:bg-amber-500 transition-colors"></div>
                            <p className="text-sm theme-text-muted leading-relaxed">{goal}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                    
                    {/* Contests Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400/20 to-amber-400/20 flex items-center justify-center border border-yellow-400/30">
                          <Trophy className="w-5 h-5 text-yellow-400" />
                        </div>
                        <h4 className="text-lg font-bold theme-text-light">Target Contests</h4>
                      </div>
                      <div className="space-y-2">
                        {[
                          "AMC 10/12, AIME Qualification",
                          "USAPhO Preliminary Rounds",
                          "National Math/Physics League"
                        ].map((contest, i) => (
                          <div key={i} className="px-3 py-2 bg-yellow-400/5 border border-yellow-400/10 rounded-lg">
                            <p className="text-sm theme-text-muted">{contest}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Progress Indicator */}
                    <div className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-yellow-400">DIFFICULTY LEVEL</span>
                        <span className="text-xs font-bold theme-text-muted">ADVANCED</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: "60%" }}
                          transition={{ delay: 0.7, duration: 1 }}
                          className="h-2 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full"
                        ></motion.div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
          
          {/* Second Row - Level 4 and 5 centered */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-center max-w-4xl mx-auto mt-8">
            {/* Level 4: Elite Competitors */}
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3, type: "spring", stiffness: 100 }}
              className="group h-full"
            >
              <div className="relative h-full">
                {/* Glow Effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-br from-purple-400/50 via-purple-500/30 to-purple-600/50 rounded-3xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <Card className="relative h-full flex flex-col bg-gradient-to-br from-[#1a0f29] via-[#1a2236] to-[#1a0f29] border border-purple-400/20 rounded-3xl overflow-hidden transform-gpu transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-purple-500/10 group-hover:border-purple-400/40">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.1),transparent_50%)]"></div>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(196,181,253,0.05),transparent_50%)]"></div>
                  
                  {/* Level Number Badge */}
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-500/30 border-4 border-[#1a2236] group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl font-black text-white">4</span>
                  </div>
                  
                  <CardHeader className="p-8 pb-6 relative z-10">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                          <Star className="w-8 h-8 text-white" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-purple-400 font-bold text-sm tracking-wide uppercase">Level 4</p>
                          <CardTitle className="text-2xl font-black theme-text-light leading-tight">Elite<br />Competitors</CardTitle>
                        </div>
                      </div>
                      
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400/10 to-amber-400/10 border border-yellow-400/20 rounded-full backdrop-blur-sm">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span className="text-yellow-400 font-bold text-sm">Grades 8–11</span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-8 pt-0 space-y-8 flex-1 relative z-10">
                    {/* Goals Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400/20 to-amber-400/20 flex items-center justify-center border border-yellow-400/30">
                          <Target className="w-5 h-5 text-yellow-400" />
                        </div>
                        <h4 className="text-lg font-bold theme-text-light">Learning Goals</h4>
                      </div>
                      <div className="space-y-3">
                        {[
                          "Attain top national and international ranks",
                          "Specialize in advanced domains",
                          "Develop innovative problem-solving"
                        ].map((goal, i) => (
                          <div key={i} className="flex items-start gap-3 group/item">
                            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2.5 flex-shrink-0 group-hover/item:bg-yellow-400 transition-colors"></div>
                            <p className="text-sm theme-text-muted leading-relaxed">{goal}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                    
                    {/* Contests Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400/20 to-amber-400/20 flex items-center justify-center border border-yellow-400/30">
                          <Trophy className="w-5 h-5 text-yellow-400" />
                        </div>
                        <h4 className="text-lg font-bold theme-text-light">Target Contests</h4>
                      </div>
                      <div className="space-y-2">
                        {[
                          "USAMO, USAJMO (Math)",
                          "USAPhO National Exam (Physics)",
                          "Invitational Math/Physics Tournaments"
                        ].map((contest, i) => (
                          <div key={i} className="px-3 py-2 bg-purple-400/5 border border-purple-400/10 rounded-lg">
                            <p className="text-sm theme-text-muted">{contest}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Progress Indicator */}
                    <div className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-purple-400">DIFFICULTY LEVEL</span>
                        <span className="text-xs font-bold theme-text-muted">EXPERT</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: "80%" }}
                          transition={{ delay: 0.8, duration: 1 }}
                          className="h-2 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full"
                        ></motion.div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            {/* Level 5: International Champions */}
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4, type: "spring", stiffness: 100 }}
              className="group h-full"
            >
              <div className="relative h-full">
                {/* Glow Effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-br from-red-400/50 via-red-500/30 to-red-600/50 rounded-3xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <Card className="relative h-full flex flex-col bg-gradient-to-br from-[#290f0f] via-[#1a2236] to-[#290f0f] border border-red-400/20 rounded-3xl overflow-hidden transform-gpu transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-red-500/10 group-hover:border-red-400/40">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(239,68,68,0.1),transparent_50%)]"></div>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(252,165,165,0.05),transparent_50%)]"></div>
                  
                  {/* Level Number Badge */}
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center shadow-xl shadow-red-500/30 border-4 border-[#1a2236] group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl font-black text-white">5</span>
                  </div>
                  
                  {/* Crown Icon for Ultimate Level */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg border-4 border-[#1a2236] group-hover:scale-110 transition-transform duration-300">
                    <Crown className="w-6 h-6 text-[#1a2236]" />
                  </div>
                  
                  <CardHeader className="p-8 pb-6 pt-12 relative z-10">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/20 group-hover:scale-110 transition-transform duration-300">
                          <Globe className="w-8 h-8 text-white" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-red-400 font-bold text-sm tracking-wide uppercase">Level 5</p>
                          <CardTitle className="text-2xl font-black theme-text-light leading-tight">International<br />Champions</CardTitle>
                        </div>
                      </div>
                      
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400/10 to-amber-400/10 border border-yellow-400/20 rounded-full backdrop-blur-sm">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span className="text-yellow-400 font-bold text-sm">Grades 9–12</span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-8 pt-0 space-y-8 flex-1 relative z-10">
                    {/* Goals Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400/20 to-amber-400/20 flex items-center justify-center border border-yellow-400/30">
                          <Target className="w-5 h-5 text-yellow-400" />
                        </div>
                        <h4 className="text-lg font-bold theme-text-light">Learning Goals</h4>
                      </div>
                      <div className="space-y-3">
                        {[
                          "Represent country in international olympiads",
                          "Contribute to advanced research projects",
                          "Become leaders in global STEM community"
                        ].map((goal, i) => (
                          <div key={i} className="flex items-start gap-3 group/item">
                            <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2.5 flex-shrink-0 group-hover/item:bg-yellow-400 transition-colors"></div>
                            <p className="text-sm theme-text-muted leading-relaxed">{goal}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                    
                    {/* Contests Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400/20 to-amber-400/20 flex items-center justify-center border border-yellow-400/30">
                          <Trophy className="w-5 h-5 text-yellow-400" />
                        </div>
                        <h4 className="text-lg font-bold theme-text-light">Target Contests</h4>
                      </div>
                      <div className="space-y-2">
                        {[
                          "International Math Olympiad (IMO)",
                          "International Physics Olympiad (IPhO)",
                          "Advanced Collegiate Competitions"
                        ].map((contest, i) => (
                          <div key={i} className="px-3 py-2 bg-red-400/5 border border-red-400/10 rounded-lg">
                            <p className="text-sm theme-text-muted">{contest}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Progress Indicator */}
                    <div className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-red-400">DIFFICULTY LEVEL</span>
                        <span className="text-xs font-bold theme-text-muted">WORLD-CLASS</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ delay: 0.9, duration: 1 }}
                          className="h-2 bg-gradient-to-r from-red-400 via-red-500 to-red-600 rounded-full shadow-lg shadow-red-500/20"
                        ></motion.div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
          
          {/* Enhanced Call-to-Action at bottom of section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-center mt-20 mx-auto max-w-4xl"
          >
            {/* <div className="max-w-3xl mx-auto">
              <h3 className="text-2xl lg:text-3xl font-bold theme-text-light mb-6">
                Ready to Begin Your Journey?
              </h3>
              <p className="text-lg theme-text-muted mb-8">
                Take our customized assessment test to find your perfect level and start your path to olympiad excellence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-gradient-to-r from-yellow-400 to-amber-500 text-[#1a2236] hover:from-yellow-300 hover:to-amber-400 px-8 py-3 font-bold text-lg shadow-xl hover:shadow-2xl hover:shadow-yellow-400/20 transform hover:scale-105 transition-all duration-300">
                  Take Assessment Test
                </Button>
                <Button variant="outline" className="border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-[#1a2236] px-8 py-3 font-bold text-lg transition-all duration-300">
                  Schedule Consultation
                </Button>
              </div>
            </div> */}
          </motion.div>
        </div>
      </section>

      {/* Program Overview & Analytics Section */}
      <section className="py-20 theme-bg-dark">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-yellow-400/10 text-yellow-400">Program Overview</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold theme-text-light mb-6">Your Pathway to National & International Success</h2>
          </motion.div>

          {/* Top Section: Combined Structured Pathway + Student Journey */}
          <div className="mb-16">
            {/* Single Combined Card */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-[#1a2236] to-[#2a3246] rounded-3xl p-8 lg:p-12 border border-yellow-400/20"
            >
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left Side: A Structured Pathway */}
                <div className="space-y-6">
                  <h3 className="text-2xl lg:text-3xl font-bold theme-text-light">A Structured Pathway</h3>
                  <div className="text-center">
                    <div className="text-6xl lg:text-8xl font-black text-yellow-400 mb-4">5</div>
                    <h4 className="text-xl lg:text-2xl font-bold theme-text-light mb-4">Distinct Levels</h4>
                    <p className="theme-text-muted text-base lg:text-lg leading-relaxed">
                      From foundational skills to international competition, our program is designed to elevate students at every stage of their journey.
                    </p>
                  </div>
                </div>

                {/* Right Side: The Student Journey */}
                <div className="space-y-6">
                  <h3 className="text-2xl lg:text-3xl font-bold theme-text-light text-center">The Student Journey</h3>
                  
                  {/* Entry Point */}
                  <div className="text-center">
                    <div className="inline-block bg-yellow-400/20 border border-yellow-400/30 rounded-xl px-6 py-3 mb-6">
                      <h4 className="font-semibold theme-text-light text-lg">Entry Point</h4>
                      <p className="text-yellow-400 font-medium">Customized Assessment Test</p>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="text-center">
                    <div className="w-8 h-8 mx-auto text-yellow-400">↓</div>
                  </div>

                  {/* Level Progression */}
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { level: "Level 1:", title: "Foundation Builders", color: "bg-blue-500/20 border-blue-400/30" },
                      { level: "Level 2:", title: "Skill Explorers", color: "bg-green-500/20 border-green-400/30" },
                      { level: "Level 3:", title: "Achievers", color: "bg-yellow-500/20 border-yellow-400/30" },
                      { level: "Level 4:", title: "Elite Competitors", color: "bg-purple-500/20 border-purple-400/30" },
                      { level: "Level 5:", title: "Int'l Champions", color: "bg-red-500/20 border-red-400/30" }
                    ].map((level, i) => (
                      <div key={i} className={`${level.color} border rounded-lg p-2 lg:p-3 text-center`}>
                        <p className="text-xs font-semibold theme-text-light">{level.level}</p>
                        <p className="text-xs theme-text-muted">{level.title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Middle Section: Student Distribution + Target Contest Prestige */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Student Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-[#1a2236] to-[#2a3246] rounded-3xl p-8 border border-yellow-400/20"
            >
              <h3 className="text-xl font-bold theme-text-light mb-6">Student Distribution Across Levels</h3>
              <p className="text-sm theme-text-muted mb-8">
                Our program structure allows for broad participation at foundational levels, with a focused, elite group reaching the top tiers.
              </p>
              
              {/* Pie Chart Representation */}
              <div className="relative w-48 h-48 mx-auto mb-6">
                <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                  {/* Level 1 - 40% */}
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#3B82F6" strokeWidth="30" strokeDasharray="201 503" strokeDashoffset="0" opacity="0.8" />
                  {/* Level 2 - 25% */}
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#10B981" strokeWidth="30" strokeDasharray="126 503" strokeDashoffset="-201" opacity="0.8" />
                  {/* Level 3 - 20% */}
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#F59E0B" strokeWidth="30" strokeDasharray="101 503" strokeDashoffset="-327" opacity="0.8" />
                  {/* Level 4 - 10% */}
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#8B5CF6" strokeWidth="30" strokeDasharray="63 503" strokeDashoffset="-428" opacity="0.8" />
                  {/* Level 5 - 5% */}
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#EF4444" strokeWidth="30" strokeDasharray="31 503" strokeDashoffset="-491" opacity="0.8" />
                </svg>
              </div>

              {/* Legend */}
              <div className="space-y-2 text-sm">
                {[
                  { color: "bg-blue-500", label: "Level 1", percent: "40%" },
                  { color: "bg-green-500", label: "Level 2", percent: "25%" },
                  { color: "bg-yellow-500", label: "Level 3", percent: "20%" },
                  { color: "bg-purple-500", label: "Level 4", percent: "10%" },
                  { color: "bg-red-500", label: "Level 5", percent: "5%" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                      <span className="theme-text-muted">{item.label}</span>
                    </div>
                    <span className="theme-text-light font-semibold">{item.percent}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Target Contest Prestige */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-[#1a2236] to-[#2a3246] rounded-3xl p-8 border border-yellow-400/20"
            >
              <h3 className="text-xl font-bold theme-text-light mb-6">Target Contest Prestige</h3>
              <p className="text-sm theme-text-muted mb-8">
                As students advance through the levels, they are prepared for increasingly prestigious and challenging competitions.
              </p>

              {/* Bar Chart */}
              <div className="space-y-4">
                {[
                  { label: "Local/School", width: "20%", color: "bg-gradient-to-r from-blue-400 to-blue-500" },
                  { label: "Regional", width: "40%", color: "bg-gradient-to-r from-green-400 to-green-500" },
                  { label: "National Qualifiers", width: "60%", color: "bg-gradient-to-r from-yellow-400 to-yellow-500" },
                  { label: "National Finals", width: "80%", color: "bg-gradient-to-r from-orange-400 to-orange-500" },
                  { label: "International Olympiads", width: "100%", color: "bg-gradient-to-r from-red-400 to-red-500" }
                ].map((contest, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm theme-text-light font-medium">{contest.label}</span>
                      <span className="text-xs theme-text-muted">{contest.width}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${contest.color} transition-all duration-1000 ease-out`} 
                        style={{width: contest.width}}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Bottom Section: Program Grade Coverage (precise ticks & spacing) */}
          <div className="mt-8 max-w-5xl mx-auto">
            <ProgramGradeCoverage />
          </div>
        </div>
      </section>

      {/* Competition Programs Section */}
      <section className="py-20 theme-bg-dark">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-[#1a2236] text-xs font-semibold rounded-full mb-4 shadow-lg">
              <div className="w-1.5 h-1.5 bg-[#1a2236] rounded-full animate-pulse"></div>
              Competition Programs
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold theme-text-light mb-4 leading-tight">
              Choose Your 
              <span className="bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent"> Competition Track</span>
            </h2>
            <p className="text-lg theme-text-muted max-w-3xl mx-auto font-medium">
              Specialized programs for different grade levels and competition types.
            </p>
          </motion.div>
          
                     <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8 max-w-7xl mx-auto items-start">
             {competitionPrograms.map((program, i) => (
               <motion.div
                 key={i}
                 initial={{ opacity: 0, y: 50 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 transition={{ delay: i * 0.2, duration: 0.6 }}
                 className="relative group h-full"
               >
                 <Card
                   className={`relative overflow-hidden transition-all duration-500 hover:scale-[1.02] group flex flex-col h-full ${
                     i === 1
                       ? "ring-2 ring-blue-400/50 shadow-2xl scale-[1.02] bg-slate-800/90 backdrop-blur-sm border border-blue-400/20"
                       : "shadow-lg hover:shadow-2xl bg-slate-800/80 backdrop-blur-sm border border-slate-600/30 hover:border-slate-500/50"
                   }`}
                 >
                                       {i === 1 && (
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-20">
                        <Badge className="bg-yellow-400 text-[#1a2236] text-xs font-semibold px-2 py-1 shadow-md">
                          Popular
                        </Badge>
                      </div>
                    )}

                   <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                       <CardHeader className="text-center pb-6 pt-6 relative z-10">
                      <div className="w-full h-48 mx-auto mb-6 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 ring-1 ring-slate-600/20">
                        <img 
                          src={i === 0 ? "/learning-journey-cartoon.png" : 
                               i === 1 ? "/progress-mountain-climb.png" : 
                               i === 2 ? "/successful-celebration.png" : 
                               "/learning-journey-cartoon.png"} 
                          alt={`${program.name} program`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 to-slate-800/60"></div>
                      </div>
                      
                      {/* Program Info Below Image */}
                      <div className="text-center mt-4">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg">
                          <Calculator className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-3xl font-bold text-cyan-300 mb-2">{program.name}</h3>
                        <p className="text-lg text-cyan-200 font-medium">({program.grades})</p>
                      </div>
                    </CardHeader>

                   <CardContent className="flex-1 flex flex-col relative z-10">
                     <div className="flex-1 space-y-8">
                       {/* Timeline Details */}
                       <div className="space-y-4">
                         <h4 className="font-bold text-cyan-300 text-lg border-b border-slate-600/50 pb-2">
                           Timeline:
                         </h4>
                         <div className="space-y-3">
                           <div className="relative p-4 bg-slate-700/50 rounded-xl border border-slate-600/30 backdrop-blur-sm">
                             <div className="flex justify-between items-center">
                               <span className="text-sm font-semibold text-cyan-200">Long Term</span>
                               <div className="text-right">
                                 <span className="text-xl font-bold text-cyan-300">{program.timeline.lt}</span>
                               </div>
                             </div>
                           </div>
                           <div className="relative p-4 bg-slate-700/50 rounded-xl border border-slate-600/30 backdrop-blur-sm">
                             <div className="flex justify-between items-center">
                               <span className="text-sm font-semibold text-cyan-200">Fast Track</span>
                               <div className="text-right">
                                 <span className="text-xl font-bold text-cyan-300">{program.timeline.ft}</span>
                               </div>
                             </div>
                           </div>
                         </div>
                       </div>

                       {/* Program Details */}
                       <div className="space-y-4">
                         <h4 className="font-bold text-cyan-300 text-lg border-b border-slate-600/50 pb-2">
                           Program Details:
                         </h4>
                         <div className="space-y-3">
                           <div className="relative p-4 bg-slate-700/50 rounded-xl border border-slate-600/30 backdrop-blur-sm">
                             <div className="flex justify-between items-center">
                               <span className="text-sm font-semibold text-cyan-200">Sessions</span>
                               <div className="text-right">
                                 <span className="text-xl font-bold text-cyan-300">{program.sessions}</span>
                               </div>
                             </div>
                           </div>
                           <div className="relative p-4 bg-slate-700/50 rounded-xl border border-slate-600/30 backdrop-blur-sm">
                             <div className="flex justify-between items-center">
                               <span className="text-sm font-semibold text-cyan-200">Assessments</span>
                               <div className="text-right">
                                 <span className="text-xl font-bold text-cyan-300">{program.assessments}</span>
                               </div>
                             </div>
                           </div>
                         </div>
                       </div>

                       {/* Fees */}
                       <div className="space-y-4">
                         <h4 className="font-bold text-cyan-300 text-lg border-b border-slate-600/50 pb-2">
                           Pricing:
                         </h4>
                         <div className="space-y-3">
                           <div className="relative p-4 bg-slate-700/50 rounded-xl border border-slate-600/30 backdrop-blur-sm">
                             <div className="flex justify-between items-center">
                               <span className="text-sm font-semibold text-cyan-200">Long Term</span>
                               <div className="text-right">
                                 <span className="text-xl font-bold text-cyan-300">{program.fees.lt}</span>
                               </div>
                             </div>
                           </div>
                           <div className="relative p-4 bg-slate-700/50 rounded-xl border border-slate-600/30 backdrop-blur-sm">
                             <div className="flex justify-between items-center">
                               <span className="text-sm font-semibold text-cyan-200">Fast Track</span>
                               <div className="text-right">
                                 <span className="text-xl font-bold text-cyan-300">{program.fees.ft}</span>
                               </div>
                             </div>
                           </div>
                         </div>
                       </div>
                     </div>

                     {/* CTA Button */}
                  
                   </CardContent>
                 </Card>
               </motion.div>
             ))}
           </div>
        </div>
      </section>

      {/* Deliverables Section */}
      <section className="py-20 theme-bg-dark">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-yellow-400/10 text-yellow-400">Program Deliverables</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold theme-text-light mb-6">What You&apos;ll Achieve</h2>
            <p className="text-xl theme-text-muted max-w-3xl mx-auto">Comprehensive skill development for competitive excellence and beyond.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {deliverables.map((deliverable, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full flex flex-col bg-[#1a2236]/90 backdrop-blur-sm border border-yellow-400/20 hover:shadow-xl hover:border-yellow-400/40 transition-all duration-300 group relative">
                  <CardHeader className="pb-2">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center mb-4 mx-auto">
                      <deliverable.icon className="h-7 w-7 text-[#1a2236]" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-center mb-2 theme-text-light">{deliverable.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <p className="text-sm theme-text-muted text-center mb-4 font-medium">{deliverable.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 theme-bg-dark">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-yellow-400/10 text-yellow-400">FAQ</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold theme-text-light mb-6">Frequently Asked Questions</h2>
            <p className="text-xl theme-text-muted max-w-3xl mx-auto">Find answers to common questions about the AES CHAMPIONS program.</p>
          </motion.div>
          <div className="max-w-2xl mx-auto">
            <Accordion type="single" collapsible>
              <div className="space-y-6">
                {faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="border-none">
                    <div>
                      <AccordionTrigger className="flex items-center gap-4 px-6 py-4 bg-[#1a2236]/90 backdrop-blur-sm border border-yellow-400/20 rounded-full font-bold text-lg text-yellow-400 hover:bg-yellow-400/10 hover:no-underline transition-all">
                        <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-[#1a2236] font-bold">Q</div>
                        <span className="text-left">{faq.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="relative px-0 pb-4 pt-0">
                        <div className="relative bg-[#1a2236]/90 backdrop-blur-sm border border-yellow-400/20 rounded-2xl shadow-lg p-6 text-base font-medium theme-text-light mt-2 ml-10">
                          <div className="absolute -left-4 top-6 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-[#1a2236]"></div>
                          {faq.answer}
                        </div>
                      </AccordionContent>
                    </div>
                  </AccordionItem>
                ))}
              </div>
            </Accordion>
          </div>
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
            className="max-w-4xl mx-auto theme-text-light space-y-6 sm:space-y-8"
          >
            <Badge className="mb-4 bg-yellow-400/10 text-yellow-400 border-yellow-400/20">
              🚀 Start Your Champion Journey
            </Badge>
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold theme-text-light leading-tight">
              Ready to Become a Champion?
            </h2>
            
            <p className="text-base sm:text-lg lg:text-xl theme-text-muted px-4 leading-relaxed max-w-3xl mx-auto">
              Join AES CHAMPIONS and master the skills needed to excel in national-level Olympiad competitions.
            </p>
            
                         <div className="flex justify-center pt-4">
               <Link href="/book-session">
                 <Button className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#1a2236] hover:from-yellow-300 hover:to-yellow-400 px-6 shadow-lg font-bold">
                   Book Free Session
                 </Button>
               </Link>
             </div>
          </motion.div>
        </div>
      </section>
      <Footer />
      <Chatbot />
    </main>
  );
}