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
