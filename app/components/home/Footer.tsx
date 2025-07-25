"use client";
import React from "react";
import { Facebook, Twitter, Linkedin, Instagram, Youtube, Phone, Mail, MapPin } from "lucide-react";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-text-dark text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <Image
                src="https://cdn.builder.io/api/v1/image/assets%2F5ed38136cd50447f928d11cc8bb6d314%2Ff894b9769d704ee88e744e40bde62d12?format=webp&width=800"
                alt="ACHARYA Educational Services Logo"
                className="w-10 h-10 rounded-full object-cover"
                width={40}
                height={40}
                priority
              />
              <div>
                <h3 className="text-xl font-bold">ACHARYA</h3>
                <p className="text-sm text-gray-400">Educational Services</p>
              </div>
            </div>
            <p className="text-gray-400 mb-6">
              Nurturing students&apos; intuitive abilities and guiding them
              toward academic excellence and future success.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
              <Twitter className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
              <Linkedin className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
              <Instagram className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
              <Youtube className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-6">Programs</h4>
            <ul className="space-y-3 text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Mathematics Tutoring
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Physics Coaching
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Chemistry Lessons
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Biology Tutoring
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  SAT Preparation
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-6">Resources</h4>
            <ul className="space-y-3 text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Study Materials
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Practice Tests
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  College Guidance
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Parent Resources
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Success Stories
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-6">Contact</h4>
            <div className="space-y-3 text-gray-400">
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4" />
                <span>info@acharya-edu.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 mt-1" />
                <span>
                  123 Education Lane
                  <br />
                  California, CA 90210
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; 2024 ACHARYA Educational Services. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
} 