"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { NavbarDemo } from "./navbar";
import { Menu, X, Sparkles } from "lucide-react";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 w-full bg-gradient-to-r from-[#1a2236]/40 via-[#1a2236]/30 to-[#1a2236]/40 backdrop-blur-2xl border-b border-yellow-400/10 shadow-lg z-50"
    >
      {/* Enhanced backdrop blur layer */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1a2236]/20 via-[#1a2236]/15 to-[#1a2236]/20 backdrop-blur-3xl"></div>
      
      {/* Subtle animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-yellow-400/3 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-0 right-1/4 w-24 h-24 bg-blue-400/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 left-1/3 w-20 h-20 bg-purple-400/3 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto py-4 px-4 flex items-center justify-between relative z-10">
        {/* Logo and Brand */}
        <motion.div 
          className="flex items-center space-x-3 group cursor-pointer"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <div className="relative">
            <Image
              src="https://cdn.builder.io/api/v1/image/assets%2F5ed38136cd50447f928d11cc8bb6d314%2Ff894b9769d704ee88e744e40bde62d12?format=webp&width=800"
              alt="ACHARYA Educational Services Logo"
              className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl object-cover ring-2 ring-yellow-400/20 group-hover:ring-yellow-400/40 transition-all duration-300 shadow-lg group-hover:shadow-yellow-400/20 backdrop-blur-sm"
              width={56}
              height={56}
              priority
            />
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400/15 to-orange-400/15 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent drop-shadow-sm">
              ACHARYA
            </h1>
            <p className="text-xs text-yellow-400/70 font-medium">Educational Services</p>
          </div>
        </motion.div>
        
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
          <NavbarDemo />
        </nav>
        
        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <Button 
            variant="outline" 
            className="hidden sm:inline-flex border-yellow-400/20 text-yellow-400/90 hover:bg-yellow-400/5 hover:border-yellow-400/30 backdrop-blur-md transition-all duration-300 bg-white/5 hover:bg-white/10"
          >
            Login
          </Button>
          <Button 
            className="bg-gradient-to-r from-yellow-400/90 via-amber-500/90 to-orange-500/90 hover:from-yellow-400 hover:via-amber-500 hover:to-orange-500 text-[#1a2236] font-bold shadow-lg hover:shadow-xl hover:shadow-yellow-400/20 transition-all duration-300 transform hover:scale-105 backdrop-blur-md"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Book Free Session
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl hover:bg-white/10 transition-all duration-300 border border-yellow-400/15 hover:border-yellow-400/30 backdrop-blur-md bg-white/5"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6 text-yellow-400/90" />
          ) : (
            <Menu className="h-6 w-6 text-yellow-400/90" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="lg:hidden bg-gradient-to-b from-[#1a2236]/60 to-[#1a2236]/80 backdrop-blur-3xl border-t border-yellow-400/10 shadow-2xl"
        >
          <div className="container mx-auto px-4 py-6 space-y-4">
            <nav className="space-y-4">
              <Link href="/#home" className="block text-lg font-medium text-yellow-400/90 hover:text-yellow-300 transition-colors duration-300 py-2 px-4 rounded-lg hover:bg-white/10 backdrop-blur-sm">Home</Link>
              <Link href="/#programs" className="block text-lg font-medium text-yellow-400/90 hover:text-yellow-300 transition-colors duration-300 py-2 px-4 rounded-lg hover:bg-white/10 backdrop-blur-sm">Programs</Link>
              <Link href="/#mentors" className="block text-lg font-medium text-yellow-400/90 hover:text-yellow-300 transition-colors duration-300 py-2 px-4 rounded-lg hover:bg-white/10 backdrop-blur-sm">Mentors</Link>
              <Link href="/#success" className="block text-lg font-medium text-yellow-400/90 hover:text-yellow-300 transition-colors duration-300 py-2 px-4 rounded-lg hover:bg-white/10 backdrop-blur-sm">Success Stories</Link>
              <Link href="/#about" className="block text-lg font-medium text-yellow-400/90 hover:text-yellow-300 transition-colors duration-300 py-2 px-4 rounded-lg hover:bg-white/10 backdrop-blur-sm">About</Link>
              <Link href="/#contact" className="block text-lg font-medium text-yellow-400/90 hover:text-yellow-300 transition-colors duration-300 py-2 px-4 rounded-lg hover:bg-white/10 backdrop-blur-sm">Contact</Link>
            </nav>
            <div className="pt-4 border-t border-yellow-400/10 space-y-3">
              <Button variant="outline" className="w-full border-yellow-400/20 text-yellow-400/90 hover:bg-white/10 hover:border-yellow-400/30 backdrop-blur-md bg-white/5">Login</Button>
              <Button className="w-full bg-gradient-to-r from-yellow-400/90 via-amber-500/90 to-orange-500/90 hover:from-yellow-400 hover:via-amber-500 hover:to-orange-500 text-[#1a2236] font-bold shadow-lg backdrop-blur-md">
                <Sparkles className="mr-2 h-4 w-4" />
                Book Free Session
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
} 