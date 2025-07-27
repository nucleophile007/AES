"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { NavbarDemo } from "./navbar";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-border z-50"
    >
      <div className="container mx-auto py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Image
            src="https://cdn.builder.io/api/v1/image/assets%2F5ed38136cd50447f928d11cc8bb6d314%2Ff894b9769d704ee88e744e40bde62d12?format=webp&width=800"
            alt="ACHARYA Educational Services Logo"
            className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover"
            width={48}
            height={48}
            priority
          />
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-brand-blue">ACHARYA</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">Educational Services</p>
          </div>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
         <NavbarDemo />
        </nav>
        
        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <Button variant="outline" className="hidden sm:inline-flex">Login</Button>
          <Button className="bg-gradient-to-r from-brand-blue to-brand-teal hover:from-brand-blue/90 hover:to-brand-teal/90">Book Free Session</Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6 text-gray-600" />
          ) : (
            <Menu className="h-6 w-6 text-gray-600" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="lg:hidden bg-white border-t border-border"
        >
          <div className="container mx-auto px-4 py-6 space-y-4">
            <nav className="space-y-4">
              <Link href="/#home" className="block text-lg font-medium text-gray-900 hover:text-brand-blue transition-colors">Home</Link>
              <Link href="/#programs" className="block text-lg font-medium text-gray-900 hover:text-brand-blue transition-colors">Programs</Link>
              <Link href="/#mentors" className="block text-lg font-medium text-gray-900 hover:text-brand-blue transition-colors">Mentors</Link>
              <Link href="/#success" className="block text-lg font-medium text-gray-900 hover:text-brand-blue transition-colors">Success Stories</Link>
              <Link href="/#about" className="block text-lg font-medium text-gray-900 hover:text-brand-blue transition-colors">About</Link>
              <Link href="/#contact" className="block text-lg font-medium text-gray-900 hover:text-brand-blue transition-colors">Contact</Link>
            </nav>
            <div className="pt-4 border-t border-gray-200 space-y-3">
              <Button variant="outline" className="w-full">Login</Button>
              <Button className="w-full bg-gradient-to-r from-brand-blue to-brand-teal hover:from-brand-blue/90 hover:to-brand-teal/90">Book Free Session</Button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
} 