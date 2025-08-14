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
      className="theme-bg-dark py-16 lg:py-24 relative overflow-hidden"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-400 rounded-full opacity-10 animate-float"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-blue-400 rounded-full opacity-10 animate-float-reverse"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-purple-400 rounded-full opacity-10 animate-float"></div>
        <div className="absolute top-1/3 right-1/3 w-8 h-8 bg-green-400 rounded-full opacity-10 animate-float-reverse"></div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                 <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6 sm:space-y-8"
          >
            <div className="space-y-4">
              <Badge className="mb-4 bg-yellow-400/10 text-yellow-400 border-yellow-400/20">
                ✨ Excellence in Education Since 2020
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold theme-text-light mb-6">
                Nurture Your Child&apos;s
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500">
                  {" "}
                  Academic Excellence
                </span>
              </h1>
              <p className="text-lg theme-text-muted max-w-4xl">
                Every student can learn, just not on the same day, or in the
                same way. We craft personalized learning experiences rooted in
                decades of academic expertise.
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#1a2236] hover:from-yellow-300 hover:to-yellow-400 px-6 shadow-lg">
                  <ArrowRight className="h-5 w-5" /> Get Free 60-Min Session
                </Button>
                <Button variant="outline" className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-[#1a2236] px-6">
                  <Play className="mr-2 h-5 w-5" /> Watch How It Works
                </Button>
              </div>
            </motion.div>
          </motion.div>
          
                    <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative order-first lg:order-last"
          >
                                                   <div className="text-center lg:ml-auto lg:mr-0 lg:pr-0 lg:pl-20">
                <Image
                  src="/hero.png"
                  alt="Hero Image"
                  width={400}
                  height={500}
                  className="rounded-2xl shadow-lg"
                />
              </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 