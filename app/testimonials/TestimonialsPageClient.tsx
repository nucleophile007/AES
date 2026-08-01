"use client";

import TestimonialSection from "@/components/testimonials/testimonial-section";
import StudentSpotlightsSwiper from "@/components/testimonials/StudentSpotlightsSwiper";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";

type StudentSpotlight = {
  id: string;
  event: string;
  date: string;
  student: string;
  gradeSchool: string;
  topic: string;
  achievement: string;
  quote: string;
  schoolLogo?: string;
  competitionLogo?: string;
};

const studentSpotlights: StudentSpotlight[] = [
  {
    id: "isrc-2025-nithila",
    event: "International STEM Research Competition (ISRC)",
    date: "September 2025",
    student: "Nithila Shanmugham",
    gradeSchool: "Current Senior, Granite Bay High School",
    topic: "A Parametric Study of Human Balance with Delays using Delay Differential Equations (Bio + Math + Physics)",
    achievement: "Finalist (Top 20)",
    quote:
      "Congratulations to Nithila, a premed aspirant, on being a finalist at ISRC-2025. ACHARYA is proud of your achievement and dedication during IGNITE'25 research program is truly inspirational. Good luck to all your future endeavors.",
    schoolLogo: "/testimonial-logos/GraniteBayHighSchool.png",
    competitionLogo: "/spotlights/isrc.png",
  },
  {
    id: "ncsef-2026-pragna",
    event: "NCSEF Region 3A STEM Fair",
    date: "February 2026",
    student: "Pragna Surabathula",
    gradeSchool: "Current Junior, Raleigh Charter High School",
    topic: "The Self-Taught Ear: Unsupervised Signal Enhancement using Denoising Autoencoders (AI/ML)",
    achievement: "Honorable Mention - Mathematics, Statistics & Data Science",
    quote:
      "Well done, Pragna, an aerospace engineering aspirant, on your achievement at the NCSEF. Your dedication during TRANSFORM'25 research program is truly remarkable. Wishing you all the best for your future adventures with ACHARYA.",
    schoolLogo: "/testimonial-logos/Raleigh_Charter__NC__Phoenix_logo.png.webp",
    competitionLogo: "/spotlights/ncff.png",
  },
  {
    id: "sac-2026-atreya",
    event: "Sac STEM Fair",
    date: "March 2026",
    student: "Atreya Kulkarni",
    gradeSchool: "Current Junior, Vista del Lago High School",
    topic: "A Geometric Approach for Thickness Prediction in Incremental Sheet Forming (Engineering)",
    achievement: "Special Award - Citadel Securities Innovation Prize (High School)",
    quote:
      "From TRANSFORM'25 to the Sac STEM Fair, your dedication to aerospace engineering continues to inspire us. Congratulations on this well-deserved win! We wish you boundless success as you continue your journey with ACHARYA.",
    schoolLogo: "/testimonial-logos/VistaDelLagoHS-GraphicsTransparent.png",
    competitionLogo: "/spotlights/sac-stem.png",
  },
  {
    id: "sac-2026-shivam",
    event: "Sac STEM Fair",
    date: "March 2026",
    student: "",
    gradeSchool: "Current Sophomore, Folsom High School",
    topic: "Evaluating Predictive Models for Heart Disease: A Comparative Study of Feature Selection and Neural Architectures (AI/ML)",
    achievement: "Recognition: First time participant at Sac STEM Fair",
    quote:
      "Kudos, Shivam, on your selection for the Sac STEM Fair. It is rewarding to see the research acumen you developed during the IGNITE'25 program earn such well-deserved accolades at the fair. We are excited to continue this journey with you to the next level.",
    schoolLogo: "/testimonial-logos/folsom.png",
    competitionLogo: "/spotlights/sac-stem.png",
  },
  {
    id: "sac-2026-vedant",
    event: "Sac STEM Fair",
    date: "March 2026",
    student: "Vedant Sharma",
    gradeSchool: "Current Sophomore, Pleasant Grove High School",
    topic: "Early Detection of Diabetes using Logistic Regression (AI/ML)",
    achievement: "Recognition: First time participant at Sac STEM Fair",
    quote:
      "Kudos Vedant for your selection to the Sac STEM Fair! It's inspiring to see your IGNITE'25 research receiving top honors. We are excited to keep this momentum with you as you work on the next phase of the project.",
    schoolLogo: "/testimonial-logos/default.png",
    competitionLogo: "/spotlights/sac-stem.png",
  },
  {
    id: "usabo-2026-nithya",
    event: "USABO-2025",
    date: "2026",
    student: "Nithya Reddy Pathi",
    gradeSchool: "Current Junior, Vista del Lago High School",
    topic: "Olympiad preparation and strategic biology mastery",
    achievement: "USABO'26 Semi-finalist",
    quote:
      "A huge congratulations to our student on being named a USABO Semifinalist! It is incredibly rewarding to see the strategic study plan designed by ACHARYA translated into such elite national recognition.",
    schoolLogo: "/testimonial-logos/VistaDelLagoHS-GraphicsTransparent.png",
    competitionLogo: "/spotlights/usabo.png",
  },
];

type Testimonial = {
  id: string;
  name: string;
  designation: string;
  school: string;
  content: string;
  successStory: string;
  src: string;
  rating: number;
  programs: string[];
};

type SectionsType = {
  tutoring: Testimonial[];
  satCoaching: Testimonial[];
  collegePrep: Testimonial[];
  researchProgram: Testimonial[];
  mathCompetition: Testimonial[];
};

export default function TestimonialsPageClient({
  sections,
}: {
  sections: SectionsType;
}) {
  // Filter out college admissions from spotlights
  const filteredSpotlights = studentSpotlights.filter(
    (item) => item.id !== "college-admissions-2026"
  );

  return (
    <main className="min-h-screen theme-bg-dark flex flex-col">
      <Header />

      <section className="pt-28 pb-10">
        <div className="max-w-7xl mx-auto px-4">
          {/* Student Spotlights heading */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <Badge className="mb-4 bg-yellow-400/10 text-yellow-400 border-yellow-400/20 px-4 py-2 text-lg font-semibold">
              Student Spotlights
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold theme-text-light mb-2">
              Recent Student Achievements
            </h2>
            <p className="text-lg theme-text-muted max-w-3xl mx-auto">
              Celebrating research, competitions and notable milestones.
            </p>
          </motion.div>
        </div>

        <div className="w-full">
          <StudentSpotlightsSwiper items={filteredSpotlights} />
        </div>
      </section>

      {/* Removed the overall "Student Success Stories" heading so
          individual testimonial sections start directly after the
          spotlights swiper (Research first). */}

      <div className="container mx-auto px-4 py-20 space-y-24">
        <TestimonialSection
          title="Research Program"
          description="Discover your passion for academic research"
          testimonials={sections.researchProgram}
          color="from-orange-600 to-orange-400"
        />

        <TestimonialSection
          title="College Prep (UACHIEVE)"
          description="Pathway to your dream university"
          testimonials={sections.collegePrep}
          color="from-purple-600 to-purple-400"
        />

        <TestimonialSection
          title="Math Competition"
          description="Master advanced problem-solving techniques"
          testimonials={sections.mathCompetition}
          color="from-pink-600 to-pink-400"
        />

        <TestimonialSection
          title="Tutoring Program"
          description="Academic excellence through personalized guidance"
          testimonials={sections.tutoring}
          color="from-blue-600 to-blue-400"
        />
      </div>

      <Footer />
    </main>
  );
}
