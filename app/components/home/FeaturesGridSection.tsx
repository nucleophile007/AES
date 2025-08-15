"use client";
import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  IconAdjustmentsBolt,
  IconCloud,
  IconCurrencyDollar,
  IconEaseInOut,
  IconHeart,
  IconHelp,
  IconRouteAltLeft,
  IconTerminal2,
} from "@tabler/icons-react";

export default function FeaturesGridSection() {
  const features = [
    {
      title: "Personalized Learning",
      description: "Customized educational approaches tailored to each student's unique learning style and pace.",
      icon: <IconTerminal2 size={28} stroke={1.5} />,
    },
    {
      title: "Expert Mentoring",
      description: "One-on-one guidance from experienced educators with proven track records.",
      icon: <IconEaseInOut size={28} stroke={1.5} />,
    },
    {
      title: "Affordable Excellence",
      description: "Premium educational services at competitive rates with flexible payment options.",
      icon: <IconCurrencyDollar size={28} stroke={1.5} />,
    },
    {
      title: "Consistent Progress",
      description: "Regular assessments and progress tracking to ensure continuous improvement.",
      icon: <IconCloud size={28} stroke={1.5} />,
    },
    {
      title: "Flexible Scheduling",
      description: "Online and in-person sessions that adapt to your busy family schedule.",
      icon: <IconRouteAltLeft size={28} stroke={1.5} />,
    },
    {
      title: "24/7 Support",
      description: "Always available assistance from our dedicated educational support team.",
      icon: <IconHelp size={28} stroke={1.5} />,
    },
    {
      title: "Success Guarantee",
      description: "We're committed to your child's academic success with measurable results.",
      icon: <IconAdjustmentsBolt size={28} stroke={1.5} />,
    },
    {
      title: "College Preparation",
      description: "Comprehensive preparation for standardized tests and college applications.",
      icon: <IconHeart size={28} stroke={1.5} />,
    },
  ];
  return (
    <section id="features" className="py-12 sm:py-16 lg:py-20 theme-bg-dark relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-400 rounded-full opacity-5 animate-float"></div>
        <div className="absolute bottom-20 right-20 w-16 h-16 bg-blue-400 rounded-full opacity-5 animate-float-reverse"></div>
        <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-purple-400 rounded-full opacity-5 animate-float"></div>
      </div>
      
      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-12 sm:mb-16"
        >
          <Badge className="mb-4 bg-yellow-400/10 text-yellow-400 border-yellow-400/20">
            Why Choose Us
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold theme-text-light mb-4 sm:mb-6">Why Choose ACHARYA?</h2>
          <p className="text-lg theme-text-muted max-w-2xl mx-auto">
            Discover the powerful capabilities that make our educational platform exceptional
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Feature key={feature.title} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm p-6 rounded-2xl relative group hover:bg-gradient-to-br hover:from-gray-800/70 hover:to-gray-900/70 transition-all duration-300 border border-gray-700/20 hover:border-yellow-400/20"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
      <div className="relative z-10">
        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center text-gray-900 mb-4 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="text-lg font-semibold theme-text-light mb-3 group-hover:text-yellow-400 transition-colors duration-300">
          {title}
        </h3>
        <p className="theme-text-muted text-sm leading-relaxed">{description}</p>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-amber-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-b-2xl" />
    </motion.div>
  );
}; 