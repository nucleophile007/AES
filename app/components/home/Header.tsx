"use client";
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { NavbarDemo } from "./navbar";
export default function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-border z-50"
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Image
            src="https://cdn.builder.io/api/v1/image/assets%2F5ed38136cd50447f928d11cc8bb6d314%2Ff894b9769d704ee88e744e40bde62d12?format=webp&width=800"
            alt="ACHARYA Educational Services Logo"
            className="h-12 w-12 rounded-full object-cover"
            width={48}
            height={48}
            priority
          />
          <div>
            <h1 className="text-xl font-bold text-brand-blue">ACHARYA</h1>
            <p className="text-xs text-muted-foreground">Educational Services</p>
          </div>
        </div>
        <nav className="hidden md:flex items-center space-x-8">
         <NavbarDemo />
        </nav>
        <div className="flex items-center space-x-4">
          <Button variant="outline" className="hidden sm:inline-flex">Login</Button>
          <Button className="bg-gradient-to-r from-brand-blue to-brand-teal hover:from-brand-blue/90 hover:to-brand-teal/90">Book Free Session</Button>
        </div>
      </div>
    </motion.header>
  );
} 