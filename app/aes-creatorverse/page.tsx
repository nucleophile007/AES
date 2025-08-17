"use client";
import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, Award, Star, Globe, Clock, Target, TrendingUp, Lightbulb, Briefcase, Heart, Zap, Mic, PenTool, Video, Megaphone } from "lucide-react";
import Footer from "@/components/home/Footer";
import Chatbot from "@/components/home/Chatbot";
import Header from "@/components/home/Header";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

const focusSkills = [
  {
    icon: BookOpen,
    title: "Reading",
    description: "Reviewer for Student Newsletters/Journals, Content copy writer for digital media campaigns, Start a review blog, YouTube channel, or Instagram Reels on book summaries, reading challenges, or author interviews.",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: PenTool,
    title: "Writing",
    description: "Run a blog/Publish a book based on Student's field of interests, Content creator or freelance writer, School newspaper editor or club president, Youth ambassador or Writing tutor for younger students.",
    color: "from-green-500 to-green-600",
  },
  {
    icon: Mic,
    title: "Speaking",
    description: "Debate or public speaking team leader, Student council spokesperson or representative, Podcast or YouTube host, Delivers motivational talks, TED-style speeches, or event emceeing.",
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: Megaphone,
    title: "Leadership/Community Engagement",
    description: "Organizes community drives, campaigns, workshops, or fundraisers, Facilitates town halls, youth forums, or service projects, Club president or student council leader, Volunteer coordinator or outreach ambassador.",
    color: "from-orange-500 to-orange-600",
  },
];

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

const programPackages = [
  {
    name: "3 Month Program",
    timeline: "June - Aug",
    duration: "3 months",
    fees: "Starting from $1000",
    features: [
      "Basic profile assessment and mapping",
      "Core skill development in chosen area",
      "Initial content creation guidance",
      "Basic audience building strategies",
      "Monthly progress reviews"
    ],
    color: "from-green-500 to-green-600",
  },
  {
    name: "5 Month Program",
    timeline: "Aug - Dec / Jan - May",
    duration: "5 months",
    fees: "Starting from $1500",
    features: [
      "All 3-month program features",
      "Advanced content strategy development",
      "Enhanced audience engagement techniques",
      "Personal brand refinement",
      "Competition and event participation",
      "Bi-weekly mentorship sessions"
    ],
    color: "from-blue-500 to-blue-600",
  },
  {
    name: "10 Month Program",
    timeline: "Aug - May",
    duration: "10 months",
    fees: "Starting from $2500",
    features: [
      "All 5-month program features",
      "Comprehensive brand establishment",
      "Leadership role development",
      "Community project implementation",
      "Portfolio and resume building",
      "Weekly personalized coaching",
      "End-of-program showcase opportunity"
    ],
    color: "from-purple-500 to-purple-600",
  },
];

const successExamples = [
  {
    category: "Reading",
    examples: [
      "Book review blog with 5,000+ monthly readers",
      "YouTube channel with 10,000+ subscribers",
      "Instagram Reels reaching 50,000+ views",
      "Student newsletter editor position"
    ],
    icon: BookOpen,
  },
  {
    category: "Writing",
    examples: [
      "Published author of young adult fiction",
      "Freelance writer for major publications",
      "School newspaper editor-in-chief",
      "Youth ambassador for literacy programs"
    ],
    icon: PenTool,
  },
  {
    category: "Speaking",
    examples: [
      "TEDx speaker at regional conference",
      "Podcast host with 1,000+ listeners",
      "Debate team captain and tournament winner",
      "Student council president"
    ],
    icon: Mic,
  },
  {
    category: "Leadership",
    examples: [
      "Community service project leader",
      "Environmental campaign organizer",
      "Youth forum facilitator",
      "Volunteer coordinator for major events"
    ],
    icon: Megaphone,
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
    question: "What are the different program packages?",
    answer: "We offer three packages: 3-month (basic skill development), 5-month (advanced strategies and brand building), and 10-month (comprehensive leadership and community impact). Each package builds upon the previous one.",
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
                             <Button className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#1a2236] hover:from-yellow-300 hover:to-yellow-400 px-6 shadow-lg">
                 Book Free Session
               </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Focus Skills Section */}
      <section className="py-20 theme-bg-dark">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-yellow-400/10 text-yellow-400">Focus Skills</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold theme-text-light mb-6">Our Focus Skills</h2>
            <p className="text-xl theme-text-muted max-w-3xl mx-auto">
              Develop essential skills in four key areas that will help you build your digital presence and community impact.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {focusSkills.map((skill, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full flex flex-col bg-[#1a2236]/90 backdrop-blur-sm border border-yellow-400/20 hover:shadow-xl hover:border-yellow-400/40 transition-all duration-300 group relative">
                  <CardHeader className="pb-2">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center mb-4 mx-auto">
                      <skill.icon className="h-7 w-7 text-[#1a2236]" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-center mb-2 theme-text-light">{skill.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <p className="text-base theme-text-muted text-center leading-relaxed">{skill.description}</p>
                  </CardContent>
                </Card>
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

      {/* Program Packages Section */}
      <section className="py-20 theme-bg-dark">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-yellow-400/10 text-yellow-400">Program Packages</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold theme-text-light mb-6">Choose Your Creative Journey</h2>
            <p className="text-xl theme-text-muted max-w-3xl mx-auto">Flexible packages designed to match your goals and timeline.</p>
          </motion.div>
          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
            {programPackages.map((pkg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full flex flex-col bg-[#1a2236]/90 backdrop-blur-sm border-2 border-yellow-400/20 hover:border-yellow-400/40 hover:shadow-xl transition-all duration-300 group rounded-2xl">
                  <CardHeader className="flex flex-col items-center pt-8 pb-4">
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${pkg.color} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                      <h3 className="text-lg font-bold text-white text-center">{pkg.name}</h3>
                    </div>
                    <CardTitle className="text-xl font-semibold text-center mb-2 theme-text-light">{pkg.name}</CardTitle>
                    <Badge className="bg-yellow-400/10 text-yellow-400 border-yellow-400/20 text-xs px-3 py-1 rounded-full font-semibold">{pkg.timeline}</Badge>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col pb-8">
                    <div className="space-y-4 mb-6">
                      <div className="text-center">
                        <h4 className="font-bold text-yellow-400 text-2xl mb-1">{pkg.fees}</h4>
                        <p className="text-sm theme-text-muted">{pkg.duration} program</p>
                      </div>
                      <div className="space-y-3">
                        <h4 className="font-semibold theme-text-light">Features:</h4>
                        <ul className="space-y-2">
                          {pkg.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm theme-text-muted">
                              <div className="w-2 h-2 rounded-full bg-yellow-400 mt-2 flex-shrink-0"></div>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
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
              <Button className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#1a2236] hover:from-yellow-300 hover:to-yellow-400 px-6 shadow-lg font-bold">
                Schedule Consultation
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