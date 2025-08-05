"use client";
import React from "react";
import { motion } from "framer-motion";
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
      title: "Built for developers",
      description: "Built for engineers, developers, dreamers, thinkers and doers.",
      icon: <IconTerminal2 size={28} stroke={1.5} />,
    },
    {
      title: "Ease of use",
      description: "It's as easy as using an Apple, and as expensive as buying one.",
      icon: <IconEaseInOut size={28} stroke={1.5} />,
    },
    {
      title: "Pricing like no other",
      description: "Our prices are best in the market. No cap, no lock, no credit card required.",
      icon: <IconCurrencyDollar size={28} stroke={1.5} />,
    },
    {
      title: "100% Uptime guarantee",
      description: "We just cannot be taken down by anyone.",
      icon: <IconCloud size={28} stroke={1.5} />,
    },
    {
      title: "Multi-tenant Architecture",
      description: "You can simply share passwords instead of buying new seats",
      icon: <IconRouteAltLeft size={28} stroke={1.5} />,
    },
    {
      title: "24/7 Customer Support",
      description: "We are available a 100% of the time. Atleast our AI Agents are.",
      icon: <IconHelp size={28} stroke={1.5} />,
    },
    {
      title: "Money back guarantee",
      description: "If you donot like EveryAI, we will convince you to like us.",
      icon: <IconAdjustmentsBolt size={28} stroke={1.5} />,
    },
    {
      title: "And everything else",
      description: "I just ran out of copy ideas. Accept my sincere apologies",
      icon: <IconHeart size={28} stroke={1.5} />,
    },
  ];
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-brand-light-blue via-white to-brand-light-blue/50">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-text-dark mb-4 sm:mb-6">Why Choose ACHARYA?</h2>
          <p className="text-lg text-text-light max-w-2xl mx-auto">
            Discover the powerful capabilities that make our platform exceptional
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-brand-blue/10 rounded-2xl overflow-hidden shadow-lg">
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
    <div className="bg-white/80 backdrop-blur-sm p-8 relative group/feature hover:bg-white transition-all duration-300 hover:shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-brand-teal/5 opacity-0 group-hover/feature:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10">
        <div className="w-12 h-12 bg-gradient-to-br from-brand-blue to-brand-teal rounded-xl flex items-center justify-center text-white mb-6 group-hover/feature:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-text-dark mb-3 group-hover/feature:text-brand-blue transition-colors duration-300">
          {title}
        </h3>
        <p className="text-text-light text-sm leading-relaxed">{description}</p>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-brand-blue to-brand-teal transform scale-x-0 group-hover/feature:scale-x-100 transition-transform duration-300 origin-left" />
    </div>
  );
}; 