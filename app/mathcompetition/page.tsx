"use client";

import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import Chatbot from "@/components/home/Chatbot";

export default function MathCompetitionPage() {
  return (
    <main className="min-h-screen theme-bg-dark flex flex-col">
      <Header />
      
      {/* Coming Soon Section */}
      <section className="theme-bg-dark py-16 lg:py-24 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-400 rounded-full opacity-10 animate-float"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-blue-400 rounded-full opacity-10 animate-float-reverse"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-purple-400 rounded-full opacity-10 animate-float"></div>
          <div className="absolute top-1/3 right-1/3 w-8 w-8 bg-green-400 rounded-full opacity-10 animate-float-reverse"></div>
        </div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <Badge className="mb-4 bg-yellow-400/10 text-yellow-400 border-yellow-400/20">
                🏆 Math Competitions
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-black bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent mb-4">
                Coming Soon!
              </h1>
              <p className="text-xl lg:text-2xl theme-text-muted max-w-3xl mx-auto leading-relaxed">
                We&apos;re preparing something extraordinary for math enthusiasts. 
                Get ready to challenge your mathematical thinking and compete with the best!
              </p>
            </motion.div>
            
            {/* Coming Soon Animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full flex items-center justify-center border-2 border-yellow-400/30">
                <Trophy className="h-16 w-16 text-yellow-400 animate-pulse" />
              </div>
              <div className="absolute inset-0 w-32 h-32 mx-auto bg-gradient-to-br from-yellow-400/10 to-orange-500/10 rounded-full animate-ping"></div>
            </motion.div>
          </div>
        </div>
      </section>
      
      <Chatbot />
      <Footer />
    </main>
  );
}