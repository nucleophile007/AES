"use client";
import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, Award, Star, Globe, Clock, Target, TrendingUp, Lightbulb, Briefcase, Heart, Zap, GraduationCap, Microscope, Rocket, Brain } from "lucide-react";
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
    <>
      <Header />
      {/* Hero Section */}
      <section
        id="home"
        className="pt-24 pb-20 bg-gradient-to-br from-brand-light-blue via-white to-brand-light-blue/50"
      >
        <div className="container mx-auto">
          <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <Badge className="bg-brand-orange/10 text-brand-orange border-brand-orange/20">
                  🔬 AES EXPLORERS
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold text-text-dark leading-tight">
                  Research-Based Mentorship Program
                </h1>
                <blockquote className="text-xl text-brand-blue italic border-l-4 border-brand-blue pl-4">
                  &quot;The best way to predict the future is to invent it.&quot;
                  <span className="block text-sm text-text-light mt-2">- Alan Kay</span>
                </blockquote>
                <p className="text-xl text-text-light leading-relaxed">
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
                <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/20 to-brand-teal/20 rounded-3xl transform rotate-6"></div>
                <div className="relative bg-white p-8 rounded-3xl shadow-2xl border">
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-brand-blue">Research Domains</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {domains.map((domain, i) => (
                        <Card key={i} className="flex flex-col items-center p-4 bg-gradient-to-br from-white to-brand-light-blue/10 border-brand-blue/10 hover:scale-105 hover:shadow-xl transition-transform transition-shadow duration-300">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${domain.color} flex items-center justify-center mb-3`}>
                            <domain.icon className="h-6 w-6 text-white" />
                          </div>
                          <CardTitle className="text-lg text-center mb-1">{domain.title}</CardTitle>
                          <CardDescription className="text-xs text-center">{domain.description}</CardDescription>
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
      <section className="py-20 bg-white">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-brand-blue/10 text-brand-blue">Program Information</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-text-dark mb-6">Research Excellence at Your Fingertips</h2>
            <p className="text-xl text-text-light max-w-3xl mx-auto">
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
                <Card className="h-full flex flex-col justify-center bg-white border-l-8 border-brand-blue shadow-md rounded-xl hover:shadow-xl hover:border-brand-teal transition-all duration-300 group p-0">
                  <div className="flex items-center gap-4 px-6 pt-8 pb-2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-blue to-brand-teal flex items-center justify-center group-hover:scale-105 transition-transform">
                      <mentor.icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-lg font-bold text-text-dark">{mentor.title}</span>
                  </div>
                  <div className="px-6 pb-8 pt-2 flex-1 flex flex-col justify-center">
                    <p className="text-base text-text-light font-medium text-left">{mentor.description}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enrollment Options Section */}
      <section className="py-20 bg-gradient-to-br from-brand-light-blue/30 to-white">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-brand-green/10 text-brand-green">Enrollment Options</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-text-dark mb-6">Choose Your Research Journey</h2>
            <p className="text-xl text-text-light max-w-3xl mx-auto">Flexible enrollment options to match your learning style and goals.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8">
            {enrollmentOptions.map((option, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full flex flex-col hover:shadow-xl transition-all duration-300 border-2 hover:border-brand-blue/20 group relative">
                  <CardHeader className="pb-2">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-teal flex items-center justify-center mb-4 mx-auto">
                      <option.icon className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-center mb-2 text-text-dark">{option.type}</CardTitle>
                    <p className="text-sm text-text-light text-center mb-4 font-medium">{option.description}</p>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <ul className="space-y-2 mb-4">
                      {option.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-text-light">
                          <div className="w-2 h-2 rounded-full bg-brand-blue mt-2 flex-shrink-0"></div>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
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

      {/* Program Tiers Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-semibold rounded-full mb-4 shadow-lg">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
              Program Tiers
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              Three Levels of 
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Research Excellence</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto font-medium">
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
                {/* Background glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${tier.color} rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500`}></div>
                
                                 <Card className="relative h-full flex flex-col bg-white/80 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 group-hover:scale-105 rounded-3xl overflow-hidden">
                  {/* Header with gradient background */}
                  <div className={`relative bg-gradient-to-br ${tier.color} p-8 text-white`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
                    
                    <div className="relative z-10 text-center">
                      <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-2xl mb-3 backdrop-blur-sm">
                        <h3 className="text-xl font-black text-white">{tier.name}</h3>
                      </div>
                      <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full text-xs font-semibold backdrop-blur-sm">
                        <Clock className="w-3 h-3" />
                        {tier.timeline}
                      </div>
                    </div>
                  </div>
                  
                                     <CardContent className="flex-1 flex flex-col p-8">
                     {/* Session Details */}
                     <div className="space-y-3 mb-6">
                       <h4 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                         <Users className="w-4 h-4 text-blue-600" />
                         Session Details
                       </h4>
                       <div className="grid grid-cols-1 gap-3">
                         <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                           <span className="text-sm font-semibold text-gray-700">Mentor Sessions</span>
                           <Badge className="bg-blue-600 text-white font-bold px-3 py-1 rounded-full">{tier.mentorSessions}</Badge>
                         </div>
                         <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl">
                           <span className="text-sm font-semibold text-gray-700">Tech Writer Sessions</span>
                           <Badge className="bg-green-600 text-white font-bold px-3 py-1 rounded-full">{tier.techWriterSessions}</Badge>
                         </div>
                         <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                           <span className="text-sm font-semibold text-gray-700">Director Sessions</span>
                           <Badge className="bg-purple-600 text-white font-bold px-3 py-1 rounded-full">{tier.directorSessions}</Badge>
                         </div>
                       </div>
                     </div>
                     
                     {/* Deliverables */}
                     <div className="space-y-3 mb-6">
                       <h4 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                         <Award className="w-4 h-4 text-green-600" />
                         Deliverables
                       </h4>
                       <ul className="space-y-3">
                         {tier.deliverables.map((deliverable, index) => (
                           <li key={index} className="flex items-start gap-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100">
                             <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-500 to-blue-500 mt-2 flex-shrink-0"></div>
                             <span className="text-sm font-medium text-gray-700">{deliverable}</span>
                           </li>
                         ))}
                       </ul>
                     </div>
                     
                     {/* Fees */}
                     <div className="space-y-3 mb-6">
                       <h4 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                         <Briefcase className="w-4 h-4 text-orange-600" />
                         Investment
                       </h4>
                       <div className="space-y-3">
                         <div className="flex justify-between items-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-100">
                           <div>
                             <span className="text-sm font-semibold text-gray-700">Individual Contributor</span>
                             <p className="text-xs text-gray-500">One-on-one mentorship</p>
                           </div>
                           <span className="font-bold text-xl text-orange-600">{tier.fees.ic}</span>
                         </div>
                         <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                           <div>
                             <span className="text-sm font-semibold text-gray-700">Group Project</span>
                             <p className="text-xs text-gray-500">Team collaboration</p>
                           </div>
                           <span className="font-bold text-xl text-blue-600">{tier.fees.gp}</span>
                         </div>
                       </div>
                     </div>
                     
                     {/* Spacer to push button to bottom */}
                     <div className="flex-1"></div>
                     
                     {/* CTA Button */}
                     <Button className={`w-full bg-gradient-to-r ${tier.color} hover:scale-105 transition-all duration-300 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl mt-auto`}>
                       <Zap className="w-5 h-5 mr-2" />
                       Enroll Now
                     </Button>
                   </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-br from-brand-light-blue/30 to-white">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-brand-blue/10 text-brand-blue">FAQ</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-text-dark mb-6">Frequently Asked Questions</h2>
            <p className="text-xl text-text-light max-w-3xl mx-auto">Find answers to common questions about the AES EXPLORERS program.</p>
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
        <div className="container mx-auto text-center">
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
              Join AES EXPLORERS and work with leading researchers to publish your own academic work.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-brand-blue hover:bg-gray-100"
              >
                Apply Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white text-brand-blue hover:bg-gray-100 hover:text-brand-blue"
              >
                Schedule Consultation
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