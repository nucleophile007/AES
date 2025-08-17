"use client";
import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, Award, Star, Globe, Clock, Target, TrendingUp, Lightbulb, Briefcase, Heart, Zap, GraduationCap, Microscope, Rocket, Brain, Check } from "lucide-react";
import Image from "next/image";
import Footer from "@/components/home/Footer";
import Chatbot from "@/components/home/Chatbot";
import Header from "@/components/home/Header";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

const domains = [
  {
    icon: Brain,
    title: "Engineering",
    description: "AI/ML, Data Science, Mechanical & Aerospace Engg., Electrical Engg., Gaming Engg.",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: Heart,
    title: "Pre-Med",
    description: "Medical, Biology, Chemistry, Genetic Engineering",
    color: "from-red-500 to-red-600",
  },
  {
    icon: BookOpen,
    title: "Pre-Law, Humanities & Social Sciences",
    description: "International Relations, Economics, Political Sciences",
    color: "from-green-500 to-green-600",
  },
  {
    icon: Briefcase,
    title: "Business",
    description: "Finance, Marketing Strategies, Operations Research, Case Studies",
    color: "from-purple-500 to-purple-600",
  },
];

const mentorTypes = [
  {
    icon: GraduationCap,
    title: "University Faculty",
    description: "From top U.S. Universities and IITs",
  },
  {
    icon: Microscope,
    title: "Research Scientists",
    description: "From renowned labs in the U.S. and India",
  },
  {
    icon: Award,
    title: "Industry Experts",
    description: "Faculty and industry professionals with Ph.D. credentials",
  },
  {
    icon: Star,
    title: "Subject Matter Experts",
    description: "Postdoctoral scholars, Ph.Ds and specialized experts",
  },
];

const programTiers = [
  {
    name: "IGNITE",
    timeline: "10 Weeks (June - Mid Aug)",
    mentorSessions: "10",
    techWriterSessions: "0",
    directorSessions: "-",
    deliverables: [
      "Tier-I Quality Research Article",
      "Certificate of Completion",
      "Paper Submission at STEM Competition"
    ],
    fees: {
      ic: "$250/week",
      gp: "$150/week"
    },
    color: "from-orange-500 to-orange-600",
    illustration: "/learning-journey-cartoon.png",
  },
  {
    name: "ELEVATE",
    timeline: "16 Weeks (Sept - Dec / Jan - Apr / Feb-May)",
    mentorSessions: "12",
    techWriterSessions: "2",
    directorSessions: "2",
    deliverables: [
      "All IGNITE Deliverables",
      "Letter of Recommendation",
      "Publish to high school level journal"
    ],
    fees: {
      ic: "$200/week",
      gp: "$100/week"
    },
    color: "from-blue-500 to-blue-600",
    illustration: "/progress-mountain-climb.png",
  },
  {
    name: "TRANSFORM",
    timeline: "36 Weeks (Sept - Apr)",
    mentorSessions: "30",
    techWriterSessions: "3",
    directorSessions: "3",
    deliverables: [
      "All ELEVATE Deliverables",
      "Publish to College Level Journal"
    ],
    fees: {
      ic: "$150/week",
      gp: "$100/week"
    },
    color: "from-purple-500 to-purple-600",
    illustration: "/successful-celebration.png",
  },
];

const enrollmentOptions = [
  {
    type: "Individual Contributor (IC)",
    description: "Premium enrollment with one-on-one interaction with the mentor",
    features: [
      "Opportunity to create, build and implement a project based on student's interests",
      "Instant match with Mentors",
      "Flexibility to choose the program duration"
    ],
    icon: Users,
  },
  {
    type: "Group Project (GP)",
    description: "Work in a team collaboration mode",
    features: [
      "Flexibility to form your own group (min. 2 & max. 4)",
      "Represent the team at multiple STEM competitions"
    ],
    icon: Globe,
  },
];

const faqs = [
  {
    question: "What is the AES EXPLORERS program?",
    answer: "AES EXPLORERS is our flagship research-based mentorship program that introduces middle and high school students to graduate-level research methodology, critical thinking, and academic publishing. Students work with Ph.D. mentors on personalized research problems.",
  },
  {
    question: "Who are the mentors in the program?",
    answer: "Our mentors include University Faculty from top U.S. Universities and IITs, Professional researchers from renowned labs, Industry experts with Ph.D. credentials, and Postdoctoral scholars and Subject Matter Experts.",
  },
  {
    question: "What research domains are available?",
    answer: "We offer four main domains: Engineering (AI/ML, Data Science, Mechanical & Aerospace, Electrical, Gaming), Pre-Med (Medical, Biology, Chemistry, Genetic Engineering), Pre-Law/Humanities & Social Sciences, and Business (Finance, Marketing, Operations Research).",
  },
  {
    question: "What are the different program tiers?",
    answer: "We offer three tiers: IGNITE (10 weeks), ELEVATE (16 weeks), and TRANSFORM (36 weeks). Each tier offers increasing levels of mentorship, deliverables, and opportunities for publication and recognition.",
  },
  {
    question: "Can I work individually or in a group?",
    answer: "Yes! You can choose Individual Contributor (IC) for one-on-one mentorship or Group Project (GP) to work in teams of 2-4 students. Both options offer unique benefits and learning experiences.",
  },
  {
    question: "What deliverables will I receive?",
    answer: "Deliverables vary by tier but include research articles, certificates, competition submissions, letters of recommendation, and opportunities to publish in academic journals.",
  },
];

export default function AESExplorersPage() {
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
          <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <Badge className="bg-yellow-400/10 text-yellow-400 border-yellow-400/20">
                  🔬 AES EXPLORERS
                </Badge>
                                 <h1 className="text-4xl lg:text-5xl font-bold theme-text-light leading-tight">
                   Research-Based Mentorship Program
                 </h1>
                <blockquote className="text-xl theme-text-light italic border-l-4 border-yellow-400 pl-4">
                  &quot;The best way to predict the future is to invent it.&quot;
                  <span className="block text-sm theme-text-muted mt-2">- Alan Kay</span>
                </blockquote>
                <p className="text-lg theme-text-muted leading-relaxed">
                  Our flagship program introduces middle and high school students to graduate-level research methodology, critical thinking, and academic publishing. Work with Ph.D. mentors on personalized research problems that match your interests.
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
                    <h3 className="text-xl font-semibold text-yellow-400">Research Domains</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {domains.map((domain, i) => (
                        <Card key={i} className="flex flex-col items-center p-4 bg-gradient-to-br from-[#1a2236] to-[#2a3246] border-yellow-400/20 hover:scale-105 hover:shadow-xl transition-all duration-300">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${domain.color} flex items-center justify-center mb-3`}>
                            <domain.icon className="h-6 w-6 text-white" />
                          </div>
                          <CardTitle className="text-lg text-center mb-1 theme-text-light">{domain.title}</CardTitle>
                          <CardDescription className="text-xs text-center theme-text-muted">{domain.description}</CardDescription>
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

      {/* Program Info Section */}
      <section className="py-20 theme-bg-dark">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-yellow-400/10 text-yellow-400">Program Information</Badge>
                         <h2 className="text-4xl lg:text-5xl font-bold theme-text-light mb-6">Research Excellence at Your Fingertips</h2>
            <p className="text-xl theme-text-muted max-w-3xl mx-auto">
              Personalized research problems based on student interests, conducted entirely online with expert mentorship from leading academics and industry professionals.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {mentorTypes.map((mentor, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full flex flex-col justify-center bg-[#1a2236]/90 backdrop-blur-sm border border-yellow-400/20 shadow-md rounded-xl hover:shadow-xl hover:border-yellow-400/40 transition-all duration-300 group p-0">
                  <div className="flex items-center gap-4 px-6 pt-8 pb-2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <mentor.icon className="h-6 w-6 text-[#1a2236]" />
                    </div>
                    <span className="text-lg font-bold theme-text-light">{mentor.title}</span>
                  </div>
                  <div className="px-6 pb-8 pt-2 flex-1 flex flex-col justify-center">
                    <p className="text-base theme-text-muted font-medium text-left">{mentor.description}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enrollment Options Section */}
      <section className="py-20 theme-bg-dark">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-yellow-400/10 text-yellow-400">Enrollment Options</Badge>
                         <h2 className="text-4xl lg:text-5xl font-bold theme-text-light mb-6">Choose Your Research Journey</h2>
            <p className="text-xl theme-text-muted max-w-3xl mx-auto">Flexible enrollment options to match your learning style and goals.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8">
            {enrollmentOptions.map((option, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full flex flex-col bg-[#1a2236]/90 backdrop-blur-sm border border-yellow-400/20 hover:shadow-xl hover:border-yellow-400/40 transition-all duration-300 group relative">
                  <CardHeader className="pb-2">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center mb-4 mx-auto">
                      <option.icon className="h-7 w-7 text-[#1a2236]" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-center mb-2 theme-text-light">{option.type}</CardTitle>
                    <p className="text-sm theme-text-muted text-center mb-4 font-medium">{option.description}</p>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <ul className="space-y-2 mb-4">
                      {option.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm theme-text-muted">
                          <div className="w-2 h-2 rounded-full bg-yellow-400 mt-2 flex-shrink-0"></div>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
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

      {/* Program Tiers Section */}
      <section className="py-20 theme-bg-dark">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-yellow-400/10 text-yellow-400">Program Tiers</Badge>
                         <h2 className="text-4xl lg:text-5xl font-bold theme-text-light mb-4 leading-tight">
               Three Levels of 
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500"> Research Excellence</span>
             </h2>
            <p className="text-xl theme-text-muted max-w-3xl mx-auto">
              Choose the tier that best fits your research goals and timeline.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto items-start">
            {programTiers.map((tier, i) => (
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
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white font-bold px-6 py-2 text-sm shadow-lg animate-pulse">
                        <Star className="w-4 h-4 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                     <CardHeader className="text-center pb-6 pt-12 relative z-10">
                     <div className="w-full h-48 mx-auto mb-6 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 ring-1 ring-slate-600/20">
                       <Image
                         src={tier.illustration || "/placeholder.svg"}
                         alt={`${tier.name} program illustration`}
                         width={400}
                         height={192}
                         className="w-full h-full object-cover"
                       />
                     </div>

                     <h3 className="text-3xl font-bold text-cyan-300 mb-2">{tier.name}</h3>
                     <p className="text-lg text-cyan-200 font-medium">({tier.timeline})</p>
                   </CardHeader>

                  <CardContent className="flex-1 flex flex-col relative z-10">
                    <div className="flex-1 space-y-8">
                      {/* Session Details */}
                      <div className="space-y-4">
                        <h4 className="font-bold text-cyan-300 text-lg border-b border-slate-600/50 pb-2">
                          Session Details:
                        </h4>
                        <div className="space-y-3">
                          <div className="relative p-4 bg-slate-700/50 rounded-xl border border-slate-600/30 backdrop-blur-sm">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-semibold text-cyan-200">Mentor Sessions</span>
                              <div className="text-right">
                                <span className="text-xl font-bold text-cyan-300">{tier.mentorSessions}</span>
                              </div>
                            </div>
                          </div>
                          <div className="relative p-4 bg-slate-700/50 rounded-xl border border-slate-600/30 backdrop-blur-sm">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-semibold text-cyan-200">Tech Writer Sessions</span>
                              <div className="text-right">
                                <span className="text-xl font-bold text-cyan-300">{tier.techWriterSessions}</span>
                              </div>
                            </div>
                          </div>
                          <div className="relative p-4 bg-slate-700/50 rounded-xl border border-slate-600/30 backdrop-blur-sm">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-semibold text-cyan-200">Director Sessions</span>
                              <div className="text-right">
                                <span className="text-xl font-bold text-cyan-300">{tier.directorSessions}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Deliverables */}
                      <div className="space-y-4">
                        <h4 className="font-bold text-cyan-300 text-lg border-b border-slate-600/50 pb-2">
                          What&apos;s included:
                        </h4>
                                                 <ul className="space-y-3">
                           {tier.deliverables.map((deliverable, index) => (
                             <li key={index} className="flex items-start text-cyan-200 group/item">
                               <div
                                 className={`w-5 h-5 rounded-full bg-gradient-to-r ${tier.color} flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 group-hover/item:scale-110 transition-transform duration-200 shadow-lg`}
                               >
                                                                   <Check className="w-3 h-3 text-white" />
                               </div>
                               <span className="leading-relaxed">{deliverable}</span>
                             </li>
                           ))}
                         </ul>
                       </div>

                       {/* Investment */}
                       <div className="space-y-4">
                         <h4 className="font-bold text-cyan-300 text-lg border-b border-slate-600/50 pb-2">
                           Investment:
                         </h4>
                         <div className="space-y-3">
                           <div className="relative p-4 bg-slate-700/50 rounded-xl border border-slate-600/30 backdrop-blur-sm">
                             <div className="flex justify-between items-center">
                               <span className="text-sm font-semibold text-cyan-200">Individual Contributor</span>
                               <div className="text-right">
                                 <span className="text-xl font-bold text-cyan-300">{tier.fees.ic}</span>
                               </div>
                             </div>
                           </div>
                           <div className="relative p-4 bg-slate-700/50 rounded-xl border border-slate-600/30 backdrop-blur-sm">
                             <div className="flex justify-between items-center">
                               <span className="text-sm font-semibold text-cyan-200">Group Project</span>
                               <div className="text-right">
                                 <span className="text-xl font-bold text-cyan-300">{tier.fees.gp}</span>
                               </div>
                             </div>
                           </div>
                         </div>
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
            <p className="text-xl theme-text-muted max-w-3xl mx-auto">Find answers to common questions about the AES EXPLORERS program.</p>
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
              🚀 Start Your Research Journey
            </Badge>
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold theme-text-light leading-tight">
              Ready to Start Your Research Journey?
            </h2>
            
            <p className="text-base sm:text-lg lg:text-xl theme-text-muted px-4 leading-relaxed max-w-3xl mx-auto">
              Join AES EXPLORERS and work with leading researchers to publish your own academic work.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center pt-4">
              <Button className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#1a2236] hover:from-yellow-300 hover:to-yellow-400 px-6 shadow-lg font-bold">
                Apply Now
              </Button>
              <Button variant="outline" className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-[#1a2236] px-6 font-bold">
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