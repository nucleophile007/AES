import { HeroSliderAlways } from "./HeroSliderAlways";

export function ProgramsHero() {
  const slides = [
    {
      title: "Academic Tutoring",
      subtitle: "Master Your Subjects",
      description:
        "Personalized, mastery-focused tutoring across STEM and humanities. Build strong foundations, gain confidence, and excel in your studies.",
      cta: { label: "Explore Tutoring", href: "/academictutoring" },
      imageSrc: "/program-image/acharyaes-academic-hero.jpg",
      imageAlt: "Students engaged in personalized academic tutoring",
    },
    {
      title: "AES Explorers",
      subtitle: "Discover & Innovate",
      description:
        "Guided research with faculty and industry mentors. Develop real projects, publish findings, and present your work at conferences.",
      cta: { label: "See Research Tracks", href: "/aes-explorers" },
      imageSrc: "/program-image/acharyaes-research-hero.jpg",
      imageAlt: "Students collaborating on cutting-edge research projects",
    },
    {
      title: "AES Champions",
      subtitle: "Compete & Excel",
      description: "AMC, AIME, and Olympiad preparation with proven problem-solving frameworks, mock contests, and expert feedback.",
      cta: { label: "Join Training", href: "/mathcompetition" },
      imageSrc: "/program-image/acharyaes-math-hero.jpg",
      imageAlt: "Students preparing for prestigious math competitions",
    },
    {
      title: "UAchieve",
      subtitle: "Your Path Forward",
      description:
        "Strategic guidance on essays, profile building, and applications that highlight your authentic strengths for selective admissions.",
      cta: { label: "Start Your Journey", href: "/collegeprep" },
      imageSrc: "/program-image/acharyaes-college-hero.jpg",
      imageAlt: "Students preparing for college admissions success",
    },
  ];

  return <HeroSliderAlways slides={slides} intervalMs={4500} ariaLabel="AcharyaES Programs" className="w-full pt-20" />;
}

export default ProgramsHero;


