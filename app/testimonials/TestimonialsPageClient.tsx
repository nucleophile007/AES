"use client";

import TestimonialSection from "@/components/testimonials/testimonial-section";
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
  },
  {
    id: "sac-2026-shivam",
    event: "Sac STEM Fair",
    date: "March 2026",
    student: "Shivam Sharma",
    gradeSchool: "Current Sophomore, Folsom High School",
    topic: "Evaluating Predictive Models for Heart Disease: A Comparative Study of Feature Selection and Neural Architectures (AI/ML)",
    achievement: "Recognition: First time participant at Sac STEM Fair",
    quote:
      "Kudos, Shivam, on your selection for the Sac STEM Fair. It is rewarding to see the research acumen you developed during the IGNITE'25 program earn such well-deserved accolades at the fair. We are excited to continue this journey with you to the next level.",
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
  },
  {
    id: "college-admissions-2026",
    event: "College Admissions",
    date: "2026",
    student: "ACHARYA Seniors Cohort",
    gradeSchool: "Pre-med, Political Science, and Engineering pathways",
    topic:
      "Admits across Washington University in St. Louis, UNC Chapel Hill, UC San Diego, University of Washington, Pomona, USC, UC Santa Barbara, Fordham, Northeastern, and more.",
    achievement: "Strong admissions outcomes across Tier 1 to specialized feeder schools",
    quote:
      "Congratulations to all ACHARYA seniors for securing admission offers across top universities in 2026. Your consistency, mentorship engagement, and discipline made this possible.",
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
  const marqueeItems = Array.from({ length: 6 }, () => studentSpotlights).flat();

  return (
    <main className="min-h-screen theme-bg-dark flex flex-col">
      <Header />

      <section className="pt-28 pb-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-yellow-400/10 text-yellow-400 border-yellow-400/20 px-5 py-2 text-base font-semibold">
              Student Spotlights
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold theme-text-light">
              Competition and Admissions Highlights
            </h2>
          </div>

          {/* <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"> */}
            <div className="spotlights-marquee-track flex gap-6 w-max">
              {marqueeItems.map((item, index) => {
                const initials = item.student
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <article
                    key={`${item.id}-${index}`}
                    className="w-[88vw] md:w-[760px] lg:w-[820px] flex-shrink-0"
                  >
                    <div className="relative p-[1px] rounded-2xl bg-gradient-to-br from-yellow-400/50 via-amber-500/50 to-yellow-600/50 h-full">
                      <div className="bg-gradient-to-br from-slate-800 via-slate-800/95 to-slate-900 rounded-2xl h-full min-h-[360px] grid grid-cols-[220px_1fr] overflow-hidden">
                        <div className="p-6 border-r border-slate-700/60 flex flex-col items-center justify-center text-center bg-slate-900/35">
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 text-slate-900 text-2xl font-bold flex items-center justify-center shadow-xl mb-4">
                            {initials}
                          </div>
                          <h3 className="text-lg font-bold bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent leading-tight">
                            {item.student}
                          </h3>
                          <p className="mt-2 text-xs text-slate-300 leading-relaxed">{item.gradeSchool}</p>
                          <p className="mt-4 text-xs uppercase tracking-wider text-yellow-400">{item.date}</p>
                        </div>

                        <div className="p-6 md:p-7 h-full flex flex-col justify-between gap-4">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-xs uppercase tracking-[0.14em] text-yellow-400 font-semibold">{item.event}</p>
                              <p className="text-xs text-slate-400">{item.date}</p>
                            </div>
                            <p className="text-base text-white font-semibold leading-snug">{item.topic}</p>
                            <p className="text-sm text-cyan-300 font-medium">{item.achievement}</p>
                          </div>
                          <blockquote className="text-sm text-slate-300 leading-relaxed border-l-2 border-yellow-400/50 pl-4">
                            {item.quote}
                          </blockquote>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            {/* </div> */}
          </div>
        </div>
      </section>

      <div className="pt-32 pb-16 mb-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 bg-yellow-400/10 text-yellow-400 border-yellow-400/20 px-6 py-3 text-lg font-semibold">
              Student Success Stories
            </Badge>

            <h1 className="text-4xl md:text-6xl font-bold theme-text-light mb-6">
              Student{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500">
                Success Stories
              </span>
            </h1>

            <p className="text-xl theme-text-muted max-w-3xl mx-auto">
              Hear directly from our students about their transformative experiences.
            </p>
          </motion.div>
        </div>
      </div>

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

      <style jsx global>{`
        .spotlights-marquee-track {
          animation: spotlights-marquee 320s linear infinite;
        }

        .spotlights-marquee-track:hover {
          animation-play-state: paused;
        }

        @keyframes spotlights-marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </main>
  );
}
