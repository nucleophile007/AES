"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { NavbarDemo } from "./navbar";
import { LoginModal } from "@/components/ui/LoginModal";
import { ChevronDown } from "lucide-react";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <header className="fixed top-0 w-full bg-[#1a2236] border-b border-yellow-400/15 shadow-[0_8px_24px_rgba(8,15,35,0.5)] z-50">

      <div className="container mx-auto py-4 px-4 flex items-center justify-between relative z-10">
        {/* Logo and Brand */}
        <Link href="/">
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="relative">
              <Image
                src="https://cdn.builder.io/api/v1/image/assets%2F5ed38136cd50447f928d11cc8bb6d314%2Ff894b9769d704ee88e744e40bde62d12?format=webp&width=800"
                alt="ACHARYA Educational Services Logo"
                className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl object-cover ring-2 ring-yellow-400/20 group-hover:ring-yellow-400/40 transition-all duration-300 shadow-lg group-hover:shadow-yellow-400/20"
                width={56}
                height={56}
                priority
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent drop-shadow-sm">
                ACHARYA
              </h1>
              <p className="text-xs text-yellow-400/70 font-medium">Educational Services</p>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
          <NavbarDemo />
        </nav>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <LoginModal>
            <Button
              variant="outline"
              className="hidden sm:inline-flex border-yellow-400/20 text-yellow-400/90 hover:bg-yellow-400/10 hover:border-yellow-400/30 backdrop-blur-md transition-all duration-300 bg-white/5"
            >
              Login
            </Button>
          </LoginModal>
          <Link href="/book-session">
            <Button
              className="bg-gradient-to-r from-yellow-400/90 via-amber-500/90 to-orange-500/90 hover:from-yellow-400 hover:via-amber-500 hover:to-orange-500 text-[#1a2236] font-bold shadow-lg hover:shadow-xl hover:shadow-yellow-400/20 transition-all duration-300 transform hover:scale-105 backdrop-blur-md"
            >
              Book Free Session
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-nav-menu"
          className="lg:hidden p-2 rounded-xl hover:bg-white/10 transition-all duration-300 border border-yellow-400/15 hover:border-yellow-400/30 backdrop-blur-md bg-white/5"
        >
          <div className="w-6 h-6 flex flex-col justify-center items-center">
            <div className={`w-6 h-0.5 bg-yellow-400/90 rounded-full transition-all duration-300 transform ${isMobileMenuOpen ? 'rotate-45 translate-y-1' : ''}`}></div>
            <div className={`w-6 h-0.5 bg-yellow-400/90 rounded-full transition-all duration-300 my-1 ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></div>
            <div className={`w-6 h-0.5 bg-yellow-400/90 rounded-full transition-all duration-300 transform ${isMobileMenuOpen ? '-rotate-45 -translate-y-1' : ''}`}></div>
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div id="mobile-nav-menu" className="lg:hidden bg-gradient-to-b from-[#1a2236] to-[#18243d] border-t border-yellow-400/15 shadow-2xl relative z-40">
          <div className="container mx-auto px-4 py-6 space-y-4">
            <nav className="space-y-4">
              <Link href="/#home" className="block text-lg font-medium text-yellow-400/90 hover:text-yellow-300 transition-colors duration-300 py-2 px-4 rounded-lg hover:bg-white/10 backdrop-blur-sm">Home</Link>
              <Link href="/about" className="block text-lg font-medium text-yellow-400/90 hover:text-yellow-300 transition-colors duration-300 py-2 px-4 rounded-lg hover:bg-white/10 backdrop-blur-sm">About</Link>

              {/* Programs Dropdown */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'programs' ? null : 'programs')}
                  aria-expanded={openDropdown === 'programs'}
                  aria-controls="mobile-programs-menu"
                  className="flex items-center justify-between w-full text-lg font-medium text-yellow-400/90 hover:text-yellow-300 transition-colors duration-300 py-2 px-4 rounded-lg hover:bg-white/10 backdrop-blur-sm"
                >
                  Programs
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${openDropdown === 'programs' ? 'rotate-180' : ''}`} />
                </button>
                {openDropdown === 'programs' && (
                  <div id="mobile-programs-menu" className="pl-6 space-y-2">
                    <Link href="/academictutoring" className="block text-base font-medium text-yellow-400/80 hover:text-yellow-300 transition-colors duration-300 py-1 px-4 rounded-lg hover:bg-white/5">Academic Tutoring</Link>
                    <Link href="/collegeprep" className="block text-base font-medium text-yellow-400/80 hover:text-yellow-300 transition-colors duration-300 py-1 px-4 rounded-lg hover:bg-white/5">College Prep</Link>
                    <Link href="/satcoaching" className="block text-base font-medium text-yellow-400/80 hover:text-yellow-300 transition-colors duration-300 py-1 px-4 rounded-lg hover:bg-white/5">SAT Coaching</Link>
                  </div>
                )}
              </div>

              {/* Profile Enrichment Dropdown */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'profile' ? null : 'profile')}
                  aria-expanded={openDropdown === 'profile'}
                  aria-controls="mobile-profile-menu"
                  className="flex items-center justify-between w-full text-lg font-medium text-yellow-400/90 hover:text-yellow-300 transition-colors duration-300 py-2 px-4 rounded-lg hover:bg-white/10 backdrop-blur-sm"
                >
                  Profile Enrichment
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${openDropdown === 'profile' ? 'rotate-180' : ''}`} />
                </button>
                {openDropdown === 'profile' && (
                  <div id="mobile-profile-menu" className="pl-6 space-y-2">
                    <Link href="/aes-explorers" className="block text-base font-medium text-yellow-400/80 hover:text-yellow-300 transition-colors duration-300 py-1 px-4 rounded-lg hover:bg-white/5">AES Explorers</Link>
                    <Link href="/aes-champions" className="block text-base font-medium text-yellow-400/80 hover:text-yellow-300 transition-colors duration-300 py-1 px-4 rounded-lg hover:bg-white/5">AES Champions</Link>
                    <Link href="/aes-creatorverse" className="block text-base font-medium text-yellow-400/80 hover:text-yellow-300 transition-colors duration-300 py-1 px-4 rounded-lg hover:bg-white/5">AES Creatorverse</Link>
                    {/* <Link href="/mathcompetition" className="block text-base font-medium text-yellow-400/80 hover:text-yellow-300 transition-colors duration-300 py-1 px-4 rounded-lg hover:bg-white/5">Math Competition</Link>
                    <Link href="/researchprogram" className="block text-base font-medium text-yellow-400/80 hover:text-yellow-300 transition-colors duration-300 py-1 px-4 rounded-lg hover:bg-white/5">Research Programs</Link> */}
                  </div>
                )}
              </div>

              <Link href="/#mentors" className="block text-lg font-medium text-yellow-400/90 hover:text-yellow-300 transition-colors duration-300 py-2 px-4 rounded-lg hover:bg-white/10 backdrop-blur-sm">Mentors</Link>
              <Link href="/#animatedtestimonials" className="block text-lg font-medium text-yellow-400/90 hover:text-yellow-300 transition-colors duration-300 py-2 px-4 rounded-lg hover:bg-white/10 backdrop-blur-sm">Testimonials</Link>
              <Link href="/blog" className="block text-lg font-medium text-yellow-400/90 hover:text-yellow-300 transition-colors duration-300 py-2 px-4 rounded-lg hover:bg-white/10 backdrop-blur-sm">Blog</Link>
              <Link href="/events" className="block text-lg font-medium text-yellow-400/90 hover:text-yellow-300 transition-colors duration-300 py-2 px-4 rounded-lg hover:bg-white/10 backdrop-blur-sm">Events</Link>
              <Link href="/contact" className="block text-lg font-medium text-yellow-400/90 hover:text-yellow-300 transition-colors duration-300 py-2 px-4 rounded-lg hover:bg-white/10 backdrop-blur-sm">Contact</Link>
            </nav>
            <div className="pt-4 border-t border-yellow-400/10 space-y-3">
              <LoginModal>
                <Button variant="outline" className="w-full border-yellow-400/20 text-yellow-400/90 hover:bg-white/10 hover:border-yellow-400/30 backdrop-blur-md bg-white/5">Login</Button>
              </LoginModal>
              <Link href="/book-session" className="block">
                <Button className="w-full bg-gradient-to-r from-yellow-400/90 via-amber-500/90 to-orange-500/90 hover:from-yellow-400 hover:via-amber-500 hover:to-orange-500 text-[#1a2236] font-bold shadow-lg backdrop-blur-md">
                  Book Free Session
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
} 
