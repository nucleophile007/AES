"use client";

import React from 'react';
import { motion } from "framer-motion";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Users, BookOpen, Target, Trophy, Linkedin, Globe, Mail, GraduationCap, Star, Calculator, Atom } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useScroll, useTransform } from "framer-motion";
import { MentorGridSkeleton } from "@/components/ui/MentorSkeleton";

interface Mentor {
  id: number;
  name: string;
  department: string;
  role: string;
  image: string;
  education: string;
  institution: string;
  bio: string;
  experience: string;
  specialties: string[];
  achievements?: string[];
  workplace?: string;
}

interface AboutPageClientProps {
  mentors: Mentor[];
}

const webTeam = [
  {
    name: "Luv Shanker",
    role: "Full Stack Web Developer",
    education: "B.Tech from IIT Dharwad (Final Year)",
    institution: "Indian Institute of Technology Dharwad, India",
    experience: "Web Development & Software Engineering",
    specialties: ["Full Stack Development", "React & Next.js", "Backend Development", "UI/UX Design"],
    achievements: ["2+ years web development experience", "Modern web technologies expert", "Full stack proficiency", "IIT Dharwad student"],
    bio: "Senior, IIT Dharwad with over 2 years of hands-on experience in web development. Specializes in building scalable web applications using modern technologies and frameworks.",
    image: "/luv.png",
  },
  {
    name: "Deepak Kumar Singh",
    role: "Full Stack Web Developer",
    education: "B.Tech from IIT Dharwad (Final Year)",
    institution: "Indian Institute of Technology Dharwad, India",
    experience: "Web Development & Software Engineering",
    specialties: ["Full Stack Development", "Frontend Technologies", "Database Management", "API Development"],
    achievements: ["2+ years web development experience", "Problem-solving expertise", "Collaborative development", "IIT Dharwad student"],
    bio: "Senior, IIT Dharwad with 2+ years of professional web development experience. Passionate about creating efficient, user-friendly web solutions and working with cutting-edge technologies.",
    image: "/deepak.png",
  },
];

export default function AboutPageClient({ mentors }: AboutPageClientProps) {
  const { scrollYProgress } = useScroll();
  const [selectedCategory, setSelectedCategory] = React.useState<string>("engg-ai");

  // Create transform values at the top level to avoid hooks in callbacks
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const backgroundOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.6, 0.3]);

  const normalizeDepartment = (department: string) =>
    department.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]/g, "");

  const isTechAndCreativeWriting = (department: string) => {
    const normalizedDepartment = normalizeDepartment(department);
    return normalizedDepartment === "techcreativewriting" ||
      normalizedDepartment === "techandcreativewriting";
  };

  // Mentor categories
  const categories = [
    {
      id: "engg-ai",
      label: "Engg & AI",
      mentors: mentors.filter(m => m.department === "engg-ai")
    },
    {
      id: "premed-bio-chem",
      label: "Pre-Med, BIO & CHEM",
      mentors: mentors.filter(m => m.department === "premed-bio-chem")
    },
    {
      id: "law-humanities",
      label: "Law, Humanities & Social Sciences",
      mentors: mentors.filter(m => m.department === "law-humanities")
    },
    {
      id: "tech-creative-writing",
      label: "Tech & Creative Writing",
      mentors: mentors.filter(m => isTechAndCreativeWriting(m.department))
    },
    {
      id: "associate",
      label: "Associate Mentors",
      mentors: mentors.filter(m => m.department === "associate")
    }
  ];

  const filteredFaculty = categories.find(cat => cat.id === selectedCategory)?.mentors || [];

  return (
    <>
      {/* About Acharya — CEO Words Section */}
      <section className="theme-bg-dark relative overflow-hidden" style={{ minHeight: "calc(100vh - 72px)" }}>

        {/* Subtle ambient background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl" />
        </div>

        {/* Full-height two-column layout */}
        <div
          className="relative z-10 flex flex-col lg:flex-row"
          style={{ minHeight: "calc(100vh - 72px)" }}
        >
          {/* ── LEFT: Scrollable text content ── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 flex flex-col justify-center overflow-y-auto px-6 sm:px-10 lg:px-16 py-10 lg:py-12"
            style={{ maxHeight: "calc(100vh - 72px)", scrollbarWidth: "none" }}
          >
            {/* Heading group */}
            <div className="mb-5">
              <h1 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-black bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 bg-clip-text text-transparent leading-tight mb-2">
                About Acharya
              </h1>
              <div className="h-[3px] w-16 bg-gradient-to-r from-yellow-400 via-amber-400 to-transparent rounded-full" />
            </div>

            {/* Body paragraphs — compact */}
            <div className="space-y-3 text-slate-300 text-[0.92rem] sm:text-[0.95rem] leading-[1.7]">
              <p>
                We believe education should be more than the consumption of knowledge. It should inspire young minds to{" "}
                <span className="text-yellow-300 font-semibold">question, explore, create, and solve problems that matter.</span>
              </p>
              <p>
                My own journey across{" "}
                <span className="text-white font-semibold">Mechanical Engineering, Aerospace Systems, Neuroscience, and Liberal Arts</span>,
                with academic experiences at{" "}
                <span className="text-amber-400 font-medium">IIT Hyderabad, KAIST, and Ashoka University/UPenn</span>, has taught me one thing above all:
                the most meaningful innovation happens at the intersection of disciplines, ideas, and perspectives.
              </p>
              <p>
                As the{" "}
                <span className="text-white font-semibold">CEO and Research Program Director at ACHARYA</span>, I work closely with a devoted team of researchers
                and mentors bringing{" "}
                <span className="text-yellow-400 font-bold">50+ years of combined experience</span> across academia, industry, and research. Together,
                we challenge the conventional approach to student development.
              </p>

              {/* Italic callout */}
              <p className="text-slate-400/90 italic pl-3 border-l-2 border-yellow-400/40 my-1">
                We don&apos;t believe in generic roadmaps, short-term projects, or one-size-fits-all mentorship.
              </p>

              <p>
                We believe every student has a unique combination of curiosity, strengths, and passions—and that these deserve the{" "}
                <span className="text-white font-semibold">time, depth, and mentorship</span> to grow into something extraordinary.
              </p>
              <p>
                Our role is to help students transform that initial spark of curiosity into years of{" "}
                <span className="text-yellow-300 font-semibold">purposeful exploration, rigorous research, meaningful accomplishments, and real-world impact.</span>
              </p>
              <p>
                At ACHARYA, we are meticulously shaping the high school journey one student at a time—so that their{" "}
                <span className="text-white font-semibold">passion</span> doesn&apos;t remain an interest, but becomes a{" "}
                <span className="text-white font-semibold">pursuit</span>; their pursuit becomes{" "}
                <span className="text-white font-semibold">expertise</span>; and their expertise becomes the foundation to{" "}
                <span className="text-yellow-400 font-bold">create a difference in the world.</span>
              </p>
            </div>

            {/* Pull quote */}
            <blockquote className="mt-5 border-l-[3px] border-yellow-400 pl-4 py-2 bg-gradient-to-r from-yellow-400/8 to-transparent rounded-r-lg">
              <p className="text-yellow-300 font-semibold text-[0.9rem] sm:text-[0.95rem] italic leading-snug">
                &ldquo;Don&apos;t just discover a passion. Pursue it for years, research it deeply, build something meaningful, and create a difference.&rdquo;
              </p>
            </blockquote>

            {/* Sign-off */}
            <div className="mt-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-yellow-400/30 to-transparent" />
              <p className="text-right text-slate-400 text-xs font-medium tracking-widest uppercase">
                Regards &nbsp;·&nbsp; <span className="text-white font-bold text-sm">Team ACHARYA</span>
              </p>
            </div>
          </motion.div>

          {/* ── RIGHT: Founder Photo — sticky, full height, blending ── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.15 }}
            className="hidden lg:block relative flex-shrink-0"
            style={{ width: "38%", minHeight: "calc(100vh - 72px)" }}
          >
            {/* Warm glow behind photo */}
            <div className="absolute inset-0 bg-gradient-to-l from-yellow-400/8 via-amber-500/5 to-transparent pointer-events-none" />

            {/* Photo with edge-blending mask */}
            <div
              className="absolute inset-0"
              style={{
                WebkitMaskImage: [
                  "linear-gradient(to bottom, transparent 0%, black 8%, black 85%, transparent 100%)",
                  "linear-gradient(to right, transparent 0%, black 15%, black 100%)",
                ].join(", "),
                maskImage: [
                  "linear-gradient(to bottom, transparent 0%, black 8%, black 85%, transparent 100%)",
                  "linear-gradient(to right, transparent 0%, black 15%, black 100%)",
                ].join(", "),
                WebkitMaskComposite: "source-in",
                maskComposite: "intersect",
              }}
            >
              <Image
                src="/founder-image.png"
                alt="Shanti Sir – CEO & Research Program Director, ACHARYA"
                fill
                className="object-cover object-top"
                quality={100}
                priority
              />
            </div>
          </motion.div>

        </div>
      </section>



      {/* Faculty Section */}
      <section className="py-12 theme-bg-dark relative overflow-hidden">
        {/* Smart Scrolling Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              y: [0, -100, 0],
              rotate: [0, 5, 0]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
              y: { duration: 15, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-amber-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              y: [0, 80, 0],
              rotate: [0, -8, 0]
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
              y: { duration: 18, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute bottom-20 right-10 w-24 h-24 bg-gradient-to-br from-blue-400/15 to-purple-500/15 rounded-full blur-2xl"
          />
          <motion.div
            animate={{
              y: [0, -60, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear",
              y: { duration: 22, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-br from-green-400/10 to-emerald-500/10 rounded-full blur-xl"
          />
        </div>

        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="inline-block mb-6"
            >
              {/* <Badge className="bg-yellow-400/10 text-yellow-400 border-yellow-400/30 px-5 py-2 text-sm font-medium">
                Our Expert Team
              </Badge> */}
            </motion.div>

            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="text-4xl lg:text-5xl font-bold text-white mb-6"
            >
              Meet Our Distinguished Mentors
            </motion.h3>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="text-lg theme-text-muted max-w-3xl mx-auto"
            >
              Our mentors bring diverse expertise from top institutions, combining academic excellence with real-world experience
            </motion.p>

            {/* Animated Underline */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              whileInView={{ width: "100px", opacity: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 1.2, delay: 0.8 }}
              className="h-1 bg-yellow-400 mx-auto mt-6"
            />
          </motion.div>

          {/* Department filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-7xl mx-auto px-4 mb-12"
          >
            <div className="flex flex-wrap justify-center items-center gap-3">
              {categories.map((category) => (
                <motion.button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${selectedCategory === category.id
                    ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-900 shadow-lg shadow-yellow-400/30"
                    : "bg-slate-800/60 text-slate-300 border border-slate-700/50 hover:border-yellow-400/50 hover:text-yellow-400"
                    }`}
                >
                  {category.label}
                  <span className="ml-2 text-xs opacity-75">
                    ({category.mentors.length})
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Individual Mentor Sections - Separated Tiles Design */}
          <div className="space-y-8 max-w-7xl mx-auto px-4">
            {filteredFaculty.map((member, index) => (
              <motion.div
                key={`detailed-${index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.05,
                  ease: "easeOut"
                }}
                className="group"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Left Tile - Image Section (Separated) */}
                  <motion.div
                    className="md:w-80 flex-shrink-0"
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="relative p-[1px] rounded-2xl bg-gradient-to-br from-yellow-400/50 via-amber-500/50 to-yellow-600/50 h-full">
                      <div className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-2xl p-8 h-full flex flex-col items-center justify-center relative overflow-hidden">
                        {/* Animated background orbs */}
                        <motion.div
                          className="absolute top-0 right-0 w-40 h-40 bg-yellow-400/20 rounded-full blur-3xl"
                          animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.2, 0.4, 0.2],
                          }}
                          transition={{
                            duration: 5,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                        <motion.div
                          className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/15 rounded-full blur-2xl"
                          animate={{
                            scale: [1.2, 1, 1.2],
                            opacity: [0.15, 0.3, 0.15],
                          }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 1
                          }}
                        />

                        <div className="relative z-10 text-center">
                          {/* High Quality Image */}
                          <motion.div
                            className="relative w-48 h-48 mx-auto mb-6 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-yellow-400/40 group-hover:ring-yellow-400/70 transition-all duration-300"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Image
                              src={member.image}
                              alt={`${member.name}`}
                              width={256}
                              height={256}
                              quality={100}
                              priority={index < 2}
                              className="w-full h-full object-cover object-top"
                              style={{ objectPosition: 'center top' }}
                            />
                            {/* Gradient overlay on hover */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </motion.div>

                          {/* Name in Image Tile */}
                          <div className="space-y-2">
                            <h4 className="text-2xl font-bold bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
                              {member.name}
                            </h4>
                            <p className="text-base text-slate-300 font-medium">
                              {member.role}
                            </p>
                            {member.workplace && (
                              <p className="text-sm text-yellow-400/80 font-normal italic">
                                {member.workplace}
                              </p>
                            )}
                          </div>

                          {/* Decorative bottom accent */}
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent"></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Right Tile - Content Section (Separated) */}
                  <motion.div
                    className="flex-1"
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="relative p-[1px] rounded-2xl bg-gradient-to-br from-yellow-400/50 via-amber-500/50 to-yellow-600/50 h-full">
                      <div className="bg-gradient-to-br from-slate-800 via-slate-800/95 to-slate-900 rounded-2xl p-8 md:p-10 h-full">
                        <div className="space-y-7">
                          {/* Education */}
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="group/item"
                          >
                            <div className="flex items-start gap-4 mb-3">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400/25 to-amber-500/25 flex items-center justify-center flex-shrink-0 group-hover/item:scale-110 transition-transform duration-300 shadow-lg">
                                <GraduationCap className="w-6 h-6 text-yellow-400" />
                              </div>
                              <div className="flex-1">
                                <h5 className="text-sm font-bold text-yellow-400 uppercase tracking-wider mb-3">Education</h5>
                                <p className="text-lg text-white font-semibold leading-snug mb-2">
                                  {member.education}
                                </p>
                                <p className="text-sm text-yellow-400/90 font-medium">
                                  {member.institution}
                                </p>
                              </div>
                            </div>
                          </motion.div>

                          {/* Divider */}
                          <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>

                          {/* About */}
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="group/item"
                          >
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400/25 to-amber-500/25 flex items-center justify-center flex-shrink-0 group-hover/item:scale-110 transition-transform duration-300 shadow-lg">
                                <BookOpen className="w-6 h-6 text-yellow-400" />
                              </div>
                              <div className="flex-1">
                                <h5 className="text-sm font-bold text-yellow-400 uppercase tracking-wider mb-3">About</h5>
                                <p className="text-base text-slate-300 leading-relaxed">
                                  {member.bio || `${member.name} brings extensive experience in ${member.experience.toLowerCase()}, specializing in ${member.specialties?.slice(0, 2).join(" and ") || "their field"}.`}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* Web Team Section */}
      <section className="py-12 theme-bg-dark relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              y: [0, -80, 0],
              rotate: [0, 3, 0]
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-16 left-16 w-28 h-28 bg-gradient-to-br from-blue-400/20 to-cyan-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              y: [0, 60, 0],
              rotate: [0, -6, 0]
            }}
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute bottom-16 right-16 w-20 h-20 bg-gradient-to-br from-purple-400/15 to-pink-500/15 rounded-full blur-2xl"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h3 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Our Web Team
            </h3>
            <div className="h-1 w-24 bg-blue-400 mx-auto"></div>
          </motion.div>

          {/* Web Team Members - Side by Side */}
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-6">
            {webTeam.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="group"
              >
                <div className="grid grid-cols-[200px_1fr] gap-4 bg-[#1a2236]/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-blue-400/10 hover:border-blue-400/30 transition-all duration-300 h-full">
                  {/* Image Tile */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                    className="relative h-full min-h-[300px] overflow-hidden bg-gradient-to-br from-blue-500/10 to-purple-500/10"
                  >
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className={`object-cover ${member.name === "Deepak Kumar Singh" ? "object-[center_15%] scale-110" : "object-center"}`}
                      quality={90}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a2236] via-transparent to-transparent opacity-60"></div>
                  </motion.div>

                  {/* Content Tile */}
                  <div className="p-6 flex flex-col justify-center">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.2 + 0.2 }}
                    >
                      <h4 className="text-xl lg:text-2xl font-bold text-white mb-2">
                        {member.name}
                      </h4>
                      <p className="text-blue-400 font-semibold text-base mb-4">
                        {member.role}
                      </p>
                    </motion.div>

                    {/* Education */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.2 + 0.4 }}
                      className="mb-4"
                    >
                      <div className="flex items-start gap-2">
                        <GraduationCap className="h-4 w-4 text-blue-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-white font-semibold text-sm">{member.education}</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Bio */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.2 + 0.6 }}
                      className="mb-4"
                    >
                      <p className="text-sm theme-text-muted leading-relaxed">
                        {member.bio}
                      </p>
                    </motion.div>

                    {/* Specialties */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.2 + 0.8 }}
                    >
                      <div className="flex flex-wrap gap-2">
                        {member.specialties.map((specialty, idx) => (
                          <Badge
                            key={idx}
                            className="bg-blue-400/10 text-blue-400 border-blue-400/30 hover:bg-blue-400/20 transition-colors text-xs"
                          >
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
