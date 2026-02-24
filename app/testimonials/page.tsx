"use client";

import { useEffect, useState } from "react";
import TestimonialSection from "@/components/testimonials/testimonial-section";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";

interface Testimonial {
  id: string;
  name: string;
  designation: string;
  school: string;
  content: string;
  successStory: string;
  src: string;
  rating: number;
  programs: string[];
}

type SectionsType = {
  tutoring: Testimonial[];
  satCoaching: Testimonial[];
  collegePrep: Testimonial[];
  researchProgram: Testimonial[];
  mathCompetition: Testimonial[];
};

export default function Page() {
  const [sections, setSections] = useState<SectionsType>({
    tutoring: [],
    satCoaching: [],
    collegePrep: [],
    researchProgram: [],
    mathCompetition: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await fetch("/api/testimonials/full");
        const data = await res.json();

        if (!data.success) return;

        const grouped: SectionsType = {
          tutoring: [],
          satCoaching: [],
          collegePrep: [],
          researchProgram: [],
          mathCompetition: [],
        };

        const programMap: Record<string, keyof SectionsType> = {
          "UACHIEVE COLLEGE ADMISSIONS PREP": "collegePrep",
          "AES CHAMPIONS Competitions": "mathCompetition",
          "AES EXPLORERS Research Program": "researchProgram",
          "SAT COACHING": "satCoaching",
          "Tutoring": "tutoring",
        };

        data.testimonials.forEach((t: Testimonial) => {
          if (!Array.isArray(t.programs)) return;

          t.programs.forEach((program) => {
            const key = programMap[program];
            if (key) grouped[key].push(t);
          });
        });

        setSections(grouped);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  return (
    <main className="min-h-screen theme-bg-dark flex flex-col">
      <Header />

      {/* Hero */}
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

      {/* Always Render Sections */}
      <div className="container mx-auto px-4 py-20 space-y-24">
        <TestimonialSection
          title="Tutoring Program"
          description="Academic excellence through personalized guidance"
          testimonials={sections.tutoring}
          color="from-blue-600 to-blue-400"
          loading={loading}
        />

        <TestimonialSection
          title="SAT Coaching"
          description="Score improvement strategies that deliver results"
          testimonials={sections.satCoaching}
          color="from-emerald-600 to-emerald-400"
          loading={loading}
        />

        <TestimonialSection
          title="College Prep (UACHIEVE)"
          description="Pathway to your dream university"
          testimonials={sections.collegePrep}
          color="from-purple-600 to-purple-400"
          loading={loading}
        />

        <TestimonialSection
          title="Research Program"
          description="Discover your passion for academic research"
          testimonials={sections.researchProgram}
          color="from-orange-600 to-orange-400"
          loading={loading}
        />

        <TestimonialSection
          title="Math Competition"
          description="Master advanced problem-solving techniques"
          testimonials={sections.mathCompetition}
          color="from-pink-600 to-pink-400"
          loading={loading}
        />
      </div>

      <Footer />
    </main>
  );
}

// "use client";

// import { useEffect, useState } from "react";
// import TestimonialSection from "@/components/testimonials/testimonial-section";
// import { motion } from "framer-motion";
// import { Badge } from "@/components/ui/badge";
// import Header from "@/components/home/Header";
// import Footer from "@/components/home/Footer";

// interface Testimonial {
//   id: string;
//   name: string;
//   designation: string;
//   school: string;
//   content: string;
//   successStory: string;
//   src: string;
//   rating: number;
//   programs: string[];
// }

// type SectionsType = {
//   tutoring: Testimonial[];
//   satCoaching: Testimonial[];
//   collegePrep: Testimonial[];
//   researchProgram: Testimonial[];
//   mathCompetition: Testimonial[];
// };

// export default function Page() {
//   const [sections, setSections] = useState<SectionsType>({
//     tutoring: [],
//     satCoaching: [],
//     collegePrep: [],
//     researchProgram: [],
//     mathCompetition: [],
//   });

//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchTestimonials = async () => {
//       try {
//         const res = await fetch("/api/testimonials/full");
//         const data = await res.json();

//         if (!data.success) return;

//         const grouped: SectionsType = {
//           tutoring: [],
//           satCoaching: [],
//           collegePrep: [],
//           researchProgram: [],
//           mathCompetition: [],
//         };

//         const programMap: Record<string, keyof SectionsType> = {
//           "UACHIEVE COLLEGE ADMISSIONS PREP": "collegePrep",
//           "AES CHAMPIONS Competitions": "mathCompetition",
//           "AES EXPLORERS Research Program": "researchProgram",
//           "SAT COACHING": "satCoaching",
//           "Tutoring": "tutoring",
//         };

//         data.testimonials.forEach((t: Testimonial) => {
//           if (!Array.isArray(t.programs)) return;

//           t.programs.forEach((program) => {
//             const key = programMap[program];
//             if (key) {
//               grouped[key].push(t);
//             }
//           });
//         });

//         setSections(grouped);
//       } catch (err) {
//         console.error("Fetch error:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTestimonials();
//   }, []);

//   return (
//     <main className="min-h-screen theme-bg-dark flex flex-col">
//       <Header />

//       {/* Hero Section */}
//       <div className="pt-32 pb-16 mb-20 px-4 relative overflow-hidden">
//         <div className="max-w-6xl mx-auto text-center relative z-10">
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8 }}
//           >
//             <Badge className="mb-6 bg-yellow-400/10 text-yellow-400 border-yellow-400/20 px-6 py-3 text-lg font-semibold">
//               Student Success Stories
//             </Badge>

//             <h1 className="text-4xl md:text-6xl font-bold theme-text-light mb-6">
//               Student{" "}
//               <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500">
//                 Success Stories
//               </span>
//             </h1>

//             <p className="text-xl theme-text-muted max-w-3xl mx-auto">
//               Hear directly from our students about their transformative experiences.
//             </p>
//           </motion.div>
//         </div>
//       </div>

//       {loading ? (
//         <div className="text-center text-white py-20 text-xl">
//           Loading testimonials...
//         </div>
//       ) : (
//         <div className="container mx-auto px-4 py-20 space-y-24">
//           {sections.tutoring.length > 0 && (
//             <TestimonialSection
//               title="Tutoring Program"
//               description="Academic excellence through personalized guidance"
//               testimonials={sections.tutoring}
//               color="from-blue-600 to-blue-400"
//             />
//           )}

//           {sections.satCoaching.length > 0 && (
//             <TestimonialSection
//               title="SAT Coaching"
//               description="Score improvement strategies that deliver results"
//               testimonials={sections.satCoaching}
//               color="from-emerald-600 to-emerald-400"
//             />
//           )}

//           {sections.collegePrep.length > 0 && (
//             <TestimonialSection
//               title="College Prep (UACHIEVE)"
//               description="Pathway to your dream university"
//               testimonials={sections.collegePrep}
//               color="from-purple-600 to-purple-400"
//             />
//           )}

//           {sections.researchProgram.length > 0 && (
//             <TestimonialSection
//               title="Research Program"
//               description="Discover your passion for academic research"
//               testimonials={sections.researchProgram}
//               color="from-orange-600 to-orange-400"
//             />
//           )}

//           {sections.mathCompetition.length > 0 && (
//             <TestimonialSection
//               title="Math Competition"
//               description="Master advanced problem-solving techniques"
//               testimonials={sections.mathCompetition}
//               color="from-pink-600 to-pink-400"
//             />
//           )}
//         </div>
//       )}

//       <Footer />
//     </main>
//   );
// }
