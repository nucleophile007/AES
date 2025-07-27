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
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-text-dark mb-4 sm:mb-6">Why Choose ACHARYA?</h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-4 sm:p-6 border rounded-xl sm:rounded-2xl hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-brand-blue to-brand-teal rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <feature.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-text-light text-xs sm:text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 