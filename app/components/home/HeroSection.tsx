"use client";
import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import Image from "next/image";

export default function HeroSection() {

  return (
    <section
      id="home"
      className="theme-bg-dark min-h-screen py-20 lg:py-32 relative overflow-hidden flex items-center"
    >
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-24 h-24 bg-yellow-400 rounded-full opacity-10 animate-float"></div>
        <div className="absolute top-40 right-20 w-20 h-20 bg-blue-400 rounded-full opacity-10 animate-float-reverse"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-purple-400 rounded-full opacity-10 animate-float"></div>
        <div className="absolute top-1/3 right-1/3 w-12 h-12 bg-green-400 rounded-full opacity-10 animate-float-reverse"></div>
        <div className="absolute bottom-40 right-1/4 w-14 h-14 bg-cyan-400 rounded-full opacity-10 animate-float"></div>
        <div className="absolute top-1/2 left-20 w-10 h-10 bg-pink-400 rounded-full opacity-10 animate-float-reverse"></div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[85vh]">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6 sm:space-y-8"
          >
            <div className="space-y-4 sm:space-y-6">
              <Badge className="mb-4 bg-yellow-400/10 text-yellow-400 border-yellow-400/20 text-base px-3 py-1">
                ✨ Excellence in Education Since 2020
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold theme-text-light mb-6 leading-tight">
                Nurture Your Child&apos;s
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500">
                  {" "}
                  Academic Excellence
                </span>
              </h1>
              <p className="text-lg lg:text-xl theme-text-muted max-w-2xl leading-relaxed">
                Every student can learn, just not on the same day, or in the
                same way. We craft personalized learning experiences rooted in
                decades of academic expertise.
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="max-w-2xl"
            >
              <div className="flex flex-col sm:flex-row gap-4 lg:gap-6">
                <Button className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#1a2236] hover:from-yellow-300 hover:to-yellow-400 px-6 py-3 text-base lg:text-lg shadow-lg hover:shadow-xl transition-all duration-300">
                  <ArrowRight className="h-5 w-5 lg:h-6 lg:w-6" /> Get Free 60-Min Session
                </Button>
                <Button variant="outline" className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-[#1a2236] px-6 py-3 text-base lg:text-lg border-2">
                  <Play className="mr-2 h-5 w-5 lg:h-6 lg:w-6" /> Watch How It Works
                </Button>
              </div>
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative order-first lg:order-last flex items-center justify-center"
          >
            <div className="text-center lg:ml-auto lg:mr-0 lg:pr-0 lg:pl-12">
              <Image
                src="/hero.png"
                alt="Hero Image"
                width={450}
                height={550}
                className="rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 max-w-full h-auto"
                priority
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 