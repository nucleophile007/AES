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
    <section className="py-20 bg-gradient-to-br from-brand-light-blue/30 to-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-brand-teal/10 text-brand-teal">
            How It Works
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold text-text-dark mb-6">
            Your Journey to Academic Excellence
          </h2>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="text-center"
            >
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-brand-blue to-brand-teal rounded-full flex items-center justify-center mx-auto mb-4">
                  <step.icon className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-brand-orange rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {step.step}
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
              <p className="text-text-light">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 