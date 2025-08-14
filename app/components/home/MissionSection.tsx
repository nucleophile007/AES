"use client";
import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

export default function MissionSection() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 theme-bg-dark relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-16 h-16 bg-yellow-400 rounded-full opacity-5 animate-float"></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 bg-blue-400 rounded-full opacity-5 animate-float-reverse"></div>
        <div className="absolute top-1/2 left-1/3 w-8 h-8 bg-purple-400 rounded-full opacity-5 animate-float"></div>
      </div>
      
      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="space-y-6 sm:space-y-8"
          >
            <div>
              <Badge className="mb-4 bg-yellow-400/10 text-yellow-400 border-yellow-400/20">
                Our Mission
              </Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold theme-text-light mb-4 sm:mb-6">
                Nurturing Students&apos; Intuitive Abilities
              </h2>
              <p className="text-base sm:text-lg theme-text-muted leading-relaxed">
                ACHARYA Educational Services is a California-based
                organization dedicated to guiding students toward academic
                excellence and future success. We ignite a passion for core
                concepts and emerging technologies, helping students build
                lasting connections to the knowledge shaping our world today.
              </p>
              <div className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
                {[
                  "Personalized Learning: Each lesson tailored to individual needs and learning pace",
                  "Flexible Options: Face-to-face and online learning to suit your schedule",
                  "Strong Foundation: Clear explanations, problem-solving strategies, and consistent support",
                ].map((point, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 mt-1 flex-shrink-0" />
                    <p className="text-sm sm:text-base theme-text-muted">
                      <strong className="text-yellow-300">{point.split(":")[0]}:</strong> {point.split(":")[1]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="space-y-4 sm:space-y-6"
          >
            <div className="bg-gradient-to-br from-[#1a2236]/90 to-[#1a2236]/80 backdrop-blur-xl p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-2xl border border-yellow-400/20">
              <h3 className="text-lg sm:text-xl font-semibold text-yellow-400 mb-3 sm:mb-4">
                Our Vision
              </h3>
              <p className="text-sm sm:text-base theme-text-muted">
                To nurture students&apos; passions with the ultimate goal of
                advocating their life goals and preparing them for the
                competitive world ahead.
              </p>
            </div>
            <div className="bg-gradient-to-br from-[#1a2236]/90 to-[#1a2236]/80 backdrop-blur-xl p-4 sm:p-6 rounded-xl sm:rounded-2xl border-l-4 border-yellow-400 shadow-2xl">
              <h3 className="text-lg sm:text-xl font-semibold theme-text-light mb-2 sm:mb-3">
                Our Core Philosophy
              </h3>
              <p className="text-base sm:text-lg text-yellow-300 italic">
                &quot;Every student can learn, just not on the same day, or in
                the same way.&quot;
              </p>
              <p className="text-xs sm:text-sm theme-text-muted mt-2 sm:mt-3">
                We craft personalized, student-centric approaches rooted in
                decades of combined academic expertise from our team of IIT
                alumni, university faculty, and Ph.D. professionals.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 