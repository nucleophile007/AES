"use client";
import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Play } from "lucide-react";

export default function HeroSection() {
  return (
    <section
      id="home"
      className="pt-24 pb-20 bg-gradient-to-br from-brand-light-blue via-white to-brand-light-blue/50"
    >
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <Badge className="bg-brand-orange/10 text-brand-orange border-brand-orange/20">
                ✨ Excellence in Education Since 2020
              </Badge>
              <h1 className="text-5xl lg:text-6xl font-bold text-text-dark leading-tight">
                Nurture Your Child&apos;s
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-teal">
                  {" "}
                  Academic Excellence
                </span>
              </h1>
              <p className="text-xl text-text-light leading-relaxed">
                Every student can learn, just not on the same day, or in the
                same way. We craft personalized learning experiences rooted in
                decades of academic expertise.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-brand-blue to-brand-teal hover:from-brand-blue/90 hover:to-brand-teal/90"
              >
                Get Free 60-Min Session
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch How It Works
              </Button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/20 to-brand-teal/20 rounded-3xl transform rotate-6"></div>
              <div className="relative bg-white p-8 rounded-3xl shadow-2xl border">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">Free Assessment</h3>
                    <Badge className="bg-brand-green text-white">Limited Time</Badge>
                  </div>
                  <div className="space-y-4">
                    <Input placeholder="Student's Name" />
                    <Input placeholder="Grade Level" />
                    <Input placeholder="Parent Email" />
                    <Input placeholder="Subject of Interest" />
                    <Button className="w-full bg-gradient-to-r from-brand-blue to-brand-teal">
                      Book Free Session
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 