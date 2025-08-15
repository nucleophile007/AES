"use client";
import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Target, BookOpen, GraduationCap } from "lucide-react";

const steps = [
  {
    step: "01",
    title: "Free Assessment",
    description:
      "We evaluate your child&apos;s current level and identify areas for improvement",
    icon: Target,
  },
  {
    step: "02",
    title: "Personalized Plan",
    description:
      "Create a tailored learning roadmap based on individual needs and goals",
    icon: BookOpen,
  },
  {
    step: "03",
    title: "Expert Mentoring",
    description:
      "Begin 1-on-1 sessions with our experienced educators and track progress",
    icon: GraduationCap,
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-12 sm:py-16 lg:py-20 theme-bg-dark relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-32 right-10 w-24 h-24 bg-blue-400 rounded-full opacity-5 animate-float-reverse"></div>
        <div className="absolute bottom-32 left-20 w-20 h-20 bg-purple-400 rounded-full opacity-5 animate-float"></div>
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-green-400 rounded-full opacity-5 animate-float-reverse"></div>
      </div>
      
      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-12 sm:mb-16"
        >
          <Badge className="mb-4 bg-yellow-400/10 text-yellow-400 border-yellow-400/20">
            How It Works
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold theme-text-light mb-4 sm:mb-6">
            Your Journey to Academic Excellence
          </h2>
          <p className="text-lg theme-text-muted max-w-2xl mx-auto">
            A simple, proven process that transforms learning outcomes
          </p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="text-center group"
            >
              <div className="relative mb-6 sm:mb-8">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <step.icon className="h-10 w-10 sm:h-12 sm:w-12 text-gray-900" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-lg">
                  {step.step}
                </div>
                {/* Connecting Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-8 h-0.5 bg-gradient-to-r from-yellow-400/50 to-transparent"></div>
                )}
              </div>
              <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/20 group-hover:border-yellow-400/20 transition-all duration-300">
                <h3 className="text-lg sm:text-xl font-semibold theme-text-light mb-3 sm:mb-4 group-hover:text-yellow-400 transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="text-sm sm:text-base theme-text-muted leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 