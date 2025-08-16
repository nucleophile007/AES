"use client";
import React from "react";
import { Facebook, Twitter,X, Linkedin, Instagram, Youtube, Phone, Mail, MapPin, ArrowRight } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="theme-bg-dark relative overflow-hidden py-16 sm:py-20">
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-24 h-24 bg-yellow-400 rounded-full opacity-5 animate-float"></div>
        <div className="absolute top-40 right-20 w-20 h-20 bg-blue-400 rounded-full opacity-5 animate-float-reverse"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-purple-400 rounded-full opacity-5 animate-float"></div>
        <div className="absolute top-1/3 right-1/3 w-12 h-12 bg-green-400 rounded-full opacity-5 animate-float-reverse"></div>
      </div>

      <div className="container mx-auto relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="sm:col-span-2 lg:col-span-1 space-y-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="relative">
                <Image
                  src="https://cdn.builder.io/api/v1/image/assets%2F5ed38136cd50447f928d11cc8bb6d314%2Ff894b9769d704ee88e744e40bde62d12?format=webp&width=800"
                  alt="ACHARYA Educational Services Logo"
                  className="w-12 h-12 rounded-2xl object-cover shadow-lg"
                  width={48}
                  height={48}
                  priority
                />
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl opacity-20 blur-sm"></div>
              </div>
              <div>
                <h3 className="text-2xl font-bold theme-text-light">ACHARYA</h3>
                <p className="text-sm theme-text-muted">Educational Services</p>
              </div>
            </div>
            <p className="text-base theme-text-muted leading-relaxed">
              Nurturing students&apos; intuitive abilities and guiding them
              toward academic excellence and future success.
            </p>
                         <div className="flex space-x-4">
               {[
                 { icon: Facebook, href: "https://www.facebook.com/acharyafolsom/" },
                 { icon: X, href: "https://x.com/ACHARYAfm" },
                 { icon: Instagram, href: "https://www.instagram.com/acharyaes/" },
                 { icon: Youtube, href: "https://www.youtube.com/@acharyaesfm" }
               ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 bg-gradient-to-r from-yellow-400/10 to-orange-500/10 border border-yellow-400/20 rounded-xl flex items-center justify-center text-yellow-400 hover:bg-gradient-to-r hover:from-yellow-400/20 hover:to-orange-500/20 hover:border-yellow-400/40 transition-all duration-300"
                >
                  <social.icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Programs */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-6"
          >
            <h4 className="text-xl font-semibold theme-text-light mb-6 flex items-center">
              <span className="w-8 h-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mr-3"></span>
              Programs
            </h4>
            <ul className="space-y-3">
              {[
                "Mathematics Tutoring",
                "Physics Coaching", 
                "Chemistry Lessons",
                "Biology Tutoring",
                "SAT Preparation"
              ].map((program, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <a 
                    href="#" 
                    className="group flex items-center space-x-2 text-base theme-text-muted hover:theme-text-light transition-all duration-300"
                  >
                    <ArrowRight className="h-4 w-4 text-yellow-400 group-hover:translate-x-1 transition-transform duration-300" />
                    <span>{program}</span>
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <h4 className="text-xl font-semibold theme-text-light mb-6 flex items-center">
              <span className="w-8 h-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mr-3"></span>
              Resources
            </h4>
            <ul className="space-y-3">
              {[
                "Study Materials",
                "Practice Tests",
                "College Guidance", 
                "Parent Resources",
                "Success Stories"
              ].map((resource, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <a 
                    href="#" 
                    className="group flex items-center space-x-2 text-base theme-text-muted hover:theme-text-light transition-all duration-300"
                  >
                    <ArrowRight className="h-4 w-4 text-yellow-400 group-hover:translate-x-1 transition-transform duration-300" />
                    <span>{resource}</span>
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-6"
          >
            <h4 className="text-xl font-semibold theme-text-light mb-6 flex items-center">
              <span className="w-8 h-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mr-3"></span>
              Contact
            </h4>
            <div className="space-y-4">
              {[
                { icon: Phone, text: "+1 (209) 920-7147" },
                { icon: Mail, text: "acharya.folsom@gmail.com" },
                { icon: MapPin, text: "123 Education Lane\nCalifornia, CA 90210" }
              ].map((contact, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-start space-x-3 group"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-400/10 to-orange-500/10 border border-yellow-400/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 group-hover:bg-gradient-to-r group-hover:from-yellow-400/20 group-hover:to-orange-500/20 transition-all duration-300">
                    <contact.icon className="h-4 w-4 text-yellow-400" />
                  </div>
                  <span className="text-base theme-text-muted group-hover:theme-text-light transition-colors duration-300 whitespace-pre-line">
                    {contact.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="border-t border-yellow-400/20 mt-12 pt-8 text-center"
        >
          <p className="text-base theme-text-muted">
            &copy; 2025 ACHARYA Educational Services. All rights reserved.
          </p>
          <div className="mt-4 flex justify-center space-x-6 text-sm theme-text-muted">
            <a href="#" className="hover:text-yellow-400 transition-colors duration-300">Privacy Policy</a>
            <a href="#" className="hover:text-yellow-400 transition-colors duration-300">Terms of Service</a>
            <a href="#" className="hover:text-yellow-400 transition-colors duration-300">Cookie Policy</a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
} 