"use client";
import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, Award, Star, Globe, Clock, Target, TrendingUp, Lightbulb, Briefcase, Heart, Zap, Trophy, Brain, Calculator, Atom, Users2, Calendar, FileText } from "lucide-react";
import Footer from "@/components/home/Footer";
import Chatbot from "@/components/home/Chatbot";
import Header from "@/components/home/Header";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

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
      <section className="py-16 lg:py-24 theme-bg-dark relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-400 rounded-full opacity-10 animate-float"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-blue-400 rounded-full opacity-10 animate-float-reverse"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-purple-400 rounded-full opacity-10 animate-float"></div>
          <div className="absolute top-1/3 right-1/3 w-8 h-8 bg-green-400 rounded-full opacity-10 animate-float-reverse"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <Badge className="bg-yellow-400/10 text-yellow-400 border-yellow-400/20">
                  🏆 AES CHAMPIONS
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold theme-text-light leading-tight">
                  Olympiad Excellence Program
                </h1>
                <blockquote className="text-xl theme-text-light italic border-l-4 border-yellow-400 pl-4">
                  &quot;Excellence is not a skill. It&apos;s an attitude.&quot;
                  <span className="block text-sm theme-text-muted mt-2">- Ralph Marston</span>
                </blockquote>
                <p className="text-xl theme-text-muted leading-relaxed">
                  A structured, cohort-based program designed to equip students with the skills and strategies to excel in national-level Olympiad competitions. Master AMC8, AMC10, AMC12, and F=ma with expert guidance.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-amber-400/20 rounded-3xl transform rotate-6"></div>
                <div className="relative bg-[#1a2236]/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-yellow-400/20">
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-yellow-400">Competition Tracks</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {competitionTracks.map((track, i) => (
                        <Card key={i} className="flex flex-col items-center p-4 bg-gradient-to-br from-[#1a2236] to-[#2a3246] border-yellow-400/20 hover:scale-105 hover:shadow-xl transition-all duration-300">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${track.color} flex items-center justify-center mb-3`}>
                            <track.icon className="h-6 w-6 text-white" />
                          </div>
                          <CardTitle className="text-lg text-center mb-1 theme-text-light">{track.title}</CardTitle>
                          <CardDescription className="text-xs text-center theme-text-muted">{track.description}</CardDescription>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Program Features Section */}
      <section className="py-20 theme-bg-dark">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-yellow-400/10 text-yellow-400">Program Features</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold theme-text-light mb-6">Comprehensive Olympiad Preparation</h2>
            <p className="text-xl theme-text-muted max-w-3xl mx-auto">
              Our structured approach combines academic excellence with essential life skills for competitive success.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full flex flex-col justify-center bg-[#1a2236]/90 backdrop-blur-sm border border-yellow-400/20 shadow-md rounded-xl hover:shadow-xl hover:border-yellow-400/40 transition-all duration-300 group p-0">
                  <div className="flex items-center gap-4 px-6 pt-8 pb-2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <feature.icon className="h-6 w-6 text-[#1a2236]" />
                    </div>
                    <span className="text-lg font-bold theme-text-light">{feature.title}</span>
                  </div>
                  <div className="px-6 pb-8 pt-2 flex-1 flex flex-col justify-center">
                    <p className="text-base theme-text-muted font-medium text-left">{feature.description}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto items-start">
            {competitionPrograms.map((program, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2, duration: 0.6 }}
                className="relative group h-full"
              >
                {/* Background glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${program.color} rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500`}></div>
                
                <Card className="relative h-full flex flex-col bg-[#1a2236]/90 backdrop-blur-sm border border-yellow-400/20 shadow-2xl hover:shadow-3xl transition-all duration-500 group-hover:scale-105 rounded-3xl overflow-hidden">
                  {/* Header with gradient background */}
                  <div className="relative bg-gradient-to-br from-[#1a2236] to-[#2a3246] p-8 theme-text-light">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-400/10 rounded-full -translate-y-12 translate-x-12"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-yellow-400/10 rounded-full translate-y-8 -translate-x-8"></div>
                    
                    <div className="relative z-10 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-400/20 rounded-xl mb-4 backdrop-blur-sm">
                        <h3 className="text-xl font-black text-yellow-400 px-2">{program.name}</h3>
                      </div>
                      <h3 className="text-2xl font-bold mb-3 theme-text-light">{program.name}</h3>
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400/20 rounded-full text-sm font-semibold backdrop-blur-sm text-yellow-400">
                        <Users className="w-4 h-4 flex-shrink-0" />
                        <span>{program.grades}</span>
                      </div>
                    </div>
                  </div>                                     <CardContent className="flex-1 flex flex-col p-8">
                     {/* Timeline Details */}
                     <div className="space-y-4 mb-8">
                       <h4 className="text-base font-bold theme-text-light mb-4 flex items-center gap-2">
                         <Clock className="w-5 h-5 text-yellow-400" />
                         Timeline
                       </h4>
                       <div className="space-y-3">
                         <div className="flex justify-between items-center p-4 bg-yellow-400/10 rounded-xl border border-yellow-400/20">
                           <span className="text-sm font-semibold theme-text-light flex-1">Long Term:</span>
                           <Badge className="bg-yellow-400 text-[#1a2236] font-bold px-3 py-1.5 rounded-full text-sm flex-shrink-0 ml-3">{program.timeline.lt}</Badge>
                         </div>
                         <div className="flex justify-between items-center p-4 bg-yellow-400/10 rounded-xl border border-yellow-400/20">
                           <span className="text-sm font-semibold theme-text-light flex-1">Fast Track:</span>
                           <Badge className="bg-yellow-400 text-[#1a2236] font-bold px-3 py-1.5 rounded-full text-sm flex-shrink-0 ml-3">{program.timeline.ft}</Badge>
                         </div>
                       </div>
                     </div>
                     
                     {/* Program Details */}
                     <div className="space-y-4 mb-8">
                       <h4 className="text-base font-bold theme-text-light mb-4 flex items-center gap-2">
                         <Target className="w-5 h-5 text-yellow-400" />
                         Program Details
                       </h4>
                       <div className="space-y-3">
                         <div className="flex justify-between items-center p-4 bg-yellow-400/10 rounded-xl border border-yellow-400/20">
                           <span className="text-sm font-semibold theme-text-light flex-1">Sessions:</span>
                           <Badge className="bg-yellow-400 text-[#1a2236] font-bold px-3 py-1.5 rounded-full text-sm flex-shrink-0 ml-3">{program.sessions}</Badge>
                         </div>
                         <div className="flex flex-col p-4 bg-yellow-400/10 rounded-xl border border-yellow-400/20">
                           <span className="text-sm font-semibold theme-text-light mb-2">Assessments:</span>
                           <Badge className="bg-yellow-400 text-[#1a2236] font-bold px-3 py-1.5 rounded-full text-sm w-fit">{program.assessments}</Badge>
                         </div>
                       </div>
                     </div>
                     
                     {/* Fees */}
                     <div className="space-y-4 mb-8">
                       <h4 className="text-base font-bold theme-text-light mb-4 flex items-center gap-2">
                         <Briefcase className="w-5 h-5 text-yellow-400" />
                         Investment
                       </h4>
                       <div className="space-y-3">
                         <div className="flex justify-between items-center p-4 bg-yellow-400/10 rounded-xl border border-yellow-400/20">
                           <div className="flex flex-col flex-1 min-w-0 gap-1 items-start">
                             <span className="text-sm font-semibold theme-text-light">Long Term</span>
                             <span className="text-xs theme-text-muted">Extended preparation</span>
                           </div>
                           <span className="font-bold text-xl text-yellow-400 ml-3 whitespace-nowrap">{program.fees.lt}</span>
                         </div>
                         <div className="flex justify-between items-center p-4 bg-yellow-400/10 rounded-xl border border-yellow-400/20">
                           <div className="flex flex-col flex-1 min-w-0 gap-1 items-start">
                             <span className="text-sm font-semibold theme-text-light">Fast Track</span>
                             <span className="text-xs theme-text-muted">Intensive preparation</span>
                           </div>
                           <span className="font-bold text-xl text-yellow-400 ml-3 whitespace-nowrap">{program.fees.ft}</span>
                         </div>
                       </div>
                     </div>
                    
                    {/* Spacer to push button to bottom */}
                    <div className="flex-1"></div>
                    
                    {/* CTA Button */}
                    <Button className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:scale-105 transition-all duration-300 text-[#1a2236] font-bold py-3 rounded-xl shadow-lg hover:shadow-xl mt-auto">
                      <Zap className="w-4 h-4 mr-2" />
                      Enroll Now
                    </Button>
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
                    <div className="flex-1" />
                    <Button variant="outline" className="w-full border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-[#1a2236] transition-colors mt-2">
                      Learn More
                    </Button>
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
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center pt-4">
              <Button className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#1a2236] hover:from-yellow-300 hover:to-yellow-400 px-6 shadow-lg font-bold">
                Start Your Journey
              </Button>
              <Button variant="outline" className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-[#1a2236] px-6 font-bold">
                Schedule Assessment
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
      <Footer />
      <Chatbot />
    </main>
  );
} 