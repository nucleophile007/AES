import type { Metadata } from "next";
import Header from "@/components/home/Header";
import ProgramsHero from "@/components/home/ProgramsHero";
import MissionSection from "@/components/home/MissionSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import FeaturesGridSection from "@/components/home/FeaturesGridSection";
import CTASection from "@/components/home/CTASection";
import SupportersCarousel from "@/components/home/SupportersCarousel";
import TestimonialCarousel from "@/components/home/TestimonialCarousel";
import Chatbot from "@/components/home/Chatbot";
import Footer from "@/components/home/Footer";

export const metadata: Metadata = {
  title: "ACHARYA Educational Services",
  description:
    "ACHARYA Educational Services offers academic tutoring, SAT coaching, research programs, math competition training, and college prep support for students.",
  alternates: {
    canonical: "./",
  },
  openGraph: {
    title: "ACHARYA Educational Services",
    description:
      "Discover tutoring, SAT prep, research mentorship, and college prep support for students across the USA.",
    type: "website",
    url: "./",
  },
  twitter: {
    title: "ACHARYA Educational Services",
    description:
      "Academic tutoring, SAT coaching, research programs, and college prep support for students.",
    card: "summary_large_image",
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background w-full overflow-x-hidden">
      <Header />
      <ProgramsHero />
      <MissionSection />
      <HowItWorksSection />
      <FeaturesGridSection />
      <CTASection />
      <TestimonialCarousel />
      <SupportersCarousel />
      <Chatbot />
      <Footer />
    </div>
  );
}
