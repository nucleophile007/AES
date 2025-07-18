"use client";
import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, Target } from "lucide-react";

const pillars = [
  {
    icon: Users,
    title: "Personalized Approach",
    description: "Tailored learning paths for every student's unique needs",
  },
  {
    icon: BookOpen,
    title: "Academic Excellence",
    description: "Rigorous standards combined with supportive guidance",
  },
  {
    icon: Target,
    title: "Future Success",
    description: "Preparing students for competitive academic environments",
  },
];

export default function TeamPhilosophySection() {
  return (
    <section className="py-20 bg-gradient-to-br from-brand-light-blue/30 to-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/10 to-brand-teal/10 rounded-3xl"></div>
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-3xl"></div>
          <div className="relative z-10 text-center p-12 space-y-8">
            <div className="space-y-4">
              <Badge className="mb-4 bg-brand-blue/10 text-brand-blue border-brand-blue/20">
                Our Philosophy
              </Badge>
              <h3 className="text-3xl lg:text-4xl font-bold text-text-dark">
                Our Teaching Philosophy
              </h3>
            </div>
            <div className="max-w-4xl mx-auto space-y-6">
              <blockquote className="text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-teal italic">
                &quot;Every student can learn, just not on the same day, or in the same way.&quot;
              </blockquote>
              <p className="text-lg text-text-light leading-relaxed">
                Our diverse team of educators brings together academic
                excellence, research experience, and industry insights to
                create personalized learning experiences that nurture each
                student&apos;s unique potential and guide them toward future
                success.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              {pillars.map((pillar, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/50 p-6 rounded-2xl border border-brand-blue/10 hover:border-brand-blue/20 transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-blue to-brand-teal rounded-xl flex items-center justify-center mx-auto mb-4">
                    <pillar.icon className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-text-dark mb-2">
                    {pillar.title}
                  </h4>
                  <p className="text-sm text-text-light">{pillar.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 