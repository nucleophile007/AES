"use client";
import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

export default function MissionSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-brand-light-blue/30 to-white">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div>
              <Badge className="mb-4 bg-brand-blue/10 text-brand-blue">
                Our Mission
              </Badge>
              <h2 className="text-4xl font-bold text-text-dark mb-6">
                Nurturing Students&apos; Intuitive Abilities
              </h2>
              <p className="text-lg text-text-light leading-relaxed">
                ACHARYA Educational Services is a California-based
                organization dedicated to guiding students toward academic
                excellence and future success. We ignite a passion for core
                concepts and emerging technologies, helping students build
                lasting connections to the knowledge shaping our world today.
              </p>
              <div className="space-y-4 mt-6">
                {[
                  "Personalized Learning: Each lesson tailored to individual needs and learning pace",
                  "Flexible Options: Face-to-face and online learning to suit your schedule",
                  "Strong Foundation: Clear explanations, problem-solving strategies, and consistent support",
                ].map((point, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-brand-green mt-1 flex-shrink-0" />
                    <p className="text-text-light">
                      <strong>{point.split(":")[0]}:</strong> {point.split(":")[1]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-xl font-semibold text-brand-blue mb-4">
                Our Vision
              </h3>
              <p className="text-text-light">
                To nurture students&apos; passions with the ultimate goal of
                advocating their life goals and preparing them for the
                competitive world ahead.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border-l-4 border-brand-teal shadow-lg">
              <h3 className="text-xl font-semibold text-text-dark mb-3">
                Our Core Philosophy
              </h3>
              <p className="text-text-light italic text-lg">
                &quot;Every student can learn, just not on the same day, or in
                the same way.&quot;
              </p>
              <p className="text-sm text-text-light mt-3">
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