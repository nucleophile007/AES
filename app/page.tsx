"use client";

import Header from "@/components/home/Header";
import HeroSection from "@/components/home/HeroSection";
import MissionSection from "@/components/home/MissionSection";
import ProgramsSection from "@/components/home/ProgramsSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import MentorSpotlightSection from "@/components/home/MentorSpotlightSection";
import FacultySection from "@/components/home/FacultySection";
import TeamPhilosophySection from "@/components/home/TeamPhilosophySection";
import SuccessStoriesSection from "@/components/home/SuccessStoriesSection";
import BlogSection from "@/components/home/BlogSection";
import FeaturesGridSection from "@/components/home/FeaturesGridSection";
import CTASection from "@/components/home/CTASection";
import Chatbot from "@/components/home/Chatbot";
import Footer from "@/components/home/Footer";
import AdminDashboard from "@/components/home/AdminDashboard";
import { usePathname } from "next/navigation";

export default function HomePage() {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  if (pathname === "/admin") {
    return <AdminDashboard />;
  }
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <MissionSection />
      <ProgramsSection />
      <HowItWorksSection />
      <MentorSpotlightSection />
      <FacultySection />
      <TeamPhilosophySection />
      <SuccessStoriesSection />
      <BlogSection />
      <FeaturesGridSection />
      <CTASection />
      <Chatbot />
      <Footer />
    </div>
  );
}
