"use client";
import React from "react";
import { motion } from "framer-motion";
import { Clock, Users, Trophy, Globe } from "lucide-react";

const features = [
  {
    icon: Clock,
    title: "Flexible Scheduling",
    description: "Online and in-person options to fit your schedule",
  },
  {
    icon: Users,
    title: "1-on-1 Attention",
    description: "Personalized learning tailored to each student",
  },
  {
    icon: Trophy,
    title: "Proven Results",
    description: "98% success rate with measurable improvements",
  },
  {
    icon: Globe,
    title: "Comprehensive Coverage",
    description: "All subjects from K-12 to undergraduate level",
  },
];

export default function FeaturesGridSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-text-dark mb-6">Why Choose ACHARYA?</h2>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-6 border rounded-2xl hover:shadow-lg transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-brand-blue to-brand-teal rounded-2xl flex items-center justify-center mx-auto mb-4">
                <feature.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-text-light text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 