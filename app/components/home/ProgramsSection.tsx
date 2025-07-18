"use client";
import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { CheckCircle, Star, ChevronRight, Calculator, BookOpen, GraduationCap, Trophy, Target } from "lucide-react";

export default function ProgramsSection() {
  const programs = [
    {
      icon: Calculator,
      title: "Academic Tutoring",
      description:
        "Personalized tutoring across all subjects, tailored to individual needs and learning pace",
      subjects: [
        "Mathematics (Algebra I/II to Multivariable Calculus)",
        "Physics (Regular, Honors, AP Physics I/II, AP Physics C)",
        "Chemistry (Regular, Honors, NGSS, AP Chemistry)",
        "Biology (Regular Biology, AP Biology)",
        "AP Pre-Calculus & AP Statistics",
        "Linear Algebra & Advanced Mathematics",
      ],
      features: [
        "Face-to-face and online sessions",
        "Flexible scheduling options",
        "Clear explanations & problem-solving strategies",
        "Building strong foundations & confidence",
      ],
      color: "from-blue-500 to-blue-600",
      pricing: "Custom packages available",
      badge: "Most Popular",
    },
    {
      icon: BookOpen,
      title: "SAT Coaching",
      description:
        "Comprehensive SAT preparation with personalized study plans and proven test strategies",
      subjects: [
        "SAT Math Section Mastery",
        "SAT Reading Comprehension",
        "SAT Writing & Language",
        "Diagnostic Testing & Analysis",
        "Time Management Strategies",
        "Practice Tests Under Real Conditions",
      ],
      features: [
        "Personalized study plans based on strengths/weaknesses",
        "Focused practice on improvement areas",
        "Comprehensive test-taking strategies",
        "Both online and in-person options available",
      ],
      color: "from-orange-500 to-orange-600",
      pricing: "Custom packages Available",
      badge: "Test Prep",
    },
    {
      icon: GraduationCap,
      title: "College Preparation",
      description:
        "Complete college admissions guidance and academic preparation for university success",
      subjects: [
        "College Application Strategy",
        "Personal Statement & Essay Development",
        "University Selection & Research",
        "Academic Planning & Course Selection",
        "Scholarship & Financial Aid Guidance",
        "Interview Preparation & Skills",
      ],
      features: [
        "Personalized admissions strategy development",
        "Application timeline management",
        "Essay brainstorming & refinement",
        "Financial aid application support",
      ],
      color: "from-purple-500 to-purple-600",
      pricing: "Custom packages available",
      badge: "College Bound",
    },
    {
      icon: Trophy,
      title: "Math Competitions",
      description:
        "Specialized training for mathematics competitions and advanced problem-solving skills",
      subjects: [
        "AMC 8/10/12 Preparation",
        "AIME Training & Strategies",
        "Competition Problem-Solving Techniques",
        "Advanced Mathematical Concepts",
        "Mock Competition Practice",
        "Olympiad-Level Problem Solving",
      ],
      features: [
        "Expert coaching in competition mathematics",
        "Practice with past competition problems",
        "Advanced problem-solving methodologies",
        "Preparation for national competitions",
      ],
      color: "from-yellow-500 to-yellow-600",
      pricing: "Specialized coaching rates",
      badge: "Competition Ready",
    },
    {
      icon: Target,
      title: "Research Programs",
      description:
        "Independent research projects that demonstrate intellectual curiosity and academic excellence for college applications",
      subjects: [
        "College Application Portfolio Development",
        "Topic Selection & Research Design",
        "Methodology Development with Expert Guidance",
        "Research Execution with Ongoing Mentorship",
        "Documentation & Presentation Preparation",
        "Portfolio Integration for Admissions",
      ],
      features: [
        "Stand out in college admissions",
        "Demonstrate intellectual curiosity",
        "Create compelling academic portfolios",
        "Expert mentorship throughout process",
      ],
      color: "from-purple-500 to-purple-600",
      pricing: "Custom research packages",
      badge: "College Edge",
    },
  ];
  return (
    <section id="programs" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-brand-blue/10 text-brand-blue">
            Our Programs
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold text-text-dark mb-6">
            Enhanced Program & Service Showcasing
          </h2>
          <p className="text-xl text-text-light max-w-3xl mx-auto">
            Comprehensive tutoring and mentorship programs designed to unlock
            your child&apos;s potential
          </p>
        </motion.div>
        <Carousel
          className="w-full max-w-7xl mx-auto"
          opts={{ align: "start", loop: true }}
          plugins={[Autoplay({ delay: 2000 })]}
        >
          <CarouselContent className="-ml-2 md:-ml-4 items-stretch">
            {programs.map((program, index) => (
              <CarouselItem
                key={index}
                className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3 flex"
              >
                <div className="p-1 w-full flex">
                  <Card className="w-full flex flex-col hover:shadow-xl transition-all duration-300 border-2 hover:border-brand-blue/20 group relative">
                    <CardHeader>
                      {program.badge && (
                        <Badge className="absolute -top-2 -right-2 bg-brand-orange text-white text-xs">
                          {program.badge}
                        </Badge>
                      )}
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${program.color} flex items-center justify-center mb-4`}>
                        <program.icon className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-xl">{program.title}</CardTitle>
                      <CardDescription className="text-sm">{program.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <div className="space-y-4 flex-1">
                        <div>
                          <h4 className="font-semibold text-sm mb-2 text-text-dark">What&apos;s Included:</h4>
                          <div className="space-y-2">
                            {program.subjects.slice(0, 4).map((subject, i) => (
                              <div key={i} className="flex items-start text-xs text-text-light">
                                <CheckCircle className="h-3 w-3 text-brand-green mr-2 flex-shrink-0 mt-0.5" />
                                {subject}
                              </div>
                            ))}
                            {program.subjects.length > 4 && (
                              <div className="text-xs text-brand-blue font-medium">
                                +{program.subjects.length - 4} more subjects
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-2 text-text-dark">Key Features:</h4>
                          <div className="space-y-1">
                            {program.features.slice(0, 3).map((feature, i) => (
                              <div key={i} className="flex items-start text-xs text-text-light">
                                <Star className="h-3 w-3 text-brand-orange mr-2 flex-shrink-0 mt-0.5" />
                                {feature}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="border-t pt-4 mt-4">
                        <p className="text-sm font-semibold text-brand-blue mb-3">{program.pricing}</p>
                        <Button variant="outline" className="w-full group-hover:bg-brand-blue group-hover:text-white transition-colors">
                          Learn More <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </div>
    </section>
  );
} 