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
import { BookOpen, Star, Target, Users, FileText, Trophy, Lightbulb, Globe, Calendar, ArrowRight, CheckIcon, Timer, ListChecks, BarChart, ClipboardList, MessageCircle, Play, TrendingUp, Check, Sparkles } from "lucide-react";
import ImageVideoCard from "@/components/ui/image-video-card";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";

// EventCard Component to fix React Hooks rules
const EventCard = ({ event, index }: { event: any; index: number }) => {
  const [isVideoPlaying, setIsVideoPlaying] = React.useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.2, duration: 0.6, type: "spring", stiffness: 100 }}
      className="group"
    >
      <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-500 hover:scale-105">
        {/* Video Player - Full Card Coverage */}
        {isVideoPlaying && (
          <div className="relative w-full h-full min-h-[400px]">
            <video
              className="w-full h-full object-cover absolute inset-0"
              autoPlay
              loop
              muted
              playsInline
              controls
            >
              <source src={event.video} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            {/* Close Button */}
            <button
              onClick={() => setIsVideoPlaying(false)}
              className="absolute top-4 right-4 w-10 h-10 bg-black/70 text-white rounded-full flex items-center justify-center hover:bg-black/90 transition-colors z-10 text-xl font-bold"
            >
              ×
            </button>
            
            {/* Video Overlay Content */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
              <h3 className="font-bold text-xl text-white mb-2 leading-tight">
                {event.title}
              </h3>
              <div className="text-yellow-300 text-sm font-medium mb-3">
                {event.date}
              </div>
              <p className="text-white/90 text-base leading-relaxed mb-4">
                {event.description}
              </p>
              
              {/* Register Button */}
              <Button className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:from-yellow-300 hover:to-yellow-400 font-semibold">
                <Calendar className="mr-2 h-4 w-4" />
                Register
              </Button>
            </div>
          </div>
        )}
        
        {/* Background Image (when video is not playing) */}
        {!isVideoPlaying && (
          <div className="relative h-48 bg-cover bg-center" style={{ backgroundImage: `url(${event.image})` }}>
            <div className="absolute inset-0 bg-black/20"></div>
            
            {/* Badge */}
            <div className="absolute top-4 right-4">
              <span className="bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                {event.badge}
              </span>
            </div>
            
            {/* Play Button Overlay */}
            <button
              onClick={() => setIsVideoPlaying(true)}
              className="absolute inset-0 flex items-center justify-center cursor-pointer"
            >
              <div className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30 group-hover:scale-110 transition-transform duration-300">
                <Play className="w-8 h-8 text-black" />
              </div>
            </button>
          </div>
        )}
        
        {/* Content - Only show when video is not playing */}
        {!isVideoPlaying && (
          <div className="p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-b-2xl border-t border-blue-100/50">
            <h3 className="font-bold text-xl text-gray-800 mb-2 leading-tight">
              {event.title}
            </h3>
            <div className="text-indigo-600 text-sm font-medium mb-3">
              {event.date}
            </div>
            <p className="text-gray-700 text-base leading-relaxed mb-4">
              {event.description}
            </p>
            
            {/* Register Button */}
            <Button className="w-full bg-gradient-to-r from-indigo-400 to-purple-500 text-white hover:from-indigo-500 hover:to-purple-600 font-semibold shadow-md hover:shadow-lg transition-all duration-300">
              <Calendar className="mr-2 h-4 w-4" />
              Register
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const goals = [
  {
    icon: Target,
    title: "Personalized SAT Plan",
    description: `Customized study plans based on a thorough diagnostic test and your unique strengths and weaknesses. We work with you to set realistic goals and milestones, then create a week-by-week roadmap for your SAT journey. Your plan adapts as you progress, ensuring you always focus on the areas that will yield the biggest score gains. Regular check-ins and adjustments keep you on track and motivated. You'll never feel lost or overwhelmed—your coach is with you every step of the way.`,
    color: "from-blue-500 to-blue-600",
    image: "/hwa1.png",
  },
  {
    icon: BarChart,
    title: "Comprehensive Test Strategies & Tactics",
    description: `We identify your weakest SAT sections and target them with focused practice and proven strategies. You'll receive custom assignments, drills, and timed mini-tests to build confidence and accuracy. We track your progress after every session and celebrate every improvement, no matter how small. Our approach is data-driven, so you'll always know exactly where you stand and what to work on next. Many students see 150-300+ point improvements after completing our program.`,
    color: "from-teal-500 to-teal-600",
    image: "/hwa2.png",
  },
  {
    icon: ClipboardList,
    title: "Data-Driven Feedback",
    description: `Master the SAT with our expert strategies for time management, question analysis, and test-day confidence. We teach you how to approach every question type, eliminate wrong answers, and manage your pacing for each section. You'll practice with real SAT questions and full-length, timed exams to build stamina and reduce anxiety. Our coaches share insider tips and test-day routines to help you perform your best when it counts.`,
    color: "from-orange-500 to-orange-600",
    image: "/hwa3.png",
  },
];

const highlights = [
  {
    icon: ListChecks,
    title: "Diagnostic Testing",
    description: "Initial and ongoing assessments to track progress and adjust study plans.",
    color: "from-yellow-500 to-yellow-600",
  },
  {
    icon: Timer,
    title: "Time Management",
    description: "Practice under timed conditions to build speed and accuracy.",
    color: "from-green-500 to-green-600",
  },
  {
    icon: BookOpen,
    title: "Expert Instruction",
    description: "Experienced SAT coaches with a track record of high score improvements.",
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: MessageCircle,
    title: "1-on-1 Feedback",
    description: "Personalized feedback and support throughout your SAT journey.",
    color: "from-blue-500 to-blue-600",
  },
];

const timeline = [
  { step: "1", title: "Diagnostic Test", description: "Assess your current SAT level and identify strengths and weaknesses.", icon: ListChecks },
  { step: "2", title: "Personalized Plan", description: "Create a custom study roadmap based on your goals.", icon: Target },
  { step: "3", title: "Skill Building", description: "Master SAT Math, Reading, and Writing with targeted lessons.", icon: BookOpen },
  { step: "4", title: "Practice Tests", description: "Take full-length, timed SAT practice exams.", icon: Timer },
  { step: "5", title: "Review & Refine", description: "Analyze results, address weak areas, and fine-tune strategies.", icon: BarChart },
  { step: "6", title: "Test Day Success", description: "Enter the SAT with confidence and a proven plan!", icon: Trophy },
];





const faqs = [
  { question: "How soon should I start prep?", answer: "Ideally 3–6 months before test day to allow for thorough practice and strategy refinement." },
  { question: "Are materials included?", answer: "Yes! You'll receive digital access to official SAT/PSAT practice tests, worksheets, and strategy guides." },
  { question: "Can I switch between online and in-person?", answer: "Absolutely, flexibility is built into every package." },
  { question: "What score improvements do students typically see?", answer: "Many students see 150-300+ point improvements after completing our program." },
  { question: "How do I get started?", answer: "Schedule your free 30-minute consultation to get started on your SAT/PSAT prep journey." },
];

const packages = [
  {
    name: "Starter",
    hours: "10 hours",
    icon: Target,
    description: "2 diagnostic sessions + 8 coaching sessions",
    mentorPrice: 50,
    selfStudyPrice: 30,
    features: ["2 diagnostic sessions", "8 coaching sessions", "Basic study materials", "Email support"],
    popular: false,
    gradient: "from-emerald-500 to-teal-600",
    accentColor: "emerald",
    illustration: "/learning-journey-cartoon.png",
  },
  {
    name: "Accelerator",
    hours: "20 hours",
    icon: TrendingUp,
    description: "2 diagnostic sessions + 18 coaching sessions + 2 full-length mock tests",
    mentorPrice: 45,
    selfStudyPrice: 25,
    features: [
      "2 diagnostic sessions",
      "18 coaching sessions",
      "2 full-length mock tests",
      "Priority email support",
      "Study progress tracking",
    ],
    popular: true,
    gradient: "from-blue-500 to-indigo-600",
    accentColor: "blue",
    illustration: "/progress-mountain-climb.png",
  },
     {
     name: "Elite",
     hours: "40 hours",
     icon: Trophy,
     description:
       "2 diagnostic sessions + 34 coaching sessions + 4 detailed mock test feedback sessions + 4 full-length mock tests",
     mentorPrice: 40,
     selfStudyPrice: 20,
     features: [
       "2 diagnostic sessions",
       "34 coaching sessions",
       "4 detailed mock test feedback sessions",
       "4 full-length mock tests",
       "Priority scheduling",
       "24/7 support",
       "Custom study plan",
     ],
     popular: false,
     gradient: "from-purple-500 to-pink-600",
     accentColor: "purple",
     illustration: "/successful-celebration.png",
   },
];

export default function SATCoachingPage() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [satDate, setSatDate] = React.useState("");
  const [satScore, setSatScore] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState("");
  const [error, setError] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");
    try {
      // Simulate API call
      await new Promise((res) => setTimeout(res, 1200));
      setSuccess("SAT session booked successfully! We'll contact you soon.");
      setName(""); setEmail(""); setPhone(""); setSatDate(""); setSatScore("");
    } catch {
      setError("Failed to book SAT session.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
            <Badge className="mb-4 bg-yellow-400/10 text-yellow-400 border-yellow-400/20">
              🎯 SAT & PSAT Coaching
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold theme-text-light mb-6">
              Boost Your SAT & PSAT Scores with Expert Coaching
            </h1>
            <p className="text-lg theme-text-muted max-w-4xl mx-auto animate-slide-in-bottom" style={{ animationDelay: '0.2s' }}>
              Unlock Your Dream College Opportunities through personalized, data-driven SAT/PSAT prep designed to strengthen fundamentals, conquer weaknesses, and master advanced strategies.
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
                  <ArrowRight className="mr-2 h-5 w-5" /> Book Free Consultation
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

             {/* Program Highlights Section - SAT Infographic */}
       <section className="py-20 theme-bg-dark">
         <div className="min-h-screen py-12 px-4 relative overflow-hidden" style={{ backgroundColor: "hsl(220, 45%, 20%)" }}>
           <div className="absolute inset-0 overflow-hidden">
             <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 blur-3xl animate-pulse"></div>
             <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 blur-3xl animate-pulse delay-1000"></div>
             <div
               className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/5 to-blue-500/5 blur-3xl animate-spin"
               style={{ animationDuration: "20s" }}
             ></div>
           </div>

           <div className="max-w-6xl mx-auto relative z-10">
             <div className="text-center mb-16">
               <Badge className="mb-4 bg-yellow-400/10 text-yellow-400 border-yellow-400/20">Program Highlights</Badge>
               <h2 className="text-4xl lg:text-5xl font-bold theme-text-light mb-6">What Sets Our SAT Prep Apart</h2>
               <p className="text-xl theme-text-muted max-w-3xl mx-auto">
                 From diagnostic testing to expert feedback, our program is designed for real results.
               </p>
             </div>

             <div className="flex items-end justify-center gap-0 mb-16">
               {[
                 {
                   number: "1",
                   title: "Personalized SAT Plan",
                   points: ["Custom study schedule", "Current level assessment", "Target score planning", "Time optimization"],
                   color: "bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600",
                   height: "h-48",
                   glowColor: "shadow-yellow-500/50",
                 },
                 {
                   number: "2",
                   title: "Comprehensive Test Strategies & Tactics",
                   points: [
                     "Section-specific techniques",
                     "Time management skills",
                     "Question approach methods",
                     "Practice strategies",
                   ],
                   color: "bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700",
                   height: "h-56",
                   glowColor: "shadow-blue-500/50",
                 },
                 {
                   number: "3",
                   title: "Data-Driven Feedback",
                   points: ["Performance analytics", "Strength identification", "Weakness targeting", "Progress tracking"],
                   color: "bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500",
                   height: "h-64",
                   glowColor: "shadow-yellow-500/50",
                 },
                 {
                   number: "4",
                   title: "Targeted Score Improvement",
                   points: ["High-impact focus areas", "Personalized practice", "Score maximization", "Final preparation"],
                   color: "bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800",
                   height: "h-72",
                   glowColor: "shadow-blue-500/50",
                 },
                 {
                   number: "5",
                   title: "Success",
                   points: ["Target score achieved"],
                   color: "bg-gradient-to-br from-yellow-500 via-yellow-600 to-amber-600",
                   height: "h-80",
                   glowColor: "shadow-yellow-500/60",
                   isSuccess: true,
                 },
               ].map((step, index) => (
                 <div key={index} className="flex flex-col items-center relative group">
                   {step.isSuccess && (
                     <div className="mb-6 flex flex-col items-center relative">
                       <div className="relative">
                         <Trophy className="w-20 h-20 text-yellow-400 animate-bounce drop-shadow-2xl" />
                         <div className="absolute inset-0 bg-yellow-400/30 rounded-full blur-xl animate-pulse"></div>
                         <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-300 animate-spin" />
                         <Sparkles className="absolute -bottom-1 -left-2 w-6 h-6 text-yellow-200 animate-ping" />
                       </div>
                       <span className="text-2xl font-black text-yellow-300 mt-2 drop-shadow-lg animate-pulse">
                         Success!
                       </span>
                     </div>
                   )}

                   <div className="absolute bottom-full mb-6 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none z-20 transform group-hover:scale-105">
                     <div className="relative w-80">
                       {/* Arrow pointing down */}
                       <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-cyan-400"></div>
                       
                       {/* Main card */}
                       <div className="bg-gradient-to-br from-cyan-900/95 via-slate-800/90 to-purple-900/95 backdrop-blur-xl border border-cyan-400/30 p-6 shadow-2xl rounded-2xl relative overflow-hidden">
                         {/* Animated background pattern */}
                         <div className="absolute inset-0 opacity-20">
                           <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-400/20 via-transparent to-purple-400/20"></div>
                           <div className="absolute top-4 right-4 w-20 h-20 border border-cyan-400/30 rounded-full animate-spin" style={{ animationDuration: '8s' }}></div>
                           <div className="absolute bottom-4 left-4 w-16 h-16 border border-purple-400/30 rounded-full animate-spin" style={{ animationDuration: '12s', animationDirection: 'reverse' }}></div>
                         </div>
                         
                         {/* Glow effect */}
                         <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-purple-500/10 rounded-2xl blur-xl"></div>
                         
                         <div className="relative z-10">
                           {/* Header with icon and title */}
                           <div className="flex items-center gap-4 mb-4">
                             <div className={`w-12 h-12 ${step.color} rounded-xl flex items-center justify-center text-white font-black text-lg flex-shrink-0 shadow-lg ring-2 ring-white/20 relative overflow-hidden`}>
                               {/* Inner glow */}
                               <div className="absolute inset-0 bg-white/20 rounded-xl"></div>
                               {step.isSuccess ? <Trophy className="w-6 h-6 relative z-10" /> : <span className="relative z-10">{step.number}</span>}
                             </div>
                             <div className="flex-1">
                               <h3 className="text-lg font-bold text-cyan-100 mb-1 leading-tight">{step.title}</h3>
                               <div className="w-16 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full"></div>
                             </div>
                           </div>
                           
                           {/* Points list */}
                           <div className="space-y-3">
                             {step.points.map((point, pointIndex) => (
                               <div key={pointIndex} className="flex items-center gap-3 group/item">
                                 {/* Animated bullet point */}
                                 <div className="relative">
                                   <div className="w-2.5 h-2.5 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full animate-pulse"></div>
                                   <div className="absolute inset-0 w-2.5 h-2.5 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full animate-ping opacity-75"></div>
                                 </div>
                                 
                                 {/* Point text with hover effect */}
                                 <span className="text-sm text-slate-300 group-hover/item:text-cyan-200 transition-colors duration-200 font-medium leading-relaxed">
                                   {point}
                                 </span>
                               </div>
                             ))}
                           </div>
                           
                           {/* Bottom accent */}
                           <div className="mt-4 pt-3 border-t border-cyan-400/20">
                             <div className="flex items-center justify-between text-xs text-cyan-400/70">
                               <span>Step {step.number}</span>
                               <span className="flex items-center gap-1">
                                 <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
                                 {/* <span>Hover for details</span> */}
                               </span>
                             </div>
                           </div>
                         </div>
                       </div>
                     </div>
                   </div>

                   <div className="relative">
                     {/* Glow effect background */}
                     <div
                       className={`absolute inset-0 ${step.color} ${step.height} w-48 blur-xl opacity-60 ${step.glowColor} shadow-2xl animate-pulse`}
                     ></div>

                     {/* Main bar */}
                     <Card
                       className={`${step.color} ${step.height} w-48 relative flex flex-col justify-center items-center p-6 text-white shadow-2xl hover:shadow-3xl transition-all duration-500 cursor-pointer hover:scale-110 hover:-translate-y-2 border-0`}
                     >
                       {/* Inner glow */}
                       <div className="absolute inset-2 bg-white/10"></div>

                       {/* Number with enhanced styling */}
                       <span className="text-7xl font-black relative z-10 drop-shadow-2xl transform transition-transform duration-300 group-hover:scale-110">
                         {step.number}
                       </span>

                       {/* Floating particles effect */}
                       <div className="absolute inset-0 overflow-hidden">
                         {[...Array(6)].map((_, i) => (
                           <div
                             key={i}
                             className="absolute w-1 h-1 bg-white/40 rounded-full animate-ping"
                             style={{
                               left: `${20 + i * 15}%`,
                               top: `${30 + i * 10}%`,
                               animationDelay: `${i * 500}ms`,
                               animationDuration: "2s",
                             }}
                           ></div>
                         ))}
                       </div>

                       {/* Shimmer effect */}
                       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer"></div>
                     </Card>
                   </div>
                 </div>
               ))}
             </div>
           </div>

           <style jsx>{`
             @keyframes shimmer {
               0% { transform: translateX(-100%) skewX(-12deg); }
               100% { transform: translateX(200%) skewX(-12deg); }
             }
             .animate-shimmer {
               animation: shimmer 3s infinite;
             }
           `}</style>
         </div>
       </section>

      {/* Approach/Goals Section */}
      <section className="py-20 theme-bg-dark">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-yellow-400/10 text-yellow-400 border-yellow-400/20">Our Approach</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold theme-text-light mb-6">How We Achieve Your SAT Success</h2>
            <p className="text-xl theme-text-muted max-w-3xl mx-auto">
              Our approach is designed to help students build confidence, master test strategies, and achieve their target SAT score.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {goals.map((goal, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.15, duration: 0.8, type: "spring", stiffness: 100 }}
                className="group cursor-pointer"
              >
                <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl overflow-hidden transition-all duration-700 hover:shadow-3xl hover:-translate-y-4 hover:rotate-1">
                  {/* Massive Image Section */}
                  <div className="relative h-96 overflow-hidden">
                    <Image 
                      src={goal.image} 
                      alt={goal.title}
                      width={700}
                      height={384}
                      className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-1000 ease-out"
                    />
                    
                    {/* Dynamic Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/60 group-hover:from-black/20 group-hover:to-black/40 transition-all duration-700"></div>
                    
                    {/* Floating Badge */}
                    <div className="absolute top-8 left-8">
                      <div className={`px-4 py-2 rounded-full backdrop-blur-md ${
                        i === 0 
                          ? "bg-blue-500/90 text-white" 
                          : i === 1 
                          ? "bg-emerald-500/90 text-white"
                          : "bg-purple-500/90 text-white"
                      }`}>
                        <span className="text-sm font-semibold">Step {i + 1}</span>
                      </div>
                    </div>
                    
                    {/* Icon in Corner */}
                    <div className="absolute top-8 right-8 w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center group-hover:bg-white/30 transition-all duration-500">
                      <goal.icon className={`h-8 w-8 ${
                        i === 0 
                          ? "text-blue-100" 
                          : i === 1 
                          ? "text-emerald-100"
                          : "text-purple-100"
                      } group-hover:text-white transition-colors duration-500`} />
                    </div>
                    
                    {/* Title Overlay */}
                    <div className="absolute bottom-8 left-8 right-8">
                      <h3 className="text-3xl font-black text-white mb-3 drop-shadow-2xl group-hover:scale-105 transition-transform duration-500">
                        {goal.title}
                      </h3>
                      <div className={`w-16 h-1 rounded-full ${
                        i === 0 
                          ? "bg-blue-400" 
                          : i === 1 
                          ? "bg-emerald-400"
                          : "bg-purple-400"
                      }`}></div>
                    </div>
                  </div>
                  
                  {/* Expandable Content Card */}
                  <div className="bg-white/80 backdrop-blur-sm transition-all duration-700 ease-in-out overflow-hidden max-h-0 group-hover:max-h-96 opacity-0 group-hover:opacity-100">
                    <div className="p-8">
                      <p className="text-gray-700 leading-relaxed text-base">
                        {goal.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Glow Effect */}
                  <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${
                    i === 0 
                      ? "shadow-[0_0_50px_rgba(59,130,246,0.3)]" 
                      : i === 1 
                      ? "shadow-[0_0_50px_rgba(16,185,129,0.3)]"
                      : "shadow-[0_0_50px_rgba(147,51,234,0.3)]"
                  }`}></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


             {/* Packages Section */}
       <section id="packages" className="py-20 theme-bg-dark">
         <div className="container mx-auto px-4">
           <motion.div
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             className="text-center mb-16"
           >
             <Badge className="mb-4 bg-yellow-400/10 text-yellow-400 border-yellow-400/20">SAT Prep Journey</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold theme-text-light mb-6">Pathways to Choose</h2>
            <p className="text-xl theme-text-muted max-w-3xl mx-auto">Mentor-based coaching & self-study coaching packages designed for your learning style.</p>
           </motion.div>
           
           {/* <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto relative"> */}
             {/* Background decorative elements */}
             {/* <div className="absolute -top-10 -left-10 w-32 h-32 bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-full blur-3xl opacity-60"></div>
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br from-yellow-100/30 to-orange-100/30 rounded-full blur-3xl opacity-60"></div>
             {packages.map((pkg, index) => {
               const IconComponent = pkg.icon
               return (
                 <motion.div
                   key={pkg.name}
                   initial={{ opacity: 0, y: 30 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   transition={{ delay: index * 0.1 }}
                 >
                                       <Card
                      className={`relative overflow-hidden transition-all duration-500 hover:scale-[1.02] group flex flex-col h-full ${
                        pkg.popular
                          ? "ring-2 ring-blue-500/50 shadow-2xl scale-[1.02] bg-gradient-to-br from-blue-50 via-white to-indigo-50/40 border border-blue-200/30"
                          : "shadow-xl hover:shadow-2xl bg-gradient-to-br from-slate-50 via-white to-gray-50/40 border border-slate-200/30"
                      } border-0 backdrop-blur-sm`}
                    >
                     {pkg.popular && (
                       <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 z-10">
                         <Badge className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white font-bold px-6 py-2 text-sm shadow-lg animate-pulse">
                           <Sparkles className="w-4 h-4 mr-1" />
                           Most Popular
                         </Badge>
                       </div>
                     )}

                     <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                     <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                     <CardHeader className="text-center pb-6 pt-12 relative z-10">
                       <div className="w-full h-48 mx-auto mb-6 rounded-2xl overflow-hidden shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-105 border border-slate-200/50">
                         <Image
                           src={pkg.illustration || "/placeholder.svg"}
                           alt={`${pkg.name} package illustration`}
                           width={400}
                           height={192}
                           className="w-full h-full object-cover"
                         />
                       </div>

                                               <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">{pkg.name}</h3>
                        <p className="text-base text-slate-500 font-medium bg-slate-100/50 px-3 py-1 rounded-full inline-block">({pkg.hours})</p>
                     </CardHeader>

                     <CardContent className="flex-1 flex flex-col relative z-10">
                       <div className="flex-1 space-y-8"> */}
                                                   {/* <p className="text-slate-600 leading-relaxed text-center px-2 text-sm">{pkg.description}</p> */}

                         {/* <div className="space-y-4">
                           <div
                             className={`relative p-4 bg-gradient-to-r from-${pkg.accentColor}-50 to-${pkg.accentColor}-100/50 rounded-xl border border-${pkg.accentColor}-200/50 shadow-sm hover:shadow-md transition-all duration-300 group-hover:scale-[1.02]`}
                           >
                             <div className="flex justify-between items-center">
                               <span className="text-sm font-semibold text-slate-700">Mentor-based</span>
                               <div className="text-right">
                                 <span className="text-3xl font-bold text-slate-900">${pkg.mentorPrice}</span>
                                 <span className="text-slate-600 text-sm">/hr</span>
                               </div>
                             </div>
                           </div>

                           <div className="relative p-4 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-xl border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-300 group-hover:scale-[1.02]">
                             <div className="flex justify-between items-center">
                               <span className="text-sm font-semibold text-slate-700">Self-Study</span>
                               <div className="text-right">
                                 <span className="text-3xl font-bold text-slate-900">${pkg.selfStudyPrice}</span>
                                 <span className="text-slate-600 text-sm">/hr</span>
                               </div>
                             </div>
                           </div>
                         </div>

                         <div className="space-y-4">
                              <h4 className="font-bold text-slate-900 text-base border-b border-slate-200/50 pb-2 bg-gradient-to-r from-slate-50 to-transparent px-2 py-1 rounded-t-lg">
                              What's included:
                            </h4>
                           <ul className="space-y-3">
                             {pkg.features.map((feature, featureIndex) => (
                               <li key={featureIndex} className="flex items-start text-slate-600 group/item p-2 rounded-lg hover:bg-slate-50/50 transition-all duration-200">
                                 <div
                                   className={`w-5 h-5 rounded-full bg-gradient-to-r ${pkg.gradient} flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 group-hover/item:scale-110 transition-transform duration-200 shadow-sm`}
                                 >
                                   <Check className="w-3 h-3 text-white" />
                                 </div>
                                   <span className="leading-relaxed text-sm font-medium">{feature}</span>
                               </li>
                             ))}
                           </ul>
                         </div>
                       </div>

                       <div className="mt-8">
                         <Button
                              className={`w-full py-3 font-bold text-base transition-all duration-300 transform hover:scale-[1.02] focus:scale-[1.02] shadow-lg hover:shadow-xl border-0 ${
                             pkg.popular
                               ? "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-blue-500/25"
                               : `bg-gradient-to-r ${pkg.gradient} hover:shadow-2xl text-white shadow-slate-500/25`
                           }`}
                         >
                           Get Started
                         </Button>
                       </div>
                     </CardContent>
                   </Card>
                 </motion.div>
               )
             })}
           </div> */}
           <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {packages.map((pkg, index) => {
            const IconComponent = pkg.icon
            return (
              <Card
                key={pkg.name}
                className={`relative overflow-hidden transition-all duration-500 hover:scale-[1.02] group flex flex-col ${
                  pkg.popular
                    ? "ring-2 ring-blue-400/50 shadow-2xl scale-[1.02] bg-slate-800/90 backdrop-blur-sm border border-blue-400/20"
                    : "shadow-lg hover:shadow-2xl bg-slate-800/80 backdrop-blur-sm border border-slate-600/30 hover:border-slate-500/50"
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white font-bold px-6 py-2 text-sm shadow-lg animate-pulse">
                      <Sparkles className="w-4 h-4 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <CardHeader className="text-center pb-6 pt-12 relative z-10">
                  <div className="w-full h-48 mx-auto mb-6 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 ring-1 ring-slate-600/20">
                    <Image
                      src={pkg.illustration || "/placeholder.svg"}
                      alt={`${pkg.name} package illustration`}
                      width={400}
                      height={192}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <h3 className="text-3xl font-bold text-cyan-300 mb-2">{pkg.name}</h3>
                  <p className="text-lg text-cyan-200 font-medium">({pkg.hours})</p>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col relative z-10">
                  <div className="flex-1 space-y-8">
                    <div className="space-y-4">
                      <div
                        className={`relative p-4 bg-gradient-to-r from-${pkg.accentColor}-900/30 to-${pkg.accentColor}-800/20 rounded-xl border border-${pkg.accentColor}-500/30 backdrop-blur-sm`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold text-cyan-200">Mentor-based</span>
                          <div className="text-right">
                            <span className="text-3xl font-bold text-cyan-300">${pkg.mentorPrice}</span>
                            <span className="text-cyan-200 text-sm">/hr</span>
                          </div>
                        </div>
                      </div>

                      <div className="relative p-4 bg-slate-700/50 rounded-xl border border-slate-600/30 backdrop-blur-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold text-cyan-200">Self-Study</span>
                          <div className="text-right">
                            <span className="text-3xl font-bold text-cyan-300">${pkg.selfStudyPrice}</span>
                            <span className="text-cyan-200 text-sm">/hr</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold text-cyan-300 text-lg border-b border-slate-600/50 pb-2">
                        What&apos;s included:
                      </h4>
                      <ul className="space-y-3">
                        {pkg.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start text-cyan-200 group/item">
                            <div
                              className={`w-5 h-5 rounded-full bg-gradient-to-r ${pkg.gradient} flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 group-hover/item:scale-110 transition-transform duration-200 shadow-lg`}
                            >
                              <Check className="w-3 h-3 text-white" />
                            </div>
                            <span className="leading-relaxed">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* <div className="mt-8">
                    <Button
                      className={`w-full py-4 font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] focus:scale-[1.02] shadow-lg hover:shadow-xl ${
                        pkg.popular
                          ? "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-blue-500/25 hover:shadow-blue-500/40"
                          : `bg-gradient-to-r ${pkg.gradient} hover:shadow-2xl text-white shadow-lg`
                      }`}
                    >
                      Get Started
                    </Button>
                  </div> */}
                </CardContent>
              </Card>
            )
          })}
        </div>
         </div>
       </section>





      {/* Success Stories Section */}
      <section className="py-20 theme-bg-dark">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-yellow-400/10 text-yellow-400 border-yellow-400/20">Success Stories</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold theme-text-light mb-6">Student Success Stories</h2>
            <p className="text-xl theme-text-muted max-w-3xl mx-auto">Hear from our successful students about their SAT prep journey and score improvements.</p>
          </motion.div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-[#1a2236]/90 to-[#1a2236]/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-yellow-400/20">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto">
                  <Star className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold theme-text-light">Coming Soon!</h3>
                <div className="bg-gradient-to-br from-[#1a2236]/90 to-[#1a2236]/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-yellow-400/20">
                  <p className="text-lg theme-text-muted leading-relaxed mb-4">
                    We&apos;re currently collecting success stories from our SAT prep students. Check back soon to read inspiring stories about score improvements and college admissions success!
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">Stay Tuned</div>
                      <div className="text-lg theme-text-muted">More stories coming</div>
                    </div>
                    <div className="text-3xl text-yellow-400">✨</div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">Success</div>
                      <div className="text-lg theme-text-muted">Stories ahead</div>
                    </div>
                  </div>
                </div>
                
                {/* Coming Soon Message */}
                <div className="w-full max-w-2xl mx-auto">
                  <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border-2 border-yellow-400/30 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                        <Star className="h-8 w-8 text-white" />
                      </div>
                      <h4 className="text-xl font-bold text-yellow-400">Testimonials Coming Soon</h4>
                      <p className="text-yellow-300/80 text-sm">
                        We&apos;re gathering amazing success stories from our SAT students
                      </p>
                    </div>
                  </div>
                  <p className="text-sm theme-text-muted mt-3 text-center">
                    Check back soon for inspiring SAT success stories and score improvements
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      

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
              🚀 Start Your SAT Journey Today
            </Badge>
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold theme-text-light leading-tight">
              Ready to Crush the SAT & PSAT?
            </h2>
            
            <p className="text-base sm:text-lg lg:text-xl theme-text-muted px-4 leading-relaxed max-w-3xl mx-auto">
              Transform weaknesses into strengths with one chapter at a time. Experience the difference of personalized SAT/PSAT coaching. Unlock your potential now!
            </p>
            
            {/* Three Steps */}
            <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto pt-4">
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 bg-yellow-400/20 rounded-full flex items-center justify-center">
                  <CheckIcon className="h-5 w-5 text-yellow-400" />
                </div>
                <span className="text-sm theme-text-light">Schedule a Free Consultation</span>
              </div>
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 bg-yellow-400/20 rounded-full flex items-center justify-center">
                  <CheckIcon className="h-5 w-5 text-yellow-400" />
                </div>
                <span className="text-sm theme-text-light">Get Matched with the Right Coach</span>
              </div>
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 bg-yellow-400/20 rounded-full flex items-center justify-center">
                  <CheckIcon className="h-5 w-5 text-yellow-400" />
                </div>
                <span className="text-sm theme-text-light">Watch Your Score Improve</span>
              </div>
            </div>
            
            <div className="flex justify-center pt-4">
              <Link href="/book-session">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 hover:from-yellow-300 hover:to-yellow-400 text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold"
                >
                  <ArrowRight className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Get Started Today
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
                  <span>Expert SAT Coaching</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
      <section className="py-20 theme-bg-dark">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-yellow-400/10 text-yellow-400 border-yellow-400/20">FAQ</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold theme-text-light mb-6">Frequently Asked Questions</h2>
            <p className="text-xl theme-text-muted max-w-3xl mx-auto">Find answers to common questions about our SAT/PSAT coaching, practice tests, and more.</p>
          </motion.div>
          <div className="max-w-3xl mx-auto space-y-8">
            {faqs.map((faq, i) => (
              <Accordion type="single" collapsible key={i}>
                <AccordionItem value={`faq-${i}`} className="border-none">
                  <div>
                    <AccordionTrigger className="flex items-center gap-4 px-6 py-4 bg-yellow-400/10 rounded-full font-bold text-lg text-yellow-400 hover:bg-yellow-400/20 hover:no-underline transition-all">
                      <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-[#1a2236] font-bold">Q</div>
                      <span className="text-left">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="relative px-0 pb-4 pt-0">
                      <div className="relative bg-gradient-to-br from-[#1a2236]/90 to-[#1a2236]/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 text-base font-medium theme-text-light mt-2 ml-10 border border-yellow-400/20">
                        <div className="absolute -left-4 top-6 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-[#1a2236]"></div>
                        {faq.answer}
                      </div>
                    </AccordionContent>
                  </div>
                </AccordionItem>
              </Accordion>
            ))}
          </div>
        </div>
      </section>
      
      <Footer />
      <Chatbot />
    </>
  );
}
