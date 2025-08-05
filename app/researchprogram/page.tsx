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

export default function ResearchProgramPage() {
  return (
    <>
      <Header />
      {/* Hero Section */}
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
                  🧑‍🔬 Research Programs
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold text-text-dark leading-tight">
                  AES Explorers: Research for Future Leaders
                </h1>
                <blockquote className="text-xl text-brand-blue italic border-l-4 border-brand-blue pl-4">
                  “A well-executed research project demonstrates your ability to think critically, solve problems, and engage with the unknown.”
                </blockquote>
                <p className="text-xl text-text-light leading-relaxed">
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
                <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/20 to-brand-teal/20 rounded-3xl transform rotate-6"></div>
                <div className="relative bg-white p-8 rounded-3xl shadow-2xl border">
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-brand-blue">Why Research?</h3>
                    <ul className="list-disc pl-6 text-base text-text-light space-y-2">
                      <li>Boost your academic profile and intellectual vitality ratings.</li>
                      <li>Showcase initiative, critical thinking, and problem-solving skills.</li>
                      <li>Open doors to Ivy League and top university admissions.</li>
                      <li>Gain recognition through publication and competitions.</li>
                    </ul>
                    <div className="flex flex-row gap-4 justify-center">
                      <Button className="bg-gradient-to-r from-brand-blue to-brand-teal px-6">
                        <ArrowRight className="mr-2 h-5 w-5" /> Book Free Consultation
                      </Button>
                      <Button variant="outline" className="border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white px-6">
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
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-brand-blue/10 text-brand-blue">Program Highlights</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-text-dark mb-6">What Sets AES Research Apart</h2>
            <p className="text-xl text-text-light max-w-3xl mx-auto">From tailored mentorship to publication opportunities, AES Research Programs help you build a profile that stands out.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {highlights.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full flex flex-col items-center bg-gradient-to-br from-brand-blue/10 to-brand-teal/10 border-2 border-brand-blue/10 hover:border-brand-blue/30 hover:shadow-xl transition-all duration-300 group rounded-2xl">
                  <CardHeader className="flex flex-col items-center pt-8 pb-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                      <item.icon className="h-8 w-8 text-white" />
                    </div>
                    <Badge className="mb-2 bg-brand-blue/10 text-brand-blue text-xs px-3 py-1 rounded-full font-semibold">{item.title}</Badge>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col items-center justify-center pb-8">
                    <p className="text-base font-semibold text-text-dark text-center mb-2">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-brand-light-blue/30 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-brand-orange/10 text-brand-orange">Why Join?</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-text-dark mb-6">Benefits of AES Research Programs</h2>
            <p className="text-xl text-text-light max-w-3xl mx-auto">AES Explorers is designed to help you thrive in university and beyond.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full flex flex-col items-center bg-white border-2 border-brand-blue/10 hover:border-brand-blue/30 hover:shadow-xl transition-all duration-300 group rounded-2xl">
                  <CardHeader className="flex flex-col items-center pt-8 pb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-teal flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
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

      {/* Our Programs Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-brand-green/10 text-brand-green">Our Programs</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-text-dark mb-6">Choose Your Research Journey</h2>
            <p className="text-xl text-text-light max-w-3xl mx-auto">Select the program that fits your goals and timeline. Each tier offers increasing levels of mentorship, technical writing, and recognition.</p>
          </motion.div>
          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto items-start">
            {/* Ignite10 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="relative group h-full"
            >
              <Card className="relative h-full flex flex-col bg-white/80 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 group-hover:scale-105 rounded-3xl overflow-hidden">
                <div className="relative bg-gradient-to-br from-orange-500 to-orange-600 p-8 text-white">
                  <div className="relative z-10 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-2xl mb-3 backdrop-blur-sm">
                      <h3 className="text-xl font-black text-white">Ignite10</h3>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">10 Weeks in Summer</h3>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full text-xs font-semibold backdrop-blur-sm">
                      <Calendar className="w-3 h-3" /> June-Aug
                    </div>
                  </div>
                </div>
                <CardContent className="flex-1 flex flex-col p-8">
                  <div className="space-y-3 mb-6">
                    <h4 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" /> Sessions
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>13 individual sessions (60 min each)</li>
                      <li>2 sessions: Technical Writing & Review</li>
                    </ul>
                  </div>
                  <div className="space-y-3 mb-6">
                    <h4 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Award className="w-4 h-4 text-green-600" /> Deliverables
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>Full length Research Paper</li>
                      <li>Certificate of Completion</li>
                      <li>Letter of Recommendation</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            {/* Elevate5 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="relative group h-full"
            >
              <Card className="relative h-full flex flex-col bg-white/80 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 group-hover:scale-105 rounded-3xl overflow-hidden">
                <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 p-8 text-white">
                  <div className="relative z-10 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-2xl mb-3 backdrop-blur-sm">
                      <h3 className="text-xl font-black text-white">Elevate5</h3>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">5 Months</h3>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full text-xs font-semibold backdrop-blur-sm">
                      <Calendar className="w-3 h-3" /> Aug-Dec / Jan-May
                    </div>
                  </div>
                </div>
                <CardContent className="flex-1 flex flex-col p-8">
                  <div className="space-y-3 mb-6">
                    <h4 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" /> Sessions
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>20 individual sessions (60 min each)</li>
                      <li>4 sessions: Technical Writing & Review</li>
                      <li>3 sessions with Research Program Director</li>
                    </ul>
                  </div>
                  <div className="space-y-3 mb-6">
                    <h4 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Award className="w-4 h-4 text-green-600" /> Deliverables
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>Paper submission at high school level journal</li>
                      <li>Submit to a prestigious STEM competition</li>
                      <li>Full length Research Paper</li>
                      <li>Certificate of Completion</li>
                      <li>Letter of Recommendation</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            {/* Transform365 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="relative group h-full"
            >
              <Card className="relative h-full flex flex-col bg-white/80 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 group-hover:scale-105 rounded-3xl overflow-hidden">
                <div className="relative bg-gradient-to-br from-purple-500 to-purple-600 p-8 text-white">
                  <div className="relative z-10 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-2xl mb-3 backdrop-blur-sm">
                      <h3 className="text-xl font-black text-white">Transform365</h3>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">10 Months</h3>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full text-xs font-semibold backdrop-blur-sm">
                      <Calendar className="w-3 h-3" /> Aug-May
                    </div>
                  </div>
                </div>
                <CardContent className="flex-1 flex flex-col p-8">
                  <div className="space-y-3 mb-6">
                    <h4 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" /> Sessions
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>40 individual sessions (60 min each)</li>
                      <li>5 sessions: Technical Writing & Review</li>
                      <li>4 sessions with Research Program Director</li>
                    </ul>
                  </div>
                  <div className="space-y-3 mb-6">
                    <h4 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Award className="w-4 h-4 text-green-600" /> Deliverables
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>Paper submission at college and high school level journals</li>
                      <li>Submit to a prestigious STEM competition</li>
                      <li>Full length Research Paper</li>
                      <li>Certificate of Completion</li>
                      <li>Letter of Recommendation</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-brand-blue/10 text-brand-blue">FAQ</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-text-dark mb-6">Frequently Asked Questions</h2>
            <p className="text-xl text-text-light max-w-3xl mx-auto">Find answers to common questions about AES Research Programs.</p>
          </motion.div>
          <div className="max-w-3xl mx-auto">
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
              Ready to Start Your Research Journey?
            </h2>
            <p className="text-xl opacity-90">
              Book your free consultation to learn how AES Research Programs can help you stand out and succeed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-brand-blue hover:bg-gray-100"
              >
                <ArrowRight className="mr-2 h-5 w-5" /> Book Free Consultation
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white text-brand-blue hover:bg-gray-100 hover:text-brand-blue"
              >
                <Calendar className="mr-2 h-5 w-5" /> Download Program Flyer
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