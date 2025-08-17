"use client";
import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, Calculator, FlaskConical, Atom, Trophy, Star, Globe, Clock, ArrowRight, CheckIcon, ChevronDown, ChevronLeft, ChevronRight, FileText, Target } from "lucide-react";
import Footer from "@/components/home/Footer";
import Chatbot from "@/components/home/Chatbot";
import Header from "@/components/home/Header";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import FlipCard, { FlipCardFront, FlipCardBack } from "@/components/ui/flip-card";
import { CardStack } from "@/components/ui/card-stack";
import { Highlight } from "@/components/ui/highlight";
import { useState, useEffect, useCallback, useRef } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Image from "next/image"
import Link from "next/link"

const subjects = [
  {
    icon: Calculator,
    title: "Mathematics",
    description: "Comprehensive math tutoring from middle school to advanced levels",
    color: "from-blue-500 to-blue-600",
    courses: [
      "IM1, IM2, IM3",
      "Algebra I & II",
      "Geometry, Trigonometry",
      "Pre-Calculus & AP Pre-Calc",
      "AP Calculus AB / BC",
      "Multivariable Calculus",
      "AP Statistics",
      "Linear Algebra"
    ]
  },
  {
    icon: Atom,
    title: "Physics",
    description: "From fundamentals to advanced AP courses",
    color: "from-teal-500 to-teal-600",
    courses: [
      "Regular Physics",
      "Honors Physics",
      "AP Physics I / II",
      "AP Physics C (Mechanics & E&M)"
    ]
  },
  {
    icon: FlaskConical,
    title: "Chemistry",
    description: "Comprehensive chemistry education",
    color: "from-orange-500 to-orange-600",
    courses: [
      "Regular Chemistry",
      "Honors Chemistry",
      "NGSS Chemistry",
      "AP Chemistry"
    ]
  },
  {
    icon: BookOpen,
    title: "Biology",
    description: "Life sciences made simple",
    color: "from-green-500 to-green-600",
    courses: [
      "Regular Biology",
      "AP Biology"
    ]
  },
];

const tutoringAdvantages = [
  {
    advantage: "Personalized Approach",
    meaning: "Every lesson is tailored to the student's learning pace, style, and academic goals."
  },
  {
    advantage: "Flexible Options",
    meaning: "Choose between face-to-face or online sessions that work around your schedule."
  },
  {
    advantage: "Proven Results",
    meaning: "95% of our AP students score a 4 or 5 in AP Calc, AP Chem, or AP Physics."
  },
  {
    advantage: "Challenge-based Acceleration Track",
    meaning: "Focused pathway designed to help them complete a full year of curriculum in as little as 9 months."
  }
];

const learningFeatures = [
  {
    title: "Build Strong Foundations",
    icon: BookOpen,
    color: "from-indigo-500 to-purple-600"
  },
  {
    title: "Custom Worksheets",
    icon: FileText,
    color: "from-emerald-500 to-teal-600"
  },
  {
    title: "Mock Exams & Feedback",
    icon: CheckIcon,
    color: "from-rose-500 to-pink-600"
  },
  {
    title: "Targeted Practice",
    icon: Target,
    color: "from-violet-500 to-indigo-600"
  },
  {
    title: "Comprehensive Curriculum",
    icon: Globe,
    color: "from-cyan-500 to-blue-600"
  }
];

// Helper function to generate initials from name
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2); // Take max 2 initials
}

const testimonialCards = [
  {
    id: 0,
    name: "Pragna",
    designation: "Physics: 95% | Math: B's to A's",
    initials: getInitials("Pragna"),
    rating: 5,
    content: (
      <p>
        ACHARYA Educational Services has significantly improved my academic performance in both physics and math. With their guidance, I achieved a <Highlight>95 on my physics midterm</Highlight> and raised my math test scores from low B&apos;s to consistent A&apos;s. The tutors are knowledgeable, clear in their explanations, and genuinely committed to student success.
      </p>
    ),
  },
  {
    id: 1,
    name: "Adwitha",
    designation: "Math Grade: D to A",
    initials: getInitials("Adwitha"),
    rating: 5,
    content: (
      <p>
        Shanti Swaroop is a great tutor and has helped improve in math a lot. I went from a <Highlight>D to an A this year</Highlight>. Math is now easier than before when I was struggling everything finally clicked. My confidence in math has grown throughout the year.
      </p>
    ),
  },
  {
    id: 2,
    name: "Lalit Pinisetti",
    designation: "Personalized Learning Success",
    initials: getInitials("Lalit Pinisetti"),
    rating: 5,
    content: (
      <p>
        The tutor is strict with students when he needs to be strict, and gentle with students when he needs to be gentle. He truly understands what each student is capable of and <Highlight>motivates each student precisely enough</Highlight> for their highest chances of success. He makes each topic easy to understand for students and is overall a great teacher.
      </p>
    ),
  },
  {
    id: 3,
    name: "Ruhee",
    designation: "AP Calculus Confidence",
    initials: getInitials("Ruhee"),
    rating: 5,
    content: (
      <p>
        I joined because I wanted help in preparing for the AP Calculus exam, and these sessions definitely <Highlight>boosted my confidence</Highlight> in and familiarity with the subject. Shanti provided lots of good practice problems, explained concepts that I didn&apos;t understand at first, and was patient if it took me a while to figure something out. Overall, great experience!
      </p>
    ),
  },
  {
    id: 4,
    name: "Rishitha",
    designation: "Tailored Learning Method",
    initials: getInitials("Rishitha"),
    rating: 5,
    content: (
      <p>
        I have joined these classes to help me get hold and excel in some of the classes that I am taking in school. Shanti Swaroop gained insights on how I learn and <Highlight>tailors the classes based on that</Highlight> which helps me to understand the different concepts even better. His way of teaching is very unique and different from any other tutor.
      </p>
    ),
  },
  {
    id: 5,
    name: "Sloane Stenson",
    designation: "Online Learning Success",
    initials: getInitials("Sloane Stenson"),
    rating: 5,
    content: (
      <p>
        Shanti Swaroop is very helpful to me as my tutor. He thoroughly explains every question I have to me and provides me with <Highlight>extra practice when needed</Highlight>. Being available via zoom makes tutoring easier and more accessible.
      </p>
    ),
  },
  {
    id: 6,
    name: "Geetika",
    designation: "Pre-Calculus Mastery",
    initials: getInitials("Geetika"),
    rating: 5,
    content: (
      <p>
        I joined these classes because I need help with Pre-Calculus, and every time I come to my classes I leave feeling <Highlight>more confident in the topic</Highlight> I am learning. Going to these classes helped me improve my test scores and helped me improve my overall grade in my pre-calculus class.
      </p>
    ),
  },
  {
    id: 7,
    name: "IM1 Tutoring: Sutter Middle School",
    designation: "Patient Teaching Approach",
    initials: getInitials("IM1 Tutoring: Sutter Middle School"),
    rating: 5,
    content: (
      <p>
        Shanti Swaroop is very patient and positive. Our daughter is having difficulty keeping up with the pace of her teacher at school. Shanti is better at <Highlight>explaining the concepts and allows her time to learn</Highlight>. He is very encouraging and helps to boost her confidence.
      </p>
    ),
  },
  {
    id: 8,
    name: "Pre-Calc Tutoring: Folsom High School",
    designation: "Interactive Learning",
    initials: getInitials("Pre-Calc Tutoring: Folsom High School"),
    rating: 5,
    content: (
      <p>
        Amazing Service! Shanti Swaroop is very interactive and focused with my kid. He <Highlight>explains concepts very well in multiple different ways</Highlight> and also a very nice and understanding person. Great Tutor!
      </p>
    ),
  },
  {
    id: 9,
    name: "IM3 Tutoring: Folsom High School",
    designation: "Flexible Scheduling",
    initials: getInitials("IM3 Tutoring: Folsom High School"),
    rating: 5,
    content: (
      <p>
        Shanti Swaroop has flexible scheduling and we worked together to find the best days to meet that provide the most benefit for my son. He makes sure that my son is not just working on math when he is in his session but rather, he also asks that my son check in, <Highlight>provides updates and samples of what he is working on</Highlight>.
      </p>
    ),
  },
  {
    id: 10,
    name: "IM2 Tutoring: Folsom High School",
    designation: "Professional Methodology",
    initials: getInitials("IM2 Tutoring: Folsom High School"),
    rating: 5,
    content: (
      <p>
        Shanti Swaroop is a great Tutor! He is very professional and organized in his methodology. You can tell right away that he <Highlight>cares about the students</Highlight>. He provides a game plan for his students. Would definitely recommend him.
      </p>
    ),
  },
  {
    id: 11,
    name: "IM1 Tutoring: Folsom High School",
    designation: "Concept Breakdown",
    initials: getInitials("IM1 Tutoring: Folsom High School"),
    rating: 5,
    content: (
      <p>
        Shanti has been really good about breaking down the steps of my son&apos;s struggles. He provided help with preparing for quizzes and tests. He has provided <Highlight>tips and tricks that helped math concepts makes sense</Highlight> that common core just is not accomplishing.
      </p>
    ),
  },
];

const faqs = [
  {
    question: "What subjects do you tutor?",
    answer: "We offer comprehensive tutoring in Mathematics (IM1-3, Algebra, Geometry, Calculus, Statistics), Physics (Regular, Honors, AP), Chemistry (Regular, Honors, NGSS, AP), and Biology (Regular, AP)."
  },
  {
    question: "Are sessions online or in-person?",
    answer: "We offer both options to fit your schedule and learning preferences. You can choose face-to-face sessions or online tutoring from anywhere."
  },
  {
    question: "How do you personalize the tutoring approach?",
    answer: "Every student receives a customized learning plan based on their current level, learning style, and academic goals. We adapt our teaching methods to match how each student learns best."
  },
  {
    question: "What are your success rates?",
    answer: "98% of our students improve their grades within one semester, and 95% of AP students score 4 or above on their AP exams."
  },
  {
    question: "How do I get started?",
    answer: "Start with a free consultation where we'll assess your needs and match you with the right tutor. You can schedule this through our website or by calling us directly."
  }
];

function TestimonialsSection() {
  const [selectedTestimonial, setSelectedTestimonial] = useState(testimonialCards[0])
  const [isVisible, setIsVisible] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [animatingIndex, setAnimatingIndex] = useState(0)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

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
  }, [])

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

  const getTestimonialText = (content: any): string => {
    if (typeof content === 'string') return content
    if (content?.props?.children?.props?.children) return content.props.children.props.children
    if (content?.props?.children) return content.props.children
    return "Amazing testimonial content"
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
                const radius = 250 // Increased radius for more spacing between avatars
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
              className="bg-[#1a2236]/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-yellow-400/20 animate-in fade-in-50 slide-in-from-right-5 duration-500"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(selectedTestimonial.rating || 5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <blockquote className="theme-text-light text-lg leading-relaxed mb-6 font-medium">
                {selectedTestimonial.content}
              </blockquote>

              <div className="flex items-center gap-4">
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

export default function AcademicTutoringPage() {

  return (
    <main className="min-h-screen theme-bg-dark flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="theme-bg-dark py-16 lg:py-24 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-400 rounded-full opacity-10 animate-float"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-blue-400 rounded-full opacity-10 animate-float-reverse"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-purple-400 rounded-full opacity-10 animate-float"></div>
          <div className="absolute top-1/3 right-1/3 w-8 h-8 bg-green-400 rounded-full opacity-10 animate-float-reverse"></div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 animate-slide-in-bottom">
            <Badge className="mb-4 bg-yellow-400/10 text-yellow-400 border-yellow-400/20">
              ✨ Academic Tutoring
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold theme-text-light mb-6">
              Empowering Every Learner Through Personalized Tutoring
            </h1>
            <p className="text-lg theme-text-muted max-w-4xl mx-auto animate-slide-in-bottom" style={{ animationDelay: '0.2s' }}>
              We offer tailored academic tutoring for students from middle school to high school, including AP-level coursework. With a strong emphasis on personalization, foundational understanding, and academic excellence, our program helps students not only succeed but thrive.
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
                  <ArrowRight className="mr-2 h-5 w-5" /> Book Free Consultation
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>



      {/* Subjects Section */}
      <section className="py-20 theme-bg-dark">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-yellow-400/10 text-yellow-400">Our Programs</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold theme-text-light mb-6">Subjects We Offer</h2>
            <p className="text-xl theme-text-muted max-w-3xl mx-auto">
              Comprehensive tutoring across all major subjects with specialized expertise in advanced coursework.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {subjects.map((subject, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: index * 0.15, duration: 0.6, type: "spring", stiffness: 100 }}
                className="relative group"
                whileHover={{ scale: 1.05 }}
              >
                                 <FlipCard height="h-80" className="group">
                   <FlipCardFront>
                     <div className={`w-full h-full bg-gradient-to-br ${subject.color} rounded-3xl p-8 flex flex-col items-center justify-center text-white shadow-2xl border-2 border-white/20 overflow-hidden relative group-hover:shadow-3xl transition-all duration-500`}>
                       {/* Enhanced animated background pattern */}
                       <div className="absolute inset-0 opacity-20">
                         <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/30 via-white/10 to-transparent animate-pulse"></div>
                         <div className="absolute -top-12 -right-12 w-24 h-24 bg-white/15 rounded-full animate-bounce" style={{ animationDelay: `${index * 0.2}s` }}></div>
                         <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-white/15 rounded-full animate-ping" style={{ animationDelay: `${index * 0.3}s` }}></div>
                         <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-white/10 rounded-full animate-float" style={{ animationDelay: `${index * 0.4}s` }}></div>
                       </div>
                       
                       {/* Enhanced icon with better glow effect */}
                       <motion.div 
                         className="w-24 h-24 bg-white/25 backdrop-blur-sm rounded-full flex items-center justify-center mb-6 relative group-hover:scale-110 transition-all duration-500 border border-white/30"
                         whileHover={{ 
                           scale: 1.15,
                           boxShadow: "0 0 40px rgba(255,255,255,0.4)"
                         }}
                         animate={{ 
                           boxShadow: ["0 0 25px rgba(255,255,255,0.2)", "0 0 40px rgba(255,255,255,0.3)", "0 0 25px rgba(255,255,255,0.2)"]
                         }}
                         transition={{ duration: 2, repeat: Infinity }}
                       >
                         <subject.icon className="h-12 w-12 text-white drop-shadow-lg" />
                       </motion.div>
                       
                       {/* Enhanced title with better styling */}
                       <motion.h3 
                         className="text-3xl font-bold text-center mb-4 relative text-white drop-shadow-lg"
                         whileHover={{ scale: 1.05 }}
                       >
                         {subject.title}
                         <motion.div 
                           className="absolute bottom-0 left-1/2 w-0 h-1 bg-white transform -translate-x-1/2 rounded-full"
                           whileHover={{ width: "90%" }}
                           transition={{ duration: 0.4 }}
                         />
                       </motion.h3>
                       
                       <p className="text-base text-center opacity-95 mb-6 leading-relaxed font-medium">{subject.description}</p>
                       
                       
                     </div>
                   </FlipCardFront>
                  
                                     <FlipCardBack>
                     <div className="w-full h-full bg-gradient-to-br from-[#1a2236] via-[#2a3246] to-[#1a2236] rounded-3xl p-8 flex flex-col items-center justify-center shadow-2xl border-2 border-yellow-400/40 overflow-hidden relative backdrop-blur-sm">
                       {/* Enhanced animated background elements */}
                       <div className="absolute inset-0 opacity-10">
                         <div className="absolute top-6 right-6 w-12 h-12 border-2 border-yellow-400/30 rounded-full animate-spin"></div>
                         <div className="absolute bottom-6 left-6 w-10 h-10 border border-yellow-400/20 rounded-full animate-ping"></div>
                         <div className="absolute top-1/2 left-1/2 w-8 h-8 border border-yellow-400/15 rounded-full animate-float"></div>
                       </div>
                       
                       {/* Enhanced glowing title */}
                       <motion.h3 
                         className="text-3xl font-bold text-yellow-400 text-center mb-8 relative drop-shadow-lg"
                         animate={{ 
                           textShadow: [
                             "0 0 15px rgba(250, 204, 21, 0.6)",
                             "0 0 25px rgba(250, 204, 21, 0.9)",
                             "0 0 15px rgba(250, 204, 21, 0.6)"
                           ]
                         }}
                         transition={{ duration: 2, repeat: Infinity }}
                       >
                         {subject.title}
                       </motion.h3>
                       
                                               {/* Enhanced animated course list */}
                        <div className="space-y-4 text-sm max-h-36 overflow-y-auto px-4 custom-scrollbar">
                         {subject.courses.map((course, courseIndex) => (
                           <motion.div 
                             key={courseIndex} 
                             className="theme-text-light text-center flex items-center justify-center gap-3 bg-yellow-400/10 backdrop-blur-sm px-4 py-2 rounded-full border border-yellow-400/20"
                             initial={{ opacity: 0, x: -20 }}
                             animate={{ opacity: 1, x: 0 }}
                             transition={{ delay: courseIndex * 0.1, duration: 0.5 }}
                             whileHover={{ 
                               scale: 1.05,
                               backgroundColor: "rgba(250, 204, 21, 0.15)"
                             }}
                           >
                             <motion.div 
                               className="w-2 h-2 bg-yellow-400 rounded-full"
                               animate={{ scale: [1, 1.5, 1] }}
                               transition={{ duration: 1, repeat: Infinity, delay: courseIndex * 0.2 }}
                             />
                             <span className="font-medium">{course}</span>
                           </motion.div>
                         ))}
                       </div>
                       
                                               {/* Enhanced click indicator */}
                        <motion.div 
                          className="mt-8 flex items-center gap-3 text-sm text-yellow-400 bg-yellow-400/10 backdrop-blur-sm px-4 py-2 rounded-full border border-yellow-400/30"
                          animate={{ 
                            opacity: [0.7, 1, 0.7],
                            y: [0, -2, 0]
                          }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <motion.div 
                            className="w-2 h-2 bg-yellow-400 rounded-full"
                            animate={{ scale: [1, 1.4, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          />
                          {/* Click to flip back */}
                        </motion.div>
                     </div>
                   </FlipCardBack>
                </FlipCard>
                
                                 {/* Enhanced hover effect glow */}
                 <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-yellow-400/0 via-yellow-400/20 to-yellow-400/0 opacity-0 group-hover:opacity-100 transition-all duration-700 blur-2xl -z-10 scale-110"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tutoring Advantages Section */}
      <section className="py-20 theme-bg-dark">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-yellow-400/10 text-yellow-400">Why Choose Us</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold theme-text-light mb-6">Our Tutoring Advantage</h2>
          </motion.div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-[#1a2236]/90 to-[#1a2236]/80 backdrop-blur-xl rounded-3xl p-8 border border-yellow-400/20 shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-yellow-400/20">
                      <th className="text-left py-4 px-6 text-lg font-bold text-yellow-400">Advantage</th>
                      <th className="text-left py-4 px-6 text-lg font-bold text-yellow-400">What It Means</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tutoringAdvantages.map((item, index) => (
                      <tr key={index} className="border-b border-yellow-400/10 hover:bg-yellow-400/5">
                        <td className="py-4 px-6 font-semibold theme-text-light">{item.advantage}</td>
                        <td className="py-4 px-6 theme-text-muted">{item.meaning}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Features Section */}
      {/* <section className="py-20 theme-bg-dark">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-yellow-400/10 text-yellow-400">Learning Approach</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold theme-text-light mb-6">Stay ahead with our personalized tutoring</h2>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {learningFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full bg-[#1a2236] border-2 border-yellow-400/20 hover:border-yellow-400/40 hover:shadow-xl transition-all duration-300 rounded-3xl overflow-hidden group">
                  <CardHeader className="text-center pb-4">
                    <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${feature.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="h-10 w-10 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold theme-text-light">{feature.title}</CardTitle>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}
            {/* Learning Features Section */}
            <section className="py-20 theme-bg-dark">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-yellow-400/10 text-yellow-400 border-yellow-400/20">
              ✨ Learning Approach
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold theme-text-light mb-6">
              Stay ahead with our personalized tutoring
            </h2>
            <p className="text-xl theme-text-muted max-w-3xl mx-auto leading-relaxed">
              Discover our comprehensive suite of educational tools designed to accelerate your learning journey with
              modern, effective methods.
            </p>
          </motion.div>
          
          {/* Main Grid - 3 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {[
              {
                title: "Build Strong Foundations",
                description: "Establish solid fundamentals with our comprehensive learning approach that ensures deep understanding.",
                icon: BookOpen,
                color: "from-blue-500 to-indigo-600",
                features: ["Step-by-step learning", "Concept mastery", "Progress tracking"],
                stats: "95% retention rate"
              },
              {
                title: "Custom Worksheets",
                description: "Personalized practice materials tailored to your learning style and progress for better results.",
                icon: FileText,
                color: "from-emerald-500 to-teal-600",
                features: ["Adaptive difficulty", "Personalized content", "Instant feedback"],
                stats: "3x faster progress"
              },
              {
                title: "Mock Exams & Feedback",
                description: "Realistic practice tests with detailed feedback and performance analytics to track improvement.",
                icon: Target,
                color: "from-orange-500 to-red-600",
                features: ["Real exam simulation", "Detailed analytics", "Performance insights"],
                stats: "100% exam readiness"
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="relative h-full">
                  {/* Subtle Glow Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-2xl blur-xl opacity-5 group-hover:opacity-20 transition-all duration-500`}></div>
                  
                  {/* Main Card */}
                  <div className="relative bg-gradient-to-br from-[#1a2236] to-[#2a3246] border border-yellow-400/20 rounded-2xl overflow-hidden h-full flex flex-col group-hover:border-yellow-400/40 group-hover:shadow-2xl transition-all duration-500 hover:transform hover:scale-[1.02] hover:-translate-y-1">
                    
                    {/* Top Icon Section */}
                    <div className="p-6 pb-4">
                      <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <feature.icon className="h-8 w-8 text-white" />
                      </div>
                      
                      {/* Title */}
                      <h3 className="text-xl font-bold theme-text-light mb-3 group-hover:text-yellow-400 transition-colors duration-300">
                        {feature.title}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-sm theme-text-muted leading-relaxed mb-4">
                        {feature.description}
                      </p>
                    </div>

                    {/* Features List */}
                    <div className="px-6 pb-4 flex-1">
                      <div className="space-y-2">
                        {feature.features.map((item, idx) => (
                          <div key={idx} className="flex items-center space-x-3">
                            <div className={`w-1.5 h-1.5 bg-gradient-to-r ${feature.color} rounded-full flex-shrink-0`}></div>
                            <span className="text-xs theme-text-muted group-hover:theme-text-light transition-colors duration-300">
                              {item}
                            </span>
                          </div>
                        ))}
                        </div>
                      </div>
                    
                                         {/* Bottom Stats */}
                     <div className="px-6 pb-6 mt-auto">
                       <div className="flex items-center justify-center">
                         <span className="text-xs font-medium text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-full">
                           {feature.stats}
                         </span>
                       </div>
                     </div>
                    
                    {/* Hover Border Effect */}
                    <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r ${feature.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom 2 Cards - Wider Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {[
                {
                  title: "Targeted Practice",
                  description: "Focus on your weak areas with intelligent practice sessions that adapt to your specific needs.",
                 icon: Target,
                  color: "from-pink-500 to-rose-600",
                 features: ["Adaptive difficulty", "Weak area focus", "Progress monitoring"],
                 stats: "Smart targeting"
                },
                {
                  title: "Comprehensive Curriculum",
                 description: "Complete learning pathway covering all essential topics with structured progression from basics to advanced.",
                 icon: BookOpen,
                  color: "from-indigo-500 to-blue-600",
                 features: ["Structured learning", "Topic coverage", "Advanced progression"],
                 stats: "Full coverage"
                },
              ].map((feature, index) => (
                <motion.div
                  key={index + 3}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: (index + 3) * 0.1 }}
                  className="group"
                >
                  <div className="relative h-full">
                  {/* Subtle Glow Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-2xl blur-xl opacity-5 group-hover:opacity-20 transition-all duration-500`}></div>
                    
                    {/* Main Card */}
                  <div className="relative bg-gradient-to-br from-[#1a2236] to-[#2a3246] border border-yellow-400/20 rounded-2xl overflow-hidden h-full flex flex-col group-hover:border-yellow-400/40 group-hover:shadow-2xl transition-all duration-500 hover:transform hover:scale-[1.02] hover:-translate-y-1">
                    
                                         {/* Header with Icon */}
                     <div className="p-6 pb-4">
                       <div className="flex justify-end items-start mb-4">
                         <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                           <feature.icon className="h-7 w-7 text-white" />
                         </div>
                        </div>
                        
                      {/* Title */}
                      <h3 className="text-2xl font-bold theme-text-light mb-3 group-hover:text-yellow-400 transition-colors duration-300">
                          {feature.title}
                      </h3>
                        
                      {/* Description */}
                      <p className="text-base theme-text-muted leading-relaxed mb-4">
                          {feature.description}
                      </p>
                    </div>

                    {/* Features List */}
                    <div className="px-6 pb-4 flex-1">
                      <div className="space-y-3">
                        {feature.features.map((item, idx) => (
                          <div key={idx} className="flex items-center space-x-3">
                            <div className={`w-2 h-2 bg-gradient-to-r ${feature.color} rounded-full flex-shrink-0`}></div>
                            <span className="text-sm theme-text-muted group-hover:theme-text-light transition-colors duration-300">
                              {item}
                            </span>
                            </div>
                        ))}
                          </div>
                        </div>
                    
                                         {/* Bottom Stats */}
                     <div className="px-6 pb-6 mt-auto">
                       <div className="flex items-center justify-center">
                         <span className="text-xs font-medium text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-full">
                           {feature.stats}
                         </span>
            </div>
          </div>

                    {/* Hover Border Effect */}
                    <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r ${feature.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
            </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Track Record Section */}
      <section className="py-20 theme-bg-dark">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-yellow-400/10 text-yellow-400">Success Metrics</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold theme-text-light mb-6">Our Track Record of Excellence</h2>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl font-bold text-[#1a2236]">100%</span>
              </div>
              <h3 className="text-2xl font-bold theme-text-light mb-4">Grade Improvement</h3>
              <p className="text-lg theme-text-muted">In general 98% of our students improved their grades within one semester</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center"
            >
              <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl font-bold text-[#1a2236]">95%</span>
              </div>
              <h3 className="text-2xl font-bold theme-text-light mb-4">AP Success Rate</h3>
              <p className="text-lg theme-text-muted">95% of students secured 4 and above in all AP Courses</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 theme-bg-dark">
        {/* Background Pattern */}
        {/* <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                              radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }} />
        </div>
        
        {/* Subtle Glow Effects */}
        {/* <div className="absolute top-20 left-20 w-40 h-40 bg-yellow-400/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-blue-400/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-purple-400/5 rounded-full blur-3xl"></div>  */}

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-yellow-400/10 text-yellow-400">Student Success</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold theme-text-light mb-6">What Parents & Students Say</h2>
            <p className="text-xl theme-text-muted max-w-3xl mx-auto">Hear from our successful students and their parents about their AES tutoring experience.</p>
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
            className="max-w-4xl mx-auto space-y-6 sm:space-y-8"
          >
            <Badge className="mb-4 bg-yellow-400/10 text-yellow-400 border-yellow-400/20">
              🚀 Start Your Journey Today
            </Badge>
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold theme-text-light leading-tight">
              Ready to Begin?
            </h2>
            
            <p className="text-base sm:text-lg lg:text-xl theme-text-muted px-4 leading-relaxed max-w-3xl mx-auto">
              Let&apos;s help your student ACHIEVE their goals.
            </p>
            
            {/* Three Steps */}
            <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto pt-4">
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 bg-yellow-400/20 rounded-full flex items-center justify-center">
                  <CheckIcon className="h-5 w-5 text-yellow-400" />
                </div>
                <span className="text-sm theme-text-light">Schedule a Free Consultation</span>
              </div>
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 bg-yellow-400/20 rounded-full flex items-center justify-center">
                  <CheckIcon className="h-5 w-5 text-yellow-400" />
                </div>
                <span className="text-sm theme-text-light">Get Matched with the Right Tutor</span>
              </div>
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 bg-yellow-400/20 rounded-full flex items-center justify-center">
                  <CheckIcon className="h-5 w-5 text-yellow-400" />
                </div>
                <span className="text-sm theme-text-light">Watch the Confidence Grow</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center pt-4">
              <Link href="/book-session">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 hover:from-yellow-300 hover:to-yellow-400 text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold w-full sm:w-auto"
                >
                  <ArrowRight className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Get Started Today
                </Button>
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="pt-8 border-t border-gray-700/30"
            >
              <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 text-sm theme-text-muted">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>100% Free Initial Session</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>No Commitment Required</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Expert Mentorship</span>
                </div>
              </div>
            </motion.div>
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
            <p className="text-xl theme-text-muted max-w-3xl mx-auto">
              Find answers to common questions about our tutoring services, scheduling, and more.
            </p>
          </motion.div>
          
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible>
              <div className="space-y-6">
                {faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="border-none">
                    <div>
                      <AccordionTrigger className="flex items-center gap-4 px-6 py-4 bg-yellow-400/10 rounded-full font-bold text-lg text-yellow-400 hover:bg-yellow-400/20 hover:no-underline transition-all">
                        <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-[#1a2236] font-bold">Q</div>
                        <span className="text-left">{faq.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="relative px-0 pb-4 pt-0">
                        <div className="relative bg-[#1a2236] rounded-2xl shadow-lg p-6 text-base font-medium theme-text-light mt-2 ml-10 border border-yellow-400/20">
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
      
      <Footer />
      <Chatbot />

             {/* Custom CSS for 3D card flipping */}
       <style jsx global>{`
         .transform-style-preserve-3d {
           transform-style: preserve-3d;
         }
         .perspective-1000 {
           perspective: 1000px;
         }
         .rotate-y-180 {
           transform: rotateY(180deg);
         }
         .backface-hidden {
           backface-visibility: hidden;
         }
         
         /* Enhanced card animations */
         .card-glow {
           box-shadow: 0 0 20px rgba(250, 204, 21, 0.3);
         }
         
         .card-hover-lift {
           transform: translateY(-8px);
           box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
         }
         
         /* Smooth flip transitions */
         .flip-card {
           transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
         }
         
         /* Floating animation for background elements */
         @keyframes float-subtle {
           0%, 100% { transform: translateY(0px) rotate(0deg); }
           50% { transform: translateY(-10px) rotate(5deg); }
         }
         
         .animate-float-subtle {
           animation: float-subtle 6s ease-in-out infinite;
         }
         
         /* Pulse glow effect */
         @keyframes pulse-glow {
           0%, 100% { 
             box-shadow: 0 0 20px rgba(250, 204, 21, 0.3);
             transform: scale(1);
           }
           50% { 
             box-shadow: 0 0 30px rgba(250, 204, 21, 0.6);
             transform: scale(1.05);
           }
         }
         
         .animate-pulse-glow {
           animation: pulse-glow 3s ease-in-out infinite;
         }
         
         /* Shimmer effect */
         @keyframes shimmer {
           0% { transform: translateX(-100%); }
           100% { transform: translateX(100%); }
         }
         
         .shimmer-effect {
           position: relative;
           overflow: hidden;
         }
         
         .shimmer-effect::before {
           content: '';
           position: absolute;
           top: 0;
           left: 0;
           width: 100%;
           height: 100%;
           background: linear-gradient(
             90deg,
             transparent,
             rgba(255, 255, 255, 0.1),
             transparent
           );
           transform: translateX(-100%);
           animation: shimmer 2s infinite;
         }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 1s;
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-30px);}
          to { opacity: 1; transform: translateY(0);}
        }
        .animate-fadeInDown {
          animation: fadeInDown 0.7s;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px);}
          to { opacity: 1; transform: translateY(0);}
        }
        .animate-fadeInUp {
          animation: fadeInUp 1s;
        }
        @keyframes slideInBottom {
          from { opacity: 0; transform: translateY(60px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in-bottom {
          animation: slideInBottom 1s;
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.7s;
        }
        @keyframes morphing {
          0% { border-radius: 2rem 2rem 2rem 2rem; }
          50% { border-radius: 2.5rem 1.5rem 2.5rem 1.5rem; }
          100% { border-radius: 2rem 2rem 2rem 2rem; }
        }
        .animate-morphing {
          animation: morphing 6s infinite alternate ease-in-out;
        }
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .animate-shimmer {
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%);
          background-size: 400px 100%;
          animation: shimmer 2s infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-16px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        @keyframes floatReverse {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(16px); }
        }
        .animate-float-reverse {
          animation: floatReverse 4s ease-in-out infinite;
        }
        .glass-effect {
          background: rgba(26, 34, 54, 0.8);
          backdrop-filter: blur(12px) saturate(120%);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
        }
        @keyframes road-flow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
                 .animate-road-flow {
           animation: road-flow 3s linear infinite;
         }
         
         /* Custom scrollbar styling */
         .custom-scrollbar::-webkit-scrollbar {
           width: 8px;
         }
         
         .custom-scrollbar::-webkit-scrollbar-track {
           background: rgba(250, 204, 21, 0.1);
           border-radius: 10px;
         }
         
         .custom-scrollbar::-webkit-scrollbar-thumb {
           background: linear-gradient(180deg, rgba(250, 204, 21, 0.6), rgba(250, 204, 21, 0.8));
           border-radius: 10px;
           border: 2px solid rgba(250, 204, 21, 0.1);
         }
         
         .custom-scrollbar::-webkit-scrollbar-thumb:hover {
           background: linear-gradient(180deg, rgba(250, 204, 21, 0.8), rgba(250, 204, 21, 1));
         }
         
         /* Firefox scrollbar */
         .custom-scrollbar {
           scrollbar-width: thin;
           scrollbar-color: rgba(250, 204, 21, 0.8) rgba(250, 204, 21, 0.1);
         }
       `}</style>
    </main>
  );
}