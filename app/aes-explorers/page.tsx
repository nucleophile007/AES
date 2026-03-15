"use client";
import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, Award, Star, Globe, Clock, Target, TrendingUp, Lightbulb, Briefcase, Heart, Zap, GraduationCap, Microscope, Rocket, Brain, Check, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/home/Footer";
import Chatbot from "@/components/home/Chatbot";
import Header from "@/components/home/Header";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Highlight } from "@/components/ui/highlight";
import { useState, useEffect, useCallback, useRef } from "react";

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
    timeline: "20 Weeks (Sept - Dec / Jan - Apr / Feb-May)",
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
    timeline: "40 Weeks (Sept - Apr)",
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

// Helper function to generate initials from name
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Fallback testimonials for AES Explorers
const fallbackTestimonials = [
  {
    id: 0,
    name: "Research Student",
    designation: "High School Researcher",
    initials: "RS",
    rating: 5,
    content: (
      <p>
        The AES EXPLORERS program provided me with <Highlight>invaluable research experience</Highlight> and mentorship from leading faculty. I was able to publish my work and present at a national conference.
      </p>
    ),
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

// TestimonialsSection Component
function TestimonialsSection() {
  const [testimonialCards, setTestimonialCards] = useState(fallbackTestimonials)
  const [loading, setLoading] = useState(true)
  const [selectedTestimonial, setSelectedTestimonial] = useState(fallbackTestimonials[0])
  const [isVisible, setIsVisible] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [animatingIndex, setAnimatingIndex] = useState(0)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch testimonials from API
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch("/api/testimonials")
        const data = await response.json()
        
        if (data.success && data.testimonials && data.testimonials.length > 0) {
          // Filter testimonials for "AES EXPLORERS Research Program"
          const researchTestimonials = data.testimonials
            .filter((t: any) => {
              // Check if programs array includes "AES EXPLORERS" or "Research" (case-insensitive)
              return t.programs && Array.isArray(t.programs) && 
                     t.programs.some((p: string) => 
                       p.toLowerCase().includes('explorer') || 
                       p.toLowerCase().includes('research')
                     )
            })
            .map((t: any) => ({
              id: t.id || Math.random(),
              name: t.studentName || "Student",
              designation: t.grade || "Student",
              school: t.school || "School",
              // Keep all sections separate
              successStory: t.successStory,
              content: t.content || t.experienceDescription,
              rating: t.rating,
              initials: t.studentName ? t.studentName.split(" ").map((n: string) => n[0]).join("") : "ST"
            }))
          
          if (researchTestimonials.length > 0) {
            setTestimonialCards(researchTestimonials)
            setSelectedTestimonial(researchTestimonials[0])
          }
        }
      } catch (error) {
        console.error("Error fetching testimonials:", error)
        // Keep fallback testimonials on error
      } finally {
        setLoading(false)
      }
    }

    fetchTestimonials()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300)
    return () => clearTimeout(timer)
  }, [])

  const startAutoRotation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % testimonialCards.length
        setSelectedTestimonial(testimonialCards[nextIndex])
        setAnimatingIndex(nextIndex)
        return nextIndex
      })
    }, 5500)
  }, [testimonialCards])

  useEffect(() => {
    startAutoRotation()
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [startAutoRotation])

  const handleAvatarClick = (testimonial: typeof testimonialCards[0], index: number) => {
    setSelectedTestimonial(testimonial)
    setCurrentIndex(index)
    setAnimatingIndex(index)
    startAutoRotation()
  }

  const goToPrevious = () => {
    const prevIndex = currentIndex === 0 ? testimonialCards.length - 1 : currentIndex - 1
    setSelectedTestimonial(testimonialCards[prevIndex])
    setCurrentIndex(prevIndex)
    setAnimatingIndex(prevIndex)
    startAutoRotation()
  }

  const goToNext = () => {
    const nextIndex = (currentIndex + 1) % testimonialCards.length
    setSelectedTestimonial(testimonialCards[nextIndex])
    setCurrentIndex(nextIndex)
    setAnimatingIndex(nextIndex)
    startAutoRotation()
  }

  const renderTestimonialContent = (testimonial: any) => {
    // If it's a fallback testimonial with JSX content
    if (typeof testimonial.content !== 'string' && testimonial.content?.props) {
      return testimonial.content
    }
    
    // For API testimonials, show all approved sections with headings
    return (
      <div className="space-y-6">
        {/* Content/Experience Section */}
        {testimonial.content && (
          <div>
            <h3 className="text-yellow-400 font-semibold mb-2 text-base">
              Experience With Us
            </h3>
            <p className="text-slate-200 text-base leading-relaxed">
              &quot;{testimonial.content}&quot;
            </p>
          </div>
        )}
        
        {/* Success Story Section */}
        {testimonial.successStory && (
          <div>
            <h3 className="text-emerald-400 font-semibold mb-2 text-base">
              Success Story
            </h3>
            <p className="text-slate-200 text-base leading-relaxed">
              &quot;{testimonial.successStory}&quot;
            </p>
          </div>
        )}
        
        {/* If neither section exists (shouldn't happen but fallback) */}
        {!testimonial.successStory && !testimonial.content && (
          <p className="text-slate-200 text-base leading-relaxed">
            Great research experience!
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="w-full relative z-10">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="relative flex flex-col lg:flex-row items-center justify-center gap-16">
          <div className="relative w-[600px] h-[600px] lg:w-[700px] lg:h-[700px]">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] lg:w-[500px] lg:h-[500px] border-2 border-dashed border-yellow-400/30 rounded-full" />
            
            {/* Testimonials positioned around the circle */}
            {testimonialCards.map((testimonial, index) => {
              // Calculate angle so that active testimonial is always at rightmost (0 degrees)
              const angle = (index - currentIndex) * (360 / testimonialCards.length)
              const radius = 250
              const x = Math.cos((angle * Math.PI) / 180) * radius
              const y = Math.sin((angle * Math.PI) / 180) * radius

              const isActive = currentIndex === index
              const isAnimating = animatingIndex === index

              return (
                <div
                  key={testimonial.id}
                  className="absolute cursor-pointer hover:scale-110 z-10 transition-all duration-300"
                  style={{
                    left: "50%",
                    top: "50%",
                    transform: `translate(${x - 50}px, ${y - 50}px)`,
                  }}
                  onClick={() => handleAvatarClick(testimonial, index)}
                >
                  <Avatar
                    className={`w-20 h-20 lg:w-24 lg:h-24 ring-2 shadow-lg transition-all duration-500 ${
                      isActive ? "ring-yellow-400 ring-4 scale-110" : "ring-white hover:ring-yellow-300"
                    } ${isAnimating ? "animate-pulse" : ""}`}
                  >
                    <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-[#1a2236] font-semibold">
                      {testimonial.initials || testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  {isActive && (
                    <div className="absolute inset-0 rounded-full border-2 border-yellow-400 animate-ping opacity-75" />
                  )}
                </div>
              )
            })}
          </div>

          <div className="flex-1 max-w-lg">
            <div
              key={selectedTestimonial.id}
              className="bg-[#1a2236]/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-yellow-400/20 animate-in fade-in-50 slide-in-from-right-5 duration-500 flex flex-col h-[550px]"
            >
              {/* Rating Stars - Only show if rating exists */}
              {selectedTestimonial.rating && (
                <div className="flex gap-1 mb-6">
                  {[...Array(selectedTestimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              )}

              <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
                <blockquote className="theme-text-light leading-relaxed font-medium">
                  {renderTestimonialContent(selectedTestimonial)}
                </blockquote>
              </div>

              <div className="flex items-center gap-4 mt-6">
                <Avatar className="w-12 h-12 ring-2 ring-yellow-100">
                  <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-[#1a2236] font-semibold">
                    {selectedTestimonial.initials || selectedTestimonial.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold theme-text-light">{selectedTestimonial.name}</div>
                  <div className="text-yellow-400 text-sm font-medium">{selectedTestimonial.designation}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-8 mt-16">
          <button
            onClick={goToPrevious}
            className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg hover:bg-yellow-500 transition-all duration-200 hover:scale-110 active:scale-95"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-6 h-6 text-[#1a2236]" />
          </button>
          <button
            onClick={goToNext}
            className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg hover:bg-yellow-500 transition-all duration-200 hover:scale-110 active:scale-95"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-6 h-6 text-[#1a2236]" />
          </button>
        </div>
      </div>
    </div>
  )
}

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
           <div className="text-center mb-12 animate-slide-in-bottom">
             <Badge className="mb-4 bg-yellow-400/10 text-yellow-400 border-yellow-400/20">
               🔬 AES EXPLORERS
             </Badge>
             <h1 className="text-6xl lg:text-7xl font-black bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent mb-4 animate-slide-in-bottom">
               AES EXPLORERS
             </h1>
             <h2 className="text-4xl lg:text-5xl font-bold theme-text-light mb-6">
               Research-Based Mentorship Program
             </h2>
             <p className="text-lg theme-text-muted max-w-4xl mx-auto animate-slide-in-bottom" style={{ animationDelay: '0.2s' }}>
               Our flagship program introduces middle and high school students to graduate-level research methodology, critical thinking, and academic publishing. Work with Ph.D. mentors on personalized research problems that match your interests.
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
                    <ArrowRight className="mr-2 h-5 w-5" /> Book Free Session
                  </Button>
                </Link>
              </div>
            </motion.div>
         </div>
       </section>

       {/* Why Research Section - Redesigned and Beautiful */}
       <section className="py-16 theme-bg-dark relative overflow-hidden">
         {/* Animated Background Elements */}
         <div className="absolute inset-0 overflow-hidden">
           <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-400 rounded-full opacity-10 animate-float"></div>
           <div className="absolute top-40 right-20 w-16 h-16 bg-blue-400 rounded-full opacity-10 animate-float-reverse"></div>
           <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-purple-400 rounded-full opacity-10 animate-float"></div>
           <div className="absolute top-1/3 right-1/3 w-8 h-8 bg-green-400 rounded-full opacity-10 animate-float-reverse"></div>
         </div>
         
         <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
           <motion.div
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8 }}
             className="max-w-4xl mx-auto"
           >
             <div className="relative bg-gradient-to-br from-[#1a2236]/80 to-[#1a2236]/60 backdrop-blur-xl border border-yellow-400/30 rounded-3xl p-10 shadow-2xl overflow-hidden">
               {/* Decorative elements */}
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-yellow-400/20 to-amber-500/10 rounded-full blur-2xl"></div>
               <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-br from-yellow-400/10 to-amber-500/20 rounded-full blur-2xl"></div>
               
               {/* Top accent line */}
               <div className="w-full h-1 bg-gradient-to-r from-yellow-400/20 via-yellow-400 to-yellow-400/20 rounded-full mb-8"></div>
               
               <div className="text-center mb-8">
                 <Badge className="mb-6 bg-gradient-to-r from-yellow-400/20 to-amber-500/20 text-yellow-300 border-yellow-400/30 px-6 py-2 text-lg">
                   Why Research?
                 </Badge>
                 <h2 className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent mb-8 leading-tight">
                   Research Excellence
                 </h2>
               </div>
               
               <div className="space-y-6">
                 <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.1 }}
                   className="flex items-center gap-4"
                 >
                   <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center flex-shrink-0">
                     <Star className="h-6 w-6 text-[#1a2236]" />
                   </div>
                   <p className="text-xl theme-text-light font-medium">Boost your academic profile and intellectual vitality ratings.</p>
                 </motion.div>
                 
                 <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.2 }}
                   className="flex items-center gap-4"
                 >
                   <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center flex-shrink-0">
                     <Brain className="h-6 w-6 text-[#1a2236]" />
                   </div>
                   <p className="text-xl theme-text-light font-medium">Showcase initiative, critical thinking, and problem-solving skills.</p>
                 </motion.div>
                 
                 <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.3 }}
                   className="flex items-center gap-4"
                 >
                   <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center flex-shrink-0">
                     <GraduationCap className="h-6 w-6 text-[#1a2236]" />
                   </div>
                   <p className="text-xl theme-text-light font-medium">Open doors to Ivy League and top university admissions.</p>
                 </motion.div>
                 
                 <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.4 }}
                   className="flex items-center gap-4"
                 >
                   <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center flex-shrink-0">
                     <Award className="h-6 w-6 text-[#1a2236]" />
                   </div>
                   <p className="text-xl theme-text-light font-medium">Gain recognition through publication and competitions.</p>
                 </motion.div>
               </div>
               
               {/* Bottom accent line */}
               <div className="w-full h-1 bg-gradient-to-r from-yellow-400/20 via-yellow-400 to-yellow-400/20 rounded-full mt-8"></div>
             </div>
           </motion.div>
         </div>
       </section>

                                                               {/* Research Domains Section */}
          <section className="py-24 theme-bg-dark relative">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(120,119,198,0.1),transparent_50%)]"></div>
            
            <div className="container mx-auto px-4 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-center mb-20"
              >
                <Badge className="mb-6 bg-gradient-to-r from-yellow-400/20 to-amber-500/20 text-yellow-300 border-yellow-400/30 px-6 py-2 text-lg">
                  🔬 Research Domains
                </Badge>
                <h2 className="text-5xl lg:text-6xl font-black theme-text-light mb-8 leading-tight">
                  Choose Your
                  <span className="theme-text-light leading-tight text-blue-400">
                    {" "}Research Path
                  </span>
                </h2>
                <p className="text-xl lg:text-2xl theme-text-muted max-w-4xl mx-auto leading-relaxed">
                  Explore our comprehensive research domains and find your perfect match with expert mentors
                </p>
              </motion.div>
              
              <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
                {domains.map((domain, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.2, duration: 0.8 }}
                                         className="relative"
                  >
                                                              {/* Main card */}
                     <div className="relative bg-gradient-to-br from-[#1a2236]/80 to-[#1a2236]/60 backdrop-blur-xl border border-yellow-400/20 rounded-3xl p-8 shadow-2xl overflow-hidden h-48">
                        
                        {/* Content */}
                        <div className="relative z-10 h-full flex flex-col">
                          <div className="flex items-start gap-6 flex-1">
                            {/* Icon */}
                            <div className={`flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br ${domain.color} flex items-center justify-center shadow-2xl`}>
                              <domain.icon className="h-10 w-10 text-white" />
                            </div>
                            
                            {/* Text content */}
                            <div className="flex-1 flex flex-col">
                              <h3 className="text-3xl font-bold theme-text-light mb-4">
                                {domain.title}
                              </h3>
                              <p className="text-lg theme-text-muted leading-relaxed flex-1">
                                {domain.description}
                              </p>
                            </div>
                          </div>
                          
                          {/* Bottom accent line */}
                          <div className="mt-auto w-full h-1 bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent"></div>
                        </div>
                      </div>
                  </motion.div>
                ))}
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
               <span className="theme-text-light leading-tight text-blue-400"> Research Excellence</span>
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

                                               {/* Pricing */}
                        <div className="space-y-4">
                          <h4 className="font-bold text-cyan-300 text-lg border-b border-slate-600/50 pb-2">
                            Pricing:
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

      {/* Testimonials Section */}
      <section className="py-20 theme-bg-dark">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-yellow-400/10 text-yellow-400">Student Success</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold theme-text-light mb-6">What Our Researchers Say</h2>
            <p className="text-xl theme-text-muted max-w-3xl mx-auto">Hear from students who have conducted research through AES EXPLORERS.</p>
          </motion.div>
          
          {/* Rotating Circular Testimonials */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="max-w-6xl mx-auto relative"
          >
            <TestimonialsSection />
          </motion.div>
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
            
                         <div className="flex justify-center pt-4">
               <Link href="/book-session">
                 <Button className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#1a2236] hover:from-yellow-300 hover:to-yellow-400 px-6 shadow-lg font-bold">
                   Book Free Consultation
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