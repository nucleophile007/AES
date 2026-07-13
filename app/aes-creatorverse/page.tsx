"use client";
import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Award, BookOpen, FileText, GraduationCap, Handshake, Headphones, Instagram, Megaphone, Mic, PenTool, Podcast, ScrollText, ShieldCheck, Sparkles, Star, TrendingUp, Video } from "lucide-react";
import Footer from "@/components/home/Footer";
import Link from "next/link";
import Chatbot from "@/components/home/Chatbot";
import Header from "@/components/home/Header";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

const programFeatures = [
  {
    icon: Star,
    title: "Expert Guidance",
    description: "Taught by SMEs, digital media enthusiasts and social skills experts.",
  },
  {
    icon: Users,
    title: "Community Building",
    description: "Connect with like-minded creators and build meaningful networks in your field of interest.",
  },
  {
    icon: TrendingUp,
    title: "Audience Development",
    description: "Learn strategies to grow your following and engage effectively with your target audience.",
  },
  {
    icon: Award,
    title: "Brand Development",
    description: "Create and maintain a compelling personal brand that stands out in the digital landscape.",
  },
];

const focusSkillIcons = [
  {
    icon: BookOpen,
    label: "Reading & Analysis",
    description:
      "Develop your critical thinking and analytical skills. Reviewer for Student Newsletters/Journals, Content copy writer for digital media campaigns, Start a review blog, YouTube channel, or Instagram Reels on book summaries, reading challenges, or author interviews.",
    examples: [
      { label: "Literary Critic", icon: ScrollText },
      { label: "Copywriting & Strategy", icon: FileText },
      { label: "Editorial Publishing", icon: BookOpen },
      { label: "Digital Broadcasting", icon: Video },
      { label: "Short-form Storytelling", icon: Instagram },
      { label: "Audio Script Editing", icon: Headphones },
      { label: "Journalistic Interviewing", icon: Mic },
    ],
  },
  {
    icon: PenTool,
    label: "Writing & Publishing",
    description:
      "Express your creativity and share your ideas with the world. Run a blog/Publish a book based on Student's field of interests, Content creator or freelance writer, School newspaper editor or club president, Youth ambassador or Writing tutor for younger students.",
    examples: [
      { label: "Digital Publishing", icon: PenTool },
      { label: "Published Author", icon: BookOpen },
      { label: "Digital Strategist", icon: Sparkles },
      { label: "Freelance Journalism", icon: FileText },
      { label: "Student Editorial Board", icon: ScrollText },
      { label: "Executive Leadership", icon: ShieldCheck },
      { label: "Community Leadership", icon: Handshake },
      { label: "Writing Mentorship", icon: GraduationCap },
    ],
  },
  {
    icon: Mic,
    label: "Speaking & Broadcasting",
    description:
      "Express your creativity and share your ideas with the world. Run a blog/Publish a book based on Student's field of interests, Content creator or freelance writer, School newspaper editor or club president, Youth ambassador or Writing tutor for younger students.",
    examples: [
      { label: "Debate & Oratory", icon: Mic },
      { label: "Public Speaking Lead", icon: Megaphone },
      { label: "Official Spokesperson", icon: Users },
      { label: "Council Delegation", icon: Handshake },
      { label: "Podcast Production", icon: Podcast },
      { label: "Video Hosting", icon: Video },
      { label: "Keynote Presentations", icon: Sparkles },
      { label: "Event Facilitation", icon: Mic },
    ],
  },
  {
    icon: Megaphone,
    label: "Leadership & Impact",
    description:
      "Make an impact by leading and inspiring your community. Organizes community drives, campaigns, workshops, or fundraisers, Facilitates town halls, youth forums, or service projects, Club president or student council leader, Volunteer coordinator or outreach ambassador.",
    examples: [
      { label: "Community Initiatives", icon: Users },
      { label: "Executive President", icon: ShieldCheck },
      { label: "Campaign Management", icon: Megaphone },
      { label: "Skill Workshops", icon: GraduationCap },
      { label: "Philanthropy & Fundraising", icon: Handshake },
      { label: "Civic Town Halls", icon: Users },
      { label: "Youth Policy Forums", icon: Mic },
      { label: "Social Impact Projects", icon: Sparkles },
      { label: "Volunteer Coordination", icon: Handshake },
      { label: "Global Outreach", icon: Megaphone },
    ],
  },
];

const faqs = [
  {
    question: "What is the AES CREATORVERSE program?",
    answer: "AES CREATORVERSE is a creative and interactive program designed to build the social and community profile of students by helping them drive campaigns, raise their voices through digital media, and host shows of their interest. It's where creativity flows beyond horizons.",
  },
  {
    question: "Who is this program designed for?",
    answer: "The program is designed for middle and high school students who want to develop their creative skills, build a social media presence, and establish themselves as leaders in their communities through various forms of content creation and community engagement.",
  },
  {
    question: "What skills will I develop?",
    answer: "You'll develop skills in reading and content review, writing and content creation, public speaking and presentation, and leadership and community engagement. Each area is tailored to your interests and career goals.",
  },
  {
    question: "How does the personalized approach work?",
    answer: "We assess your innate talents, interests, and future career goals to create a customized social profile map. This guides your development path and helps you build a unique personal brand that aligns with your aspirations.",
  },
  {
    question: "What kind of support do I receive?",
    answer: "You'll receive step-by-step coaching from SMEs, digital media enthusiasts, and social skills experts. This includes regular mentorship sessions, progress tracking, and guidance on content creation and audience development.",
  },
];

export default function AESCreatorversePage() {
  return (
    <main className="min-h-screen theme-bg-dark flex flex-col">
      <Header />
      {/* Hero Section */}
      <section
        id="home"
        className="pt-16 pb-10 lg:pt-24 lg:pb-12 theme-bg-dark relative overflow-hidden"
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
              ✨ AES CREATORVERSE
            </Badge>
            <h1 className="text-6xl lg:text-7xl font-black bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent mb-4 animate-slide-in-bottom">
              AES CREATORVERSE
            </h1>
            <h2 className="text-4xl lg:text-5xl font-bold theme-text-light mb-6">
              Creative Profile Building Program
            </h2>
            <p className="text-lg theme-text-muted max-w-4xl mx-auto animate-slide-in-bottom" style={{ animationDelay: '0.2s' }}>
              A creative and interactive program to build your social and community profile by helping you drive campaigns, raise your voice through digital media, and host shows of your interest.
            </p>
            <blockquote className="text-xl text-yellow-400 italic border-l-4 border-yellow-400 pl-4 mt-6 max-w-3xl mx-auto animate-slide-in-bottom" style={{ animationDelay: '0.4s' }}>
              &quot;Where ACHARYA leads, creativity flows beyond horizons&quot;
              <span className="block text-sm text-yellow-400 mt-2">- AES Motto</span>
            </blockquote>
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
                 Book Free Session
               </Button>
               </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Focus Skills Section */}
      <section className="pt-20 pb-20 theme-bg-dark">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-yellow-400/10 text-yellow-400">Focus Areas</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold theme-text-light">Creative Horizons</h2>
            <p className="text-xl theme-text-muted max-w-3xl mx-auto mt-4">
              Develop essential skills in four key areas that will help you build your digital presence and community impact.
            </p>
          </motion.div>
          <div className="grid gap-10 lg:gap-12 mt-16 max-w-7xl mx-auto">
            {focusSkillIcons.map((skill, index) => (
              <motion.div
                key={skill.label}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="group relative"
              >
                {/* Decorative background glow that activates on hover */}
                <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-yellow-400/20 via-amber-500/20 to-orange-500/20 opacity-0 blur-xl transition duration-700 group-hover:opacity-100 mix-blend-screen"></div>
                
                {/* Main Card */}
                <div className="relative flex flex-col lg:flex-row gap-8 lg:gap-12 rounded-[2rem] bg-[#131b2f]/90 backdrop-blur-xl border border-white/5 p-8 lg:p-12 transition-all duration-500 hover:border-yellow-400/20 hover:bg-[#151e32]/95 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_40px_rgba(250,204,21,0.07)] overflow-hidden">
                  
                  {/* Subtle inner gradient */}
                  <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-yellow-400/5 blur-3xl transition-opacity duration-500 group-hover:opacity-100 opacity-50 pointer-events-none"></div>

                  {/* Left Column - Category Info */}
                  <div className="flex-shrink-0 lg:w-[35%] flex flex-col items-center text-center lg:items-start lg:text-left relative z-10">
                    <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-600 text-[#0f172a] shadow-[0_0_40px_-10px_rgba(250,204,21,0.6)] transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-[0_0_50px_-5px_rgba(250,204,21,0.8)]">
                      <skill.icon className="h-10 w-10" />
                    </div>
                    <h3 className="mb-4 text-3xl lg:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-300 group-hover:from-yellow-200 group-hover:to-amber-400 transition-all duration-500">
                      {skill.label}
                    </h3>
                    <div className="h-1.5 w-16 rounded-full bg-gradient-to-r from-yellow-400 to-amber-600 mb-6 lg:mx-0 mx-auto opacity-70 group-hover:opacity-100 group-hover:w-24 transition-all duration-500" />
                    <p className="text-slate-400 text-base lg:text-lg leading-relaxed max-w-sm group-hover:text-slate-300 transition-colors duration-300">
                      {skill.description}
                    </p>
                  </div>

                  {/* Right Column - Pills Grid */}
                  <div className="flex-grow flex items-center relative z-10">
                    <div className="flex flex-wrap gap-3 lg:gap-4 justify-center lg:justify-start w-full">
                      {skill.examples.map((example, i) => (
                        <motion.div
                          key={example.label}
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          whileInView={{ opacity: 1, scale: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.05 + 0.2, duration: 0.4 }}
                          className="group/pill flex items-center gap-3.5 rounded-full bg-[#1e293b]/60 backdrop-blur-sm border border-slate-700/50 hover:bg-[#1e293b] hover:border-yellow-400/40 py-2.5 lg:py-3 pl-2.5 lg:pl-3 pr-5 lg:pr-6 transition-all duration-300 shadow-sm hover:shadow-[0_8px_20px_-6px_rgba(250,204,21,0.25)] hover:-translate-y-1 cursor-default"
                        >
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-700/80 to-slate-800/80 group-hover/pill:from-yellow-400/20 group-hover/pill:to-amber-500/20 text-slate-300 group-hover/pill:text-yellow-400 ring-1 ring-white/5 group-hover/pill:ring-yellow-400/40 transition-all duration-300">
                            <example.icon className="h-5 w-5" />
                          </div>
                          <span className="whitespace-nowrap text-sm lg:text-base font-semibold text-slate-300 group-hover/pill:text-white transition-colors duration-300">
                            {example.label}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
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
            <h2 className="text-4xl lg:text-5xl font-bold theme-text-light mb-6">Comprehensive Creative Development</h2>
            <p className="text-xl theme-text-muted max-w-3xl mx-auto">
              Our structured approach helps you build a compelling social profile and establish your unique voice in the digital world.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
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
            <p className="text-xl theme-text-muted max-w-3xl mx-auto">Find answers to common questions about the AES CREATORVERSE program.</p>
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
              🚀 Start Your Creative Journey
            </Badge>
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold theme-text-light leading-tight">
              Ready to Create Your Digital Presence?
            </h2>
            
            <p className="text-base sm:text-lg lg:text-xl theme-text-muted px-4 leading-relaxed max-w-3xl mx-auto">
              Join AES CREATORVERSE and build a compelling social profile that showcases your creativity and leadership.
            </p>
            
            <div className="flex justify-center pt-4">
              <Link href="/book-session">
              <Button className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#1a2236] hover:from-yellow-300 hover:to-yellow-400 px-6 shadow-lg font-bold">
                Schedule Consultation
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
