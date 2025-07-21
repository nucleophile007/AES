"use client";
import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Play } from "lucide-react";
import { useState } from "react";

export default function HeroSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [subjectOfInterest, setSubjectOfInterest] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");
    try {
      const res = await fetch("/api/book-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          gradeLevel,
          subjectOfInterest,
        }),
      });
      if (res.ok) {
        setSuccess("Session booked successfully! We'll contact you soon.");
        setName(""); setEmail(""); setPhone(""); setGradeLevel(""); setSubjectOfInterest("");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to book session.");
      }
    } catch {
      setError("Failed to book session.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="home"
      className="pt-24 pb-20 bg-gradient-to-br from-brand-light-blue via-white to-brand-light-blue/50"
    >
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <Badge className="bg-brand-orange/10 text-brand-orange border-brand-orange/20">
                ✨ Excellence in Education Since 2020
              </Badge>
              <h1 className="text-5xl lg:text-6xl font-bold text-text-dark leading-tight">
                Nurture Your Child&apos;s
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-teal">
                  {" "}
                  Academic Excellence
                </span>
              </h1>
              <p className="text-xl text-text-light leading-relaxed">
                Every student can learn, just not on the same day, or in the
                same way. We craft personalized learning experiences rooted in
                decades of academic expertise.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-brand-blue to-brand-teal hover:from-brand-blue/90 hover:to-brand-teal/90"
              >
                Get Free 60-Min Session
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch How It Works
              </Button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/20 to-brand-teal/20 rounded-3xl transform rotate-6"></div>
              <div className="relative bg-white p-8 rounded-3xl shadow-2xl border">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">Free Assessment</h3>
                    <Badge className="bg-brand-green text-white">Limited Time</Badge>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input placeholder="Student's Name" value={name} onChange={e => setName(e.target.value)} required />
                    <Input placeholder="Parent Email" value={email} onChange={e => setEmail(e.target.value)} type="email" required />
                    <Input placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} required />
                    <Input placeholder="Grade Level" value={gradeLevel} onChange={e => setGradeLevel(e.target.value)} required />
                    <Input placeholder="Subject of Interest" value={subjectOfInterest} onChange={e => setSubjectOfInterest(e.target.value)} required />
                    <Button type="submit" className="w-full bg-gradient-to-r from-brand-blue to-brand-teal" disabled={loading}>
                      {loading ? "Booking..." : "Book Free Session"}
                    </Button>
                    {success && <div className="text-green-600 text-sm pt-2">{success}</div>}
                    {error && <div className="text-red-600 text-sm pt-2">{error}</div>}
                  </form>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 