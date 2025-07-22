"use client";
import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, Calculator, FlaskConical, Atom, Trophy, Star, Globe, Clock, AlertCircle } from "lucide-react";
import Footer from "@/components/home/Footer";
import Chatbot from "@/components/home/Chatbot";
import Header from "@/components/home/Header";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

const subjects = [
  {
    icon: Calculator,
    title: "Mathematics",
    description: "IM1, IM2, IM3, Algebra I/II, AP Pre-Calc, AP Calc AB/BC, Multivariate Calc, AP Stats, Linear Algebra",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: Atom,
    title: "Physics",
    description: "Regular, Honors, AP Physics I/II, AP Physics C - Mechanics/E&M",
    color: "from-teal-500 to-teal-600",
  },
  {
    icon: FlaskConical,
    title: "Chemistry",
    description: "Regular, Honors, NGSS, AP Chemistry",
    color: "from-orange-500 to-orange-600",
  },
  {
    icon: BookOpen,
    title: "Biology",
    description: "Regular, AP Biology",
    color: "from-green-500 to-green-600",
  },
];

const features = [
  {
    icon: Users,
    title: "Personalized Approach",
    description: "Each lesson tailored to the individual needs and learning pace of the student.",
  },
  {
    icon: Clock,
    title: "Flexible Options",
    description: "Face-to-face and online learning to suit your schedule.",
  },
  {
    icon: Star,
    title: "Strong Foundation",
    description: "Clear explanations, problem-solving strategies, and consistent support.",
  },
  {
    icon: Trophy,
    title: "Proven Results",
    description: "Students achieve higher grades and greater confidence.",
  },
  {
    icon: Globe,
    title: "Comprehensive Coverage",
    description: "All major subjects and levels from middle school to AP and beyond.",
  },
];

const events = [
  {
    title: "Math Bootcamp",
    date: "June 10–14, 2024",
    description: "Intensive review for Algebra and Pre-Calc students. Daily sessions with practice problems and quizzes.",
    icon: Calculator,
    badge: "Bootcamp",
    color: "from-blue-500 to-blue-600",
  },
  {
    title: "AP Exam Prep",
    date: "Ongoing",
    description: "Weekly sessions for AP Calculus and AP Physics. Includes mock tests and exam strategies.",
    icon: Atom,
    badge: "Exam Prep",
    color: "from-teal-500 to-teal-600",
  },
  {
    title: "Science Fair Workshop",
    date: "July 5, 2024",
    description: "Hands-on workshop to help students prepare for science fairs and research presentations.",
    icon: FlaskConical,
    badge: "Workshop",
    color: "from-orange-500 to-orange-600",
  },
];

const subjectHighlights = [
  {
    subject: "Mathematics",
    icon: Calculator,
    highlight: "98% of our students improved their grades within one semester.",
  },
  {
    subject: "Physics",
    icon: Atom,
    highlight: "AP Physics students scored an average of 4.7 on the AP exam.",
  },
  {
    subject: "Chemistry",
    icon: FlaskConical,
    highlight: "Our students consistently outperform state averages in AP Chemistry.",
  },
  {
    subject: "Biology",
    icon: BookOpen,
    highlight: "Personalized study plans help students master complex biology concepts.",
  },
];

const faqs = [
  {
    question: "What subjects do you tutor?",
    answer: "We offer tutoring in Mathematics, Physics, Chemistry, Biology, and more. See the 'Subjects We Cover' section above for details.",
  },
  {
    question: "Are sessions online or in-person?",
    answer: "Both options are available to fit your schedule and learning preferences.",
  },
  {
    question: "How do I book a session?",
    answer: "You can book a free assessment session using the button above or contact us for more information.",
  },
  {
    question: "What are your tutoring rates?",
    answer: "We offer custom packages based on your needs. Please contact us for a personalized quote.",
  },
  {
    question: "Who are your tutors?",
    answer: "Our tutors are experienced educators with advanced degrees in their fields. See our home page for faculty profiles.",
  },
];

export default function AcademicTutoringPage() {
  return (
    <>
      <Header />
      {/* Hero/Intro Section */}
      <section
        id="home"
        className="pt-24 pb-20 bg-gradient-to-br from-brand-light-blue via-white to-brand-light-blue/50 overflow-hidden"
      >
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
                  ✨ Academic Tutoring
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold text-text-dark leading-tight">
                  Personalized Tutoring for Every Student
                </h1>
                <blockquote className="text-xl text-brand-blue italic border-l-4 border-brand-blue pl-4">
                  “Every student can learn, just not on the same day, or in the same way.”
                  <span className="block text-sm text-text-light mt-2">- George Evans</span>
                </blockquote>
                <p className="text-xl text-text-light leading-relaxed">
                  We embrace this philosophy by crafting a personalized, student-centric approach rooted in decades of combined academic expertise. Whether you prefer face-to-face sessions or online learning, we provide flexible options to suit your schedule.
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
                    <h3 className="text-xl font-semibold text-brand-blue">Subjects We Cover</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {subjects.map((subject, i) => (
                        <Card key={i} className="flex flex-col items-center p-4 bg-gradient-to-br from-white to-brand-light-blue/10 border-brand-blue/10 hover:scale-103 hover:shadow-xl transition-transform transition-shadow duration-300">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${subject.color} flex items-center justify-center mb-3`}>
                            <subject.icon className="h-6 w-6 text-white" />
                          </div>
                          <CardTitle className="text-lg text-center mb-1">{subject.title}</CardTitle>
                          <CardDescription className="text-xs text-center">{subject.description}</CardDescription>
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

      {/* Why Choose Us Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-brand-blue/10 text-brand-blue">Why Choose Us?</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-text-dark mb-6">Our Tutoring Advantage</h2>
            <p className="text-xl text-text-light max-w-3xl mx-auto">
              Our goal is to help students build a strong foundation in these subjects, boost their confidence, and achieve academic success through clear explanations, problem-solving strategies, and consistent support.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full flex flex-col justify-center bg-white border-l-8 border-brand-blue shadow-md rounded-xl hover:shadow-xl hover:border-brand-teal transition-all duration-300 group p-0">
                  <div className="flex items-center gap-4 px-6 pt-8 pb-2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-blue to-brand-teal flex items-center justify-center group-hover:scale-105 transition-transform">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-lg font-bold text-text-dark">{feature.title}</span>
                  </div>
                  <div className="px-6 pb-8 pt-2 flex-1 flex flex-col justify-center">
                    <p className="text-base text-text-light font-medium text-left">{feature.description}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-20 bg-gradient-to-br from-brand-light-blue/30 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-brand-orange/10 text-brand-orange">Upcoming Events</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-text-dark mb-6">Stay Ahead with Our Special Programs</h2>
            <p className="text-xl text-text-light max-w-3xl mx-auto">Join our upcoming workshops and bootcamps to boost your learning and exam readiness.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full flex flex-col hover:shadow-xl transition-all duration-300 border-2 hover:border-brand-blue/20 group relative">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-brand-orange text-white text-xs">{event.badge}</Badge>
                      <span className="text-xs text-brand-blue font-semibold">{event.date}</span>
                    </div>
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${event.color} flex items-center justify-center mb-4 mx-auto`}>
                      <event.icon className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-center mb-1 text-text-dark">{event.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <p className="text-sm text-text-light text-center mb-4 font-medium">{event.description}</p>
                    <div className="flex-1" />
                    <Button variant="outline" className="w-full group-hover:bg-brand-blue group-hover:text-white transition-colors mt-2">
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Subject Highlights Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-brand-green/10 text-brand-green">Subject Highlights</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-text-dark mb-6">Our Track Record of Excellence</h2>
            <p className="text-xl text-text-light max-w-3xl mx-auto">See how our students excel in every subject with our proven tutoring methods.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {subjectHighlights.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full flex flex-col items-center bg-gradient-to-br from-brand-blue/10 to-brand-teal/10 border-2 border-brand-blue/10 hover:border-brand-blue/30 hover:shadow-xl transition-all duration-300 group rounded-2xl">
                  <CardHeader className="flex flex-col items-center pt-8 pb-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-teal flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                      <item.icon className="h-8 w-8 text-white" />
                    </div>
                    <Badge className="mb-2 bg-brand-blue/10 text-brand-blue text-xs px-3 py-1 rounded-full font-semibold">{item.subject}</Badge>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col items-center justify-center pb-8">
                    <p className="text-base font-semibold text-text-dark text-center mb-2">{item.highlight}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-br from-brand-light-blue/30 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-brand-blue/10 text-brand-blue">FAQ</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-text-dark mb-6">Frequently Asked Questions</h2>
            <p className="text-xl text-text-light max-w-3xl mx-auto">Find answers to common questions about our tutoring services, scheduling, and more.</p>
          </motion.div>
          <div className="max-w-2xl mx-auto">
            <Accordion type="single" collapsible>
              <div className="space-y-6">
                {faqs.map((faq, i) => (
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
              Ready to Boost Your Academic Success?
            </h2>
            <p className="text-xl opacity-90">
              Book your free assessment session today and experience personalized tutoring that makes a difference.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-brand-blue hover:bg-gray-100"
              >
                Book Free Session
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white text-brand-blue hover:bg-gray-100 hover:text-brand-blue"
              >
                Learn More
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