"use client";

import TestimonialSection from "@/components/testimonials/testimonial-section";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";

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
  return (
    <main className="min-h-screen theme-bg-dark flex flex-col">
      <Header />

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
            <p className="text-base theme-text-muted max-w-3xl mx-auto mt-4 leading-7">
              These stories highlight more than test scores or project titles. They show how students build confidence, develop stronger habits, and find a clearer direction through personalized support. We group testimonials by program so families can see how tutoring, college prep, research, and competition training each contribute to long-term growth.
            </p>
          </motion.div>
        </div>
      </div>

      <section className="container mx-auto px-4 pb-10">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 text-slate-200 max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold theme-text-light mb-3">
            Why we share student stories
          </h2>
          <p className="theme-text-muted leading-7 mb-3">
            Parents often want to know what progress looks like in real life. Testimonials help answer that question by showing how students use feedback, mentorship, and structured practice to make measurable improvements. Some students come to us with a clear academic goal, while others are still discovering their strengths. Either way, the stories here reflect that journey.
          </p>
          <p className="theme-text-muted leading-7">
            If you are deciding between programs, start with the section that best matches your current goal. You will see how students describe their experience in tutoring, SAT coaching, college prep, research, and competition training, which makes it easier to compare outcomes and next steps.
          </p>
        </div>
      </section>

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
