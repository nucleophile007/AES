import React from 'react';
import { prisma } from "@/lib/prisma";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import Chatbot from "@/components/home/Chatbot";
import AboutPageClient from "./AboutPageClient";

// Enable ISR - revalidate every hour
export const revalidate = 3600;

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
  priority?: boolean;
}

// Fetch mentors data at build time
async function getMentors(): Promise<Mentor[]> {
  try {
    const mentors = await prisma.mentor.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        displayOrder: 'asc',
      },
    });
    
    // Transform Prisma data to match the Mentor interface
    return mentors.map(mentor => ({
      id: mentor.id,
      name: mentor.name,
      department: mentor.department,
      role: mentor.role,
      image: mentor.image,
      education: mentor.education,
      institution: mentor.institution,
      bio: mentor.bio,
      experience: mentor.experience,
      specialties: mentor.specialties,
      achievements: mentor.achievements || undefined,
      workplace: mentor.workplace || undefined,
      priority: mentor.priority || undefined,
    })) as Mentor[];
  } catch (error) {
    console.error("Error fetching mentors:", error);
    return [];
  }
}


export default async function AboutPage() {
  // Fetch mentors data on the server
  const mentors = await getMentors();

  return (
    <main className="min-h-screen theme-bg-dark flex flex-col">
      <Header />
      <AboutPageClient mentors={mentors} />
      <Chatbot />
      <Footer />
    </main>
  );
}

