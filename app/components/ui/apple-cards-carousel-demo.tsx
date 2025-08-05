"use client";
import React, { memo, useMemo } from "react";
import dynamic from "next/dynamic";
import { Carousel } from "./apple-cards-carousel";

const Card = dynamic(() => import("./apple-cards-carousel").then(mod => mod.Card), {
  loading: () => <div style={{height: 300, width: 200}}>Loading...</div>,
  ssr: false,
});

const AppleCardsCarouselDemo = memo(() => {
  const cards = useMemo(() => 
    data.map((card, index) => (
      <Card key={`${card.title}-${index}`} card={card} index={index} />
    )), []
  );

  return (
    <div className="w-full h-full">
      <Carousel items={cards} />
    </div>
  );
});

AppleCardsCarouselDemo.displayName = "AppleCardsCarouselDemo";

export default AppleCardsCarouselDemo;

const data = [
  {
    category: "Academic Excellence",
    title: "Academic Tutoring",
    description: "Personalized tutoring across all subjects with expert guidance.",
    src: "/program-image/academictutoring.png",
    features: [
      "Online Sessions",
      "Problem Solving",
      "Strong Foundations",
      "Learning Plans"
    ],
    subjects: [
      "Algebra",
      "Physics",
      "Biology",
      "Statistics"
    ],
    pricing: "Custom packages available",
    badge: "Most Popular",
    link: "/academictutoring"
  },
  {
    category: "Test Preparation",
    title: "SAT Coaching",
    description: "Comprehensive SAT preparation with proven test strategies.",
    src: "/program-image/satimage.png",
    features: [
      "Study Plans",
      "Practice Areas",
      "Test Strategies",
      "Online Options"
    ],
    subjects: [
      "SAT Math",
      "Reading",
      "Writing",
      "Timing"
    ],
    pricing: "Custom packages Available",
    badge: "Test Prep",
    link: "/satcoaching",
  },
  {
    category: "College Admissions",
    title: "College Preparation",
    description: "Complete college admissions guidance for university success.",
    src: "/program-image/collegeprep.png",
    features: [
      "Strategy",
      "Timeline",
      "Essays",
      "Financial Aid"
    ],
    subjects: [
      "Applications",
      "Essays",
      "Selection",
      "Interviews"
    ],
    pricing: "Custom packages available",
    badge: "College Bound",
    link: "/collegeprep",
  },
  {
    category: "Competition Math",
    title: "Math Competitions",
    description: "Specialized training for mathematics competitions.",
    src: "/program-image/mathimage.png",
    features: [
      "Expert Coaching",
      "Practice Problems",
      "Methodologies",
      "National Prep"
    ],
    subjects: [
      "AMC Prep",
      "AIME",
      "Problem Solving",
      "Olympiad"
    ],
    pricing: "Specialized coaching rates",
    badge: "Competition Ready",
    link: "/mathcompetion",
  },
  {
    category: "Research & Innovation",
    title: "Research Programs",
    description: "Independent research projects for college applications.",
    src: "/program-image/research.png",
    features: [
      "Stand Out",
      "Curiosity",
      "Portfolios",
      "Mentorship"
    ],
    subjects: [
      "Portfolio",
      "Research",
      "Methodology",
      "Presentation"
    ],
    pricing: "Custom research packages",
    badge: "College Edge",
    link: "/researchprogram",
  },
];