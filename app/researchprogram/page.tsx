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
import { BookOpen, Star, Award, Users, FileText, Lightbulb, Globe, ArrowRight, CheckCircle, Trophy, GraduationCap, Calendar } from "lucide-react";

const highlights = [
  {
    icon: Lightbulb,
    title: "Tailored Research",
    description: "Align your project with your specific interests and future aspirations.",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: Star,
    title: "Boost Your Academic Profile",
    description: "Enhance your intellectual vitality ratings and stand out to top universities.",
    color: "from-teal-500 to-teal-600",
  },
  {
    icon: Trophy,
    title: "Aligned Extracurriculars",
    description: "Elevate your portfolio with a valuable, high-impact project.",
    color: "from-orange-500 to-orange-600",
  },
  {
    icon: BookOpen,
    title: "Publication Opportunities",
    description: "Submit your research to respected technical journals and gain recognition.",
    color: "from-green-500 to-green-600",
  },
  {
    icon: Globe,
    title: "Pathway to Success",
    description: "Open doors to research-oriented career paths in elite institutions and beyond.",
    color: "from-purple-500 to-purple-600",
  },
];

const benefits = [
  {
    icon: Award,
    title: "Stand Out for Admissions",
    description: "Nearly a third of UPenn’s class of 2026 and over 40% of Caltech’s class of 2027 had high school research experience.",
  },
  {
    icon: GraduationCap,
    title: "Mentorship by Experts",
    description: "Work with Ph.D. mentors and experienced researchers to develop your project.",
  },
  {
    icon: Users,
    title: "Collaborative & Individual Tracks",
    description: "Choose to work solo or in a group, with flexible project options.",
  },
  {
    icon: FileText,
    title: "Publication & Recognition",
    description: "Opportunities to publish in technical journals and present at competitions.",
  },
];

const researchPrograms = [
  {
    icon: BookOpen,
    title: "Independent Research Track",
    description: "Design and execute your own research project with personalized mentorship from PhD-level experts.",
    features: [
      "One-on-one mentorship with PhD researchers",
      "Flexible timeline and project scope",
      "Publication guidance and support",
      "Conference presentation opportunities"
    ],
    duration: "3-6 months",
    badge: {
      text: "Individual",
      color: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20"
    }
  },
  {
    icon: Users,
    title: "Collaborative Research Track",
    description: "Work in small teams on cutting-edge research projects across multiple disciplines.",
    features: [
      "Small group collaboration (3-4 students)",
      "Cross-disciplinary project options",
      "Peer learning and knowledge sharing",
      "Joint publication opportunities"
    ],
    duration: "4-8 months",
    badge: {
      text: "Team-based",
      color: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20"
    }
  },
  {
    icon: Globe,
    title: "Research Competition Track",
    description: "Prepare research projects specifically for national and international competitions.",
    features: [
      "Competition-focused research design",
      "Presentation and pitch training",
      "Award submission guidance",
      "National competition entry support"
    ],
    duration: "6-12 months",
    badge: {
      text: "Competition",
      color: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20"
    }
  },
  {
    icon: Star,
    title: "Publication Fast Track",
    description: "Accelerated research program designed specifically for journal publication success.",
    features: [
      "Journal-quality research methodology",
      "Professional writing and editing support",
      "Peer review preparation",
      "Publication submission assistance"
    ],
    duration: "8-12 months",
    badge: {
      text: "Publication",
      color: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20"
    }
  }
];

const faqs = [
  {
    question: "Who can join the AES Research Program?",
    answer: "The program is open to motivated middle and high school students interested in research across STEM, humanities, and social sciences.",
  },
  {
    question: "What kind of research projects can I do?",
    answer: "Projects are tailored to your interests—ranging from science and engineering to humanities and business. You’ll work with mentors to define and execute your project.",
  },
  {
    question: "Will I get published?",
    answer: "Many students submit their work to respected technical journals and competitions. While publication is not guaranteed, we provide guidance and support throughout the process.",
  },
  {
    question: "How does research help with college admissions?",
    answer: "Research demonstrates critical thinking, initiative, and intellectual vitality—qualities highly valued by top universities.",
  },
  {
    question: "How do I get started?",
    answer: "Click the button below to book a free consultation and learn how to join the AES Research Program.",
  },
];

export default function ResearchProgram() {
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
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <Badge className="bg-yellow-400/10 text-yellow-400 border-yellow-400/20">
                  🧑‍🔬 Research Programs
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold theme-text-light leading-tight">
                  AES Explorers: Research for Future Leaders
                </h1>
                <blockquote className="text-xl theme-text-light italic border-l-4 border-yellow-400 pl-4">
                  &quot;A well-executed research project demonstrates your ability to think critically, solve problems, and engage with the unknown.&quot;
                </blockquote>
                <p className="text-xl theme-text-muted leading-relaxed">
                  Stand out in the college admissions process with a research project tailored to your interests. Gain mentorship, publication opportunities, and a pathway to success at top universities.
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
                    <h3 className="text-xl font-semibold text-yellow-400">Why Research?</h3>
                    <ul className="list-disc pl-6 text-base theme-text-muted space-y-2">
                      <li>Boost your academic profile and intellectual vitality ratings.</li>
                      <li>Showcase initiative, critical thinking, and problem-solving skills.</li>
                      <li>Open doors to Ivy League and top university admissions.</li>
                      <li>Gain recognition through publication and competitions.</li>
                    </ul>
                    <div className="flex flex-row gap-4 justify-center">
                      <Button className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#1a2236] hover:from-yellow-300 hover:to-yellow-400 px-6">
                        <ArrowRight className="mr-2 h-5 w-5" /> Book Free Consultation
                      </Button>
                      <Button variant="outline" className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-[#1a2236] px-6">
                        <Calendar className="mr-2 h-5 w-5" /> Download Program Flyer
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-20 theme-bg-dark">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-yellow-400/10 text-yellow-400">Program Highlights</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold theme-text-light mb-6">What Sets AES Research Apart</h2>
            <p className="text-xl theme-text-muted max-w-3xl mx-auto">From tailored mentorship to publication opportunities, AES Research Programs help you build a profile that stands out.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {highlights.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full flex flex-col items-center bg-[#1a2236]/90 backdrop-blur-sm border-2 border-yellow-400/20 hover:border-yellow-400/40 hover:shadow-xl transition-all duration-300 group rounded-2xl">
                  <CardHeader className="flex flex-col items-center pt-8 pb-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                      <item.icon className="h-8 w-8 text-white" />
                    </div>
                    <Badge className="mb-2 bg-yellow-400/10 text-yellow-400 border-yellow-400/20 text-xs px-3 py-1 rounded-full font-semibold">{item.title}</Badge>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col items-center justify-center pb-8">
                    <p className="text-base font-semibold theme-text-light text-center mb-2">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 theme-bg-dark">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-yellow-400/10 text-yellow-400">Why Join?</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold theme-text-light mb-6">Benefits of AES Research Programs</h2>
            <p className="text-xl theme-text-muted max-w-3xl mx-auto">AES Explorers is designed to help you thrive in university and beyond.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full flex flex-col items-center bg-[#1a2236]/90 backdrop-blur-sm border-2 border-yellow-400/20 hover:border-yellow-400/40 hover:shadow-xl transition-all duration-300 group rounded-2xl">
                  <CardHeader className="flex flex-col items-center pt-8 pb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                      <item.icon className="h-7 w-7 text-[#1a2236]" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-center mb-1 theme-text-light">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col items-center justify-center pb-8">
                    <p className="text-base font-medium theme-text-muted text-center">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Programs Section */}
      <section className="py-20 theme-bg-dark">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-yellow-400/10 text-yellow-400">Our Programs</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold theme-text-light mb-6">Research Programs</h2>
            <p className="text-xl theme-text-muted max-w-3xl mx-auto">
              Explore our tailored research programs designed to guide you from idea to impact.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {researchPrograms.map((program, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="h-full"
              >
                <Card className="h-full bg-[#1a2236]/90 backdrop-blur-sm border border-yellow-400/20 hover:border-yellow-400/40 group transition-all duration-300 hover:shadow-xl rounded-2xl">
                  <CardHeader className="pb-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        <program.icon className="h-6 w-6 text-[#1a2236]" />
                      </div>
                      <div>
                        <Badge className={`mb-2 ${program.badge.color}`} variant="outline">
                          {program.badge.text}
                        </Badge>
                        <CardTitle className="text-xl font-bold theme-text-light group-hover:text-yellow-400 transition-colors">
                          {program.title}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="space-y-4">
                      <p className="theme-text-muted text-base leading-relaxed">{program.description}</p>
                      
                      <div>
                        <h4 className="font-semibold theme-text-light mb-2">Key Features:</h4>
                        <ul className="list-disc list-inside space-y-1 theme-text-muted text-sm">
                          {program.features.map((feature, i) => (
                            <li key={i}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="pt-2">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-yellow-400/10 text-yellow-400 border border-yellow-400/20">
                          {program.duration}
                        </span>
                      </div>
                    </div>
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
            <p className="text-xl theme-text-muted max-w-3xl mx-auto">Find answers to common questions about AES Research Programs.</p>
          </motion.div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible>
              <div className="space-y-6">
                {faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="border-none">
                    <div>
                      <AccordionTrigger className="flex items-center gap-4 px-6 py-4 bg-[#1a2236]/90 backdrop-blur-sm rounded-full font-bold text-lg text-yellow-400 hover:bg-yellow-400/10 hover:no-underline transition-all border border-yellow-400/20">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 flex items-center justify-center text-[#1a2236] font-bold">Q</div>
                        <span className="text-left">{faq.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="relative px-0 pb-4 pt-0">
                        <div className="relative bg-[#1a2236]/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 text-base font-medium theme-text-muted mt-2 ml-10 border border-yellow-400/20">
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
              🧑‍🔬 Start Your Research Journey
            </Badge>
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold theme-text-light leading-tight">
              Ready to Start Your Research Journey?
            </h2>
            
            <p className="text-base sm:text-lg lg:text-xl theme-text-muted px-4 leading-relaxed max-w-3xl mx-auto">
              Book your free consultation to learn how AES Research Programs can help you stand out and succeed.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center pt-4">
              <Button className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#1a2236] hover:from-yellow-300 hover:to-yellow-400 px-6 shadow-lg font-bold">
                <ArrowRight className="mr-2 h-5 w-5" /> Book Free Consultation
              </Button>
              <Button variant="outline" className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-[#1a2236] px-6 font-bold">
                <Calendar className="mr-2 h-5 w-5" /> Download Program Flyer
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