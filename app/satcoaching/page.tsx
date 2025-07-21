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
import { BookOpen, Star, Target, Users, FileText, Trophy, Lightbulb, Globe, Calendar, ArrowRight, CheckIcon, Timer, ListChecks, BarChart, ClipboardList, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

const goals = [
  {
    icon: Target,
    title: "Personalized SAT Plan",
    description: `Customized study plans based on a thorough diagnostic test and your unique strengths and weaknesses. We work with you to set realistic goals and milestones, then create a week-by-week roadmap for your SAT journey. Your plan adapts as you progress, ensuring you always focus on the areas that will yield the biggest score gains. Regular check-ins and adjustments keep you on track and motivated. You’ll never feel lost or overwhelmed—your coach is with you every step of the way.`,
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: BarChart,
    title: "Score Improvement Focus",
    description: `We identify your weakest SAT sections and target them with focused practice and proven strategies. You’ll receive custom assignments, drills, and timed mini-tests to build confidence and accuracy. We track your progress after every session and celebrate every improvement, no matter how small. Our approach is data-driven, so you’ll always know exactly where you stand and what to work on next. Many students see 150-300+ point improvements after completing our program.`,
    color: "from-teal-500 to-teal-600",
  },
  {
    icon: ClipboardList,
    title: "Comprehensive Test Strategies",
    description: `Master the SAT with our expert strategies for time management, question analysis, and test-day confidence. We teach you how to approach every question type, eliminate wrong answers, and manage your pacing for each section. You’ll practice with real SAT questions and full-length, timed exams to build stamina and reduce anxiety. Our coaches share insider tips and test-day routines to help you perform your best when it counts.`,
    color: "from-orange-500 to-orange-600",
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

const events = [
  { title: "SAT Bootcamp", date: "June 20, 2024", description: "Intensive 1-week SAT prep covering all sections with practice tests.", icon: Timer, badge: "Bootcamp" },
  { title: "Practice Test Day", date: "July 10, 2024", description: "Simulated SAT test under real conditions with score analysis.", icon: ListChecks, badge: "Practice" },
  { title: "Strategy Webinar", date: "August 1, 2024", description: "Live online session on SAT strategies and Q&A with experts.", icon: Lightbulb, badge: "Webinar" },
];

const resources = [
  { name: "SAT Prep Flyer", link: "#", icon: FileText },
  { name: "SAT Checklist", link: "#", icon: CheckIcon },
  { name: "Practice Test Guide", link: "#", icon: ListChecks },
  { name: "Time Management Tips", link: "#", icon: Timer },
];

const faqs = [
  { question: "How is your SAT program different?", answer: "We offer personalized plans, expert instruction, and ongoing feedback to maximize your score improvement." },
  { question: "How many practice tests are included?", answer: "Our program includes multiple full-length, timed practice tests with detailed analysis." },
  { question: "Is the coaching online or in-person?", answer: "We offer both online and in-person SAT coaching to fit your needs." },
  { question: "What score improvements do students typically see?", answer: "Many students see 150-300+ point improvements after completing our program." },
  { question: "How do I get started?", answer: "Book a free SAT consultation or download our SAT Prep Flyer for more information." },
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
                  📝 SAT Coaching
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold text-text-dark leading-tight">
                  Achieve Your Best SAT Score with Personalized Coaching
                </h1>
                <blockquote className="text-xl text-brand-blue italic border-l-4 border-brand-blue pl-4">
                  “Empowering students to reach their college dreams through proven SAT strategies.”
                </blockquote>
                <p className="text-xl text-text-light leading-relaxed">
                  Our SAT program combines diagnostic testing, targeted practice, and expert feedback to help you maximize your score and confidence on test day.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative space-y-8"
            >
              {/* SAT Approach Card */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/20 to-brand-teal/20 rounded-3xl transform rotate-6"></div>
                <div className="relative bg-white p-8 rounded-3xl shadow-2xl border">
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-brand-blue">Our SAT Approach</h3>
                    <p className="text-base text-text-light">
                      We focus on building a strong foundation, mastering test strategies, and providing ongoing support so every student can achieve their personal best.
                    </p>
                    <div className="flex flex-row gap-4 justify-center">
                      <Button className="bg-gradient-to-r from-brand-blue to-brand-teal px-6">
                        <ArrowRight className="mr-2 h-5 w-5" /> Download SAT Prep Flyer
                      </Button>
                      <Button
                        variant="outline"
                        className="border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white px-6"
                      >
                        <Calendar className="mr-2 h-5 w-5" /> Book Free SAT Consultation
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              {/* SAT Assessment Form Card (commented out for now) */}
              {false && (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/20 to-brand-teal/20 rounded-3xl transform rotate-6"></div>
                  <div className="relative bg-white p-8 rounded-3xl shadow-2xl border">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold">Free SAT Assessment</h3>
                        <Badge className="bg-brand-green text-white">Limited Time</Badge>
                      </div>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <Input placeholder="Student's Name" value={name} onChange={e => setName(e.target.value)} required />
                        <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} type="email" required />
                        <Input placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} required />
                        <Input placeholder="Target SAT Date" value={satDate} onChange={e => setSatDate(e.target.value)} required />
                        <Input placeholder="Current SAT Score (if any)" value={satScore} onChange={e => setSatScore(e.target.value)} />
                        <Button type="submit" className="w-full bg-gradient-to-r from-brand-blue to-brand-teal" disabled={loading}>
                          {loading ? "Booking..." : "Book Free SAT Session"}
                        </Button>
                        {success && <div className="text-green-600 text-sm pt-2">{success}</div>}
                        {error && <div className="text-red-600 text-sm pt-2">{error}</div>}
                      </form>
                    </div>
                  </div>
                </div>
              )}
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
            <h2 className="text-4xl lg:text-5xl font-bold text-text-dark mb-6">How We Maximize Your SAT Success</h2>
            <p className="text-xl text-text-light max-w-3xl mx-auto">
              Our approach is designed to help students build confidence, master test strategies, and achieve their target SAT score.
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
                <div className="relative bg-white rounded-2xl shadow-md border-t-4 border-brand-blue hover:border-brand-teal transition-all duration-300 flex flex-col items-center p-6 group min-h-[340px]">
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-brand-blue to-brand-teal flex items-center justify-center shadow-lg border-4 border-white z-10">
                    <goal.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="mt-8 font-semibold text-lg text-text-dark text-center mb-1">{goal.title}</div>
                  <div className="text-sm text-text-light text-center">{goal.description}</div>
                </div>
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
            <h2 className="text-4xl lg:text-5xl font-bold text-text-dark mb-6">What Sets Our SAT Prep Apart</h2>
            <p className="text-xl text-text-light max-w-3xl mx-auto">From diagnostic testing to expert feedback, our program is designed for real results.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {highlights.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="h-full flex flex-col items-center bg-gradient-to-br from-brand-light-blue/40 to-white rounded-xl shadow-md p-8 group transition-all duration-300 hover:shadow-xl hover:bg-brand-light-blue/60 min-h-[220px]">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-blue to-brand-teal flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <item.icon className="h-7 w-7 text-white" />
                  </div>
                  <div className="text-lg font-bold text-text-dark text-center mb-2">{item.title}</div>
                  <div className="text-base text-text-light text-center flex-1">{item.description}</div>
                </div>
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
            <Badge className="mb-4 bg-brand-blue/10 text-brand-blue">SAT Prep Journey</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-text-dark mb-6">Your Path to SAT Success</h2>
            <p className="text-xl text-text-light max-w-3xl mx-auto">Follow our proven step-by-step process to maximize your SAT score.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-8">
            {timeline.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="relative bg-white rounded-2xl shadow-md border-t-4 border-brand-blue hover:border-brand-teal transition-all duration-300 flex flex-col items-center p-6 group min-h-[260px]">
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-brand-blue to-brand-teal flex items-center justify-center shadow-lg border-4 border-white z-10">
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="mt-8 font-semibold text-lg text-text-dark text-center mb-1">{item.title}</div>
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
            <h2 className="text-4xl lg:text-5xl font-bold text-text-dark mb-6">Upcoming SAT Events</h2>
            <p className="text-xl text-text-light max-w-3xl mx-auto">Join our expert-led SAT bootcamps, practice test days, and strategy webinars.</p>
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

      {/* Downloadable Resources Section */}
      <section className="py-20 bg-gradient-to-br from-brand-light-blue/30 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-brand-blue/10 text-brand-blue">Downloadable Resources</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-text-dark mb-6">Helpful SAT Guides & Checklists</h2>
            <p className="text-xl text-text-light max-w-3xl mx-auto">Access our most popular SAT resources to support your prep journey.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {resources.map((resource, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="h-full flex flex-col items-center bg-gradient-to-br from-brand-light-blue/40 to-white rounded-xl shadow-md p-8 group transition-all duration-300 hover:shadow-xl hover:bg-brand-light-blue/60 min-h-[220px]">
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

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-brand-blue/10 text-brand-blue">FAQ</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-text-dark mb-6">Frequently Asked SAT Questions</h2>
            <p className="text-xl text-text-light max-w-3xl mx-auto">Find answers to common questions about our SAT coaching, practice tests, and more.</p>
          </motion.div>
          <div className="max-w-3xl mx-auto space-y-8">
            {faqs.map((faq, i) => (
              <Accordion type="single" collapsible key={i}>
                <AccordionItem value={`faq-${i}`} className="border-none">
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
              </Accordion>
            ))}
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
              Ready to Boost Your SAT Score?
            </h2>
            <p className="text-xl opacity-90">
              Book your free SAT consultation or download our SAT Prep Flyer to get started on your path to success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-brand-blue hover:bg-gray-100"
              >
                <ArrowRight className="mr-2 h-5 w-5" /> Download SAT Prep Flyer
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white text-brand-blue hover:bg-gray-100 hover:text-brand-blue"
              >
                <Calendar className="mr-2 h-5 w-5" /> Book Free SAT Consultation
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