import { prisma } from "@/lib/prisma";
import TestimonialsPageClient from "./TestimonialsPageClient";

export const revalidate = 3600;

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

const getSchoolLogo = (school: string | null | undefined): string => {
  if (!school || school.toLowerCase() === "null") {
    return "/testimonial-logos/default.png";
  }

  const normalized = school.toLowerCase().trim();
  const cleaned = normalized
    .replace("high school", "")
    .replace("highschool", "")
    .replace("middle school", "")
    .replace("school", "")
    .trim();

  if (cleaned.includes("folsom")) return "/testimonial-logos/folsom.png";
  if (cleaned.includes("granite bay")) return "/testimonial-logos/GraniteBayHighSchool.png";
  if (cleaned.includes("vista del lago") || cleaned.includes("vdl")) return "/testimonial-logos/VistaDelLagoHS-GraphicsTransparent.png";
  if (cleaned.includes("west park")) return "/testimonial-logos/WestParkHighSchool.png";
  if (cleaned.includes("raleigh")) return "/testimonial-logos/Raleigh_Charter__NC__Phoenix_logo.png.webp";
  if (cleaned.includes("rocklin")) return "/testimonial-logos/rocklin.jpg";

  return "/testimonial-logos/default.png";
};

async function getTestimonials(): Promise<SectionsType> {
  const rows = await prisma.testimonial.findMany({
    where: {
      OR: [
        { contentApproved: true },
        { successStoryApproved: true },
        { ratingApproved: true },
      ],
    },
    include: {
      Student: {
        select: {
          name: true,
          grade: true,
          schoolName: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

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
    Tutoring: "tutoring",
  };

  rows.forEach((row) => {
    const testimonial: Testimonial = {
      id: row.id.toString(),
      name: row.studentName || row.Student?.name || "Student",
      designation: row.grade || row.Student?.grade || "",
      school: row.school || row.Student?.schoolName || "",
      content: row.content ?? "",
      successStory: row.successStory ?? "",
      src: getSchoolLogo(row.school || row.Student?.schoolName || ""),
      rating: row.rating ?? 5,
      programs: Array.isArray(row.programs) ? row.programs : [],
    };

    testimonial.programs.forEach((program) => {
      const key = programMap[program];
      if (key) {
        grouped[key].push(testimonial);
      }
    });
  });

  return grouped;
}

export default async function Page() {
  const sections = await getTestimonials();

  return <TestimonialsPageClient sections={sections} />;
}
