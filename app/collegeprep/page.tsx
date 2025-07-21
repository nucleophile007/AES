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
import { BookOpen, Star, Target, Users, FileText, Trophy, Lightbulb, Globe, Calendar, ArrowRight, CheckIcon } from "lucide-react";

const goals = [
  {
    icon: Target,
    title: "Strength-based Discovery",
    description: "Identify each student’s core strengths, define their academic direction, and guide them to align evolving interests with these strengths.",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: Lightbulb,
    title: "Research & Competitive Excellence",
    description: "Build standout profiles through research projects, Olympiads, science fairs, coding competitions, and social impact initiatives.",
    color: "from-teal-500 to-teal-600",
  },
  {
    icon: FileText,
    title: "Strategic College Planning",
    description: "Curate a balanced college list, craft compelling essays, and help students articulate their stories for admissions success.",
    color: "from-orange-500 to-orange-600",
  },
];

const highlights = [
  {
    icon: Trophy,
    title: "Olympiads & Competitions",
    description: "National and international Olympiads, science fairs, and coding competitions to showcase excellence.",
    color: "from-yellow-500 to-yellow-600",
  },
  {
    icon: BookOpen,
    title: "Research Projects",
    description: "Original research projects that demonstrate intellectual curiosity and initiative.",
    color: "from-green-500 to-green-600",
  },
  {
    icon: Users,
    title: "Social Impact Initiatives",
    description: "Leadership and community service projects to build a well-rounded profile.",
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
];

const faqs = [
  {
    question: "What is the UACHIEVE program?",
    answer: "UACHIEVE is our flagship college prep program designed to empower students to reach their college dreams through strength-based discovery, research, and strategic planning.",
  },
  {
    question: "How do you help with college essays?",
    answer: "We guide students in brainstorming, drafting, and refining essays to ensure their authentic story shines through.",
  },
  {
    question: "What types of competitions do you support?",
    answer: "We support participation in Olympiads, science fairs, coding competitions, and other academic contests.",
  },
  {
    question: "Can you help with college selection?",
    answer: "Yes, we help curate a balanced college list tailored to each student’s strengths and aspirations.",
  },
  {
    question: "How do I get started?",
    answer: "Book a free 60-min counseling session or download our College Prep Flyer for more information.",
  },
];

// Merged FAQ data
const mergedFaqs = [
  { question: "How do I choose a college essay topic?", answer: "We help you brainstorm topics that reflect your unique story and strengths." },
  { question: "How many drafts should I write?", answer: "Most students go through 3-5 drafts with our expert feedback before finalizing." },
  { question: "When should I start my applications?", answer: "We recommend starting in the summer before senior year, but earlier is even better!" },
  { question: "Do you help with Common App and UC applications?", answer: "Yes, we guide you through all major application platforms." },
  { question: "Do you help with FAFSA and scholarships?", answer: "Yes, we provide resources and guidance for financial aid and scholarship applications." },
  { question: "What is the CSS Profile?", answer: "The CSS Profile is an additional financial aid form required by some colleges. We help you understand and complete it." },
  { question: "What is the ideal college prep timeline?", answer: "We provide a personalized timeline, but generally recommend starting in 10th or 11th grade." },
  { question: "Can I join the program in my senior year?", answer: "Yes, but starting earlier allows for more comprehensive support." },
  { question: "How do I get started?", answer: "Book a free 60-min counseling session or download our College Prep Flyer for more information." },
  { question: "Is the program online or in-person?", answer: "We offer both online and in-person options to fit your needs." },
];

// Downloadable Resources data
const resources = [
  { name: "College Prep Flyer", link: "#", icon: FileText },
  { name: "Application Checklist", link: "#", icon: CheckIcon },
  { name: "Essay Brainstorming Guide", link: "#", icon: Lightbulb },
  { name: "Financial Aid Guide", link: "#", icon: BookOpen },
];

// Sample College List/Acceptances data
const colleges = [
  { name: "Stanford University", logo: "/college-logos/stanford.png" },
  { name: "UC Berkeley", logo: "/college-logos/berkeley.png" },
  { name: "MIT", logo: "/college-logos/mit.png" },
  { name: "Harvard University", logo: "/college-logos/harvard.png" },
  { name: "UCLA", logo: "/college-logos/ucla.png" },
  { name: "Princeton University", logo: "/college-logos/princeton.png" },
  { name: "Yale University", logo: "/college-logos/yale.png" },
  { name: "Caltech", logo: "/college-logos/caltech.png" },
];

// Workshops & Events data
const events = [
  { title: "Essay Bootcamp", date: "July 15, 2024", description: "Intensive workshop to help you brainstorm, draft, and polish your college essays.", icon: FileText, badge: "Workshop", color: "from-blue-500 to-blue-600" },
  { title: "College Application Webinar", date: "August 5, 2024", description: "Live Q&A and walkthrough of the Common App and UC application process.", icon: Globe, badge: "Webinar", color: "from-teal-500 to-teal-600" },
  { title: "Financial Aid Night", date: "September 10, 2024", description: "Learn about FAFSA, scholarships, and maximizing your aid package.", icon: BookOpen, badge: "Info Session", color: "from-orange-500 to-orange-600" },
];

// Timeline data
const timeline = [
  { step: "1", title: "Strengths Assessment", description: "Discover your academic and extracurricular strengths.", icon: Star },
  { step: "2", title: "College List Curation", description: "Build a balanced list of best-fit colleges.", icon: Globe },
  { step: "3", title: "Profile Building", description: "Engage in research, competitions, and leadership activities.", icon: Trophy },
  { step: "4", title: "Essay & Application Guidance", description: "Craft compelling essays and complete applications.", icon: FileText },
  { step: "5", title: "Financial Aid & Scholarships", description: "Apply for aid and scholarships with expert support.", icon: BookOpen },
  { step: "6", title: "Decision & Transition", description: "Choose your college and prepare for the next chapter!", icon: Calendar },
];

export default function CollegePrepPage() {
  return (
    <>
      <Header />
      {/* Hero/Intro Section */}
      <section className="pt-24 pb-20 bg-gradient-to-br from-brand-light-blue via-white to-brand-light-blue/50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <Badge className="bg-brand-orange/10 text-brand-orange border-brand-orange/20">
                  🎓 College Prep
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold text-text-dark leading-tight">
                  UACHIEVE: Empowering Students to Reach Their College Dreams
                </h1>
                <blockquote className="text-xl text-brand-blue italic border-l-4 border-brand-blue pl-4">
                  “To help students discover their strengths, understand who they are, and align their aspirations with the right educational path.”
                </blockquote>
                <p className="text-xl text-text-light leading-relaxed">
                  Through our UACHIEVE program, we guide students to identify best-fit institutions that reflect both their personality and potential. Our approach is rooted in strength-based discovery, research, and strategic planning.
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
                <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/20 to-brand-teal/20 rounded-3xl transform rotate-6"></div>
                <div className="relative bg-white p-8 rounded-3xl shadow-2xl border">
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-brand-blue">Our Mission</h3>
                    <p className="text-base text-text-light">
                      To help students discover their strengths, understand who they are, and align their aspirations with the right educational path. Interests may evolve, but strengths nurtured through years of dedication form a reliable foundation for success.
                    </p>
                    <div className="flex flex-row gap-4 justify-center">
                      <Button className="bg-gradient-to-r from-brand-blue to-brand-teal px-6">
                        <ArrowRight className="mr-2 h-5 w-5" /> Download College Prep Flyer
                      </Button>
                      <Button variant="outline" className="border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white px-6">
                        <Calendar className="mr-2 h-5 w-5" /> Book Free 60-min Counseling Session
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Approach/Goals Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-brand-blue/10 text-brand-blue">Our Approach</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-text-dark mb-6">How We Guide Your College Journey</h2>
            <p className="text-xl text-text-light max-w-3xl mx-auto">
              Our approach is designed to help students build standout profiles, showcase intellectual curiosity, and achieve competitive excellence through research, competitions, and strategic planning.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {goals.map((goal, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full flex flex-col items-center bg-gradient-to-br from-brand-blue/10 to-brand-teal/10 border-2 border-brand-blue/10 hover:border-brand-blue/30 hover:shadow-xl transition-all duration-300 group rounded-2xl">
                  <CardHeader className="flex flex-col items-center pt-8 pb-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-teal flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                      <goal.icon className="h-8 w-8 text-white" />
                    </div>
                    <Badge className="mb-2 bg-brand-blue/10 text-brand-blue text-xs px-3 py-1 rounded-full font-semibold">{goal.title}</Badge>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col items-center justify-center pb-8">
                    <p className="text-base font-semibold text-text-dark text-center mb-2">{goal.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Program Highlights Section */}
      <section className="py-20 bg-gradient-to-br from-brand-light-blue/30 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-brand-orange/10 text-brand-orange">Program Highlights</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-text-dark mb-6">What Sets Our College Prep Apart</h2>
            <p className="text-xl text-text-light max-w-3xl mx-auto">From research projects to essay guidance, we help students build a profile that stands out to top colleges.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {highlights.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full flex flex-col items-center bg-white border-2 border-brand-blue/10 hover:border-brand-blue/30 hover:shadow-xl transition-all duration-300 group rounded-2xl">
                  <CardHeader className="flex flex-col items-center pt-8 pb-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                      <item.icon className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-center mb-1 text-text-dark">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col items-center justify-center pb-8">
                    <p className="text-base font-medium text-text-light text-center">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-brand-blue/10 text-brand-blue">College Prep Journey</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-text-dark mb-6">Your Path to College Success</h2>
            <p className="text-xl text-text-light max-w-3xl mx-auto">Follow our proven step-by-step process to maximize your college admissions potential.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-8">
            {timeline.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="relative bg-white rounded-2xl shadow-md border-t-4 border-brand-blue hover:border-brand-teal transition-all duration-300 flex flex-col items-center p-6 group min-h-[320px]">
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-brand-blue to-brand-teal flex items-center justify-center shadow-lg border-4 border-white z-10">
                    <span className="text-xl font-bold text-white">{item.step}</span>
                  </div>
                  <div className="mt-8 mb-3 w-10 h-10 rounded-full bg-gradient-to-br from-brand-blue to-brand-teal flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="font-semibold text-lg text-text-dark text-center mb-1">{item.title}</div>
                  <div className="text-sm text-text-light text-center">{item.description}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Workshops & Events Section */}
      <section className="py-20 bg-gradient-to-br from-brand-light-blue/30 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-brand-orange/10 text-brand-orange">Workshops & Events</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-text-dark mb-6">Upcoming College Prep Events</h2>
            <p className="text-xl text-text-light max-w-3xl mx-auto">Join our expert-led workshops and webinars to boost your college application success.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="relative bg-white/70 backdrop-blur-md rounded-3xl shadow-lg flex flex-col items-center p-8 min-h-[340px] group transition-all duration-300 hover:shadow-2xl hover:bg-white/90">
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-brand-blue to-brand-teal flex items-center justify-center shadow-lg border-4 border-white z-10">
                    <event.icon className="h-8 w-8 text-white" />
                  </div>
                  <Badge className="absolute top-4 left-4 bg-brand-orange text-white text-xs shadow">{event.badge}</Badge>
                  <div className="mt-10 font-bold text-xl text-text-dark text-center">{event.title}</div>
                  <div className="italic text-brand-blue text-sm text-center mb-2">{event.date}</div>
                  <div className="text-base text-text-light text-center mb-6 flex-1">{event.description}</div>
                  <Button className="rounded-full bg-gradient-to-r from-brand-blue to-brand-teal text-white px-8 py-2 shadow-md hover:shadow-lg transition-all focus:ring-2 focus:ring-brand-blue/50">Register</Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample College List/Acceptances Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-brand-green/10 text-brand-green">College Acceptances</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-text-dark mb-6">Where Our Students Have Been Accepted</h2>
            <p className="text-xl text-text-light max-w-3xl mx-auto">Our students have gained admission to top colleges and universities across the country.</p>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 items-center justify-center">
            {colleges.map((college, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="flex flex-col items-center"
              >
                <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center mb-3 border border-brand-blue/10 hover:scale-110 hover:shadow-xl transition-transform duration-300">
                  <img src={college.logo} alt={college.name} className="w-16 h-16 object-contain" />
                </div>
                <span className="text-sm font-semibold text-text-dark text-center mt-2">{college.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Downloadable Resources Section */}
      <section className="py-20 bg-gradient-to-br from-brand-light-blue/30 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-brand-blue/10 text-brand-blue">Downloadable Resources</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-text-dark mb-6">Helpful Guides & Checklists</h2>
            <p className="text-xl text-text-light max-w-3xl mx-auto">Access our most popular resources to support your college application journey.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {resources.map((resource, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="h-full flex flex-col items-center bg-gradient-to-br from-brand-light-blue/40 to-white rounded-xl shadow-md p-8 group transition-all duration-300 hover:shadow-xl hover:bg-brand-light-blue/60 min-h-[260px]">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-blue to-brand-teal flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <resource.icon className="h-7 w-7 text-white" />
                  </div>
                  <div className="text-lg font-bold text-text-dark text-center mb-4">{resource.name}</div>
                  <Button className="w-full rounded-full bg-gradient-to-r from-brand-blue to-brand-teal text-white px-6 py-2 shadow-md hover:shadow-lg transition-all focus:ring-2 focus:ring-brand-blue/50 mt-auto" asChild>
                    <a href={resource.link} download>
                      Download
                    </a>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section (merged, speech bubble style) */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-brand-blue/10 text-brand-blue">FAQ</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-text-dark mb-6">Frequently Asked College Prep Questions</h2>
            <p className="text-xl text-text-light max-w-3xl mx-auto">Find answers to common questions about our college prep services, application process, and more.</p>
          </motion.div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible>
              <div className="space-y-6">
                {mergedFaqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="border-none">
                    <div>
                      <AccordionTrigger className="flex items-center gap-4 px-6 py-4 bg-brand-light-blue/30 rounded-full font-bold text-lg text-brand-blue hover:bg-brand-blue/10 hover:no-underline transition-all">
                        <div className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center text-white font-bold">Q</div>
                        <span className="text-left">{faq.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="relative px-0 pb-4 pt-0">
                        <div className="relative bg-white rounded-2xl shadow-lg p-6 text-base font-medium text-text-dark mt-2 ml-10">
                          <div className="absolute -left-4 top-6 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-white"></div>
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
      <section className="py-20 bg-gradient-to-r from-brand-blue to-brand-teal">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-white space-y-8"
          >
            <h2 className="text-4xl lg:text-5xl font-bold">
              Ready to Start Your College Journey?
            </h2>
            <p className="text-xl opacity-90">
              Book your free 60-min counseling session or download our College Prep Flyer to learn more about how we can help you achieve your college dreams.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-brand-blue hover:bg-gray-100"
              >
                <ArrowRight className="mr-2 h-5 w-5" /> Download College Prep Flyer
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white text-brand-blue hover:bg-gray-100 hover:text-brand-blue"
              >
                <Calendar className="mr-2 h-5 w-5" /> Book Free 60-min Counseling Session
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
      <Footer />
      <Chatbot />
    </>
  );
}