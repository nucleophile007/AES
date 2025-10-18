"use client"

import { StickyTestimonialsSection, type Testimonial } from "@/components/testimonials/sticky-testimonials-section"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"


const sections: {
  [key: string]: Testimonial[]
} = {
  tutoring: [
    {
      name: "Pragna",
      designation: "Physics: 95% | Math: B's to A's",
      school: "Raleigh Charter High School",
      quote:
        "ACHARYA Educational Services has significantly improved my academic performance in both physics and math. With their guidance, I achieved a 95 on my physics midterm and raised my math test scores from low B's to consistent A's. The tutors are knowledgeable, clear in their explanations, and genuinely committed to student success.",
      src: "/testimonial-logos/Raleigh_Charter__NC__Phoenix_logo.png.webp",
      rating: 5,
    },
    {
      name: "Adwitha",
      designation: "Math Grade: D to A",
      school: "West Park High School",
      quote:
        "ACHARYA Educational Services has great tutors who have helped me improve in math a lot. I went from a D to an A this year. Math is now easier than before when I was struggling everything finally clicked. My confidence in math has grown throughout the year.",
      src: "/testimonial-logos/WestParkHighSchool.png",
      rating: 5,
    },
    {
      name: "Lalit Pinisetti",
      designation: "Personalized Learning Success",
      school: "Folsom High School",
      quote:
        "The tutor is strict with students when he needs to be strict, and gentle with students when he needs to be gentle. He truly understands what each student is capable of and motivates each student precisely enough for their highest chances of success. He makes each topic easy to understand for students and is overall a great teacher.",
      src: "/testimonial-logos/folsom.png",
      rating: 5,
    },
    {
      name: "Ruhee",
      designation: "AP Calculus Confidence",
      school: "Folsom High School",
      quote:
        "I joined because I wanted help in preparing for the AP Calculus exam, and these sessions definitely boosted my confidence in and familiarity with the subject. The tutors provided lots of good practice problems, explained concepts that I didn't understand at first, and were patient if it took me a while to figure something out. Overall, great experience!",
      src: "/testimonial-logos/folsom.png",
      rating: 5,
    },
    {
      name: "Rishitha",
      designation: "Tailored Learning Method",
      school: "Folsom High School",
      quote:
        "I have joined these classes to help me get hold and excel in some of the classes that I am taking in school. Tutors gained insights on how I learn and tailors the classes based on that which helps me to understand the different concepts even better. Their way of teaching is very unique and different from any other tutor.",
      src: "/testimonial-logos/folsom.png",
      rating: 5,
    },
    {
      name: "Sloane Stenson",
      designation: "Online Learning Success",
      school: "Granite Bay High School",
      quote:
        "ACHARYA Educational Services has great tutors who have been so helpful to me as my tutor. They thoroughly explain every question I have to me and provide me with extra practice when needed. Being available via zoom makes tutoring easier and more accessible.",
      src: "/testimonial-logos/GraniteBayHighSchool.png",
      rating: 5,
    },
    {
      name: "Geetika",
      designation: "Pre-Calculus Mastery",
      school: "Vista del Lago High School",
      quote:
        "I joined these classes because I need help with Pre-Calculus, and every time I come to my classes I leave feeling more confident in the topic I am learning. Going to these classes helped me improve my test scores and helped me improve my overall grade in my pre-calculus class.",
      src: "/testimonial-logos/VistaDelLagoHS-GraphicsTransparent.png",
      rating: 5,
    },
    {
      name: "IM1 Tutoring: Sutter Middle School",
      designation: "Patient Teaching Approach",
      school: "Sutter Middle School",
      quote:
        "ACHARYA Educational Services has great tutors who are very patient and positive. Our daughter is having difficulty keeping up with the pace of her teacher at school. The tutors are better at explaining the concepts and allows her time to learn. They are very encouraging and helps to boost her confidence.",
      src: "/testimonial-logos/folsom.png",
      rating: 5,
    },
    {
      name: "Pre-Calc Tutoring: Folsom High School",
      designation: "Interactive Learning",
      school: "Folsom High School",
      quote:
        "Amazing Service! ACHARYA Educational Services has great tutors who are very interactive and focused with my kid. They explain concepts very well in multiple different ways and also a very nice and understanding person. Great Tutor!",
      src: "/testimonial-logos/folsom.png",
      rating: 5,
    },
    {
      name: "IM3 Tutoring: Folsom High School",
      designation: "Flexible Scheduling",
      school: "Folsom High School",
      quote:
        "ACHARYA Educational Services has great tutors who have flexible scheduling and we worked together to find the best days to meet that provide the most benefit for my son. They make sure that my son is not just working on math when he is in his session but rather, they also ask that my son check in, provides updates and samples of what he is working on.",
      src: "/testimonial-logos/folsom.png",
      rating: 5,
    },
    {
      name: "IM2 Tutoring: Folsom High School",
      designation: "Professional Methodology",
      school: "Folsom High School",
      quote:
        "ACHARYA Educational Services has great tutors who are a great Tutor! They are very professional and organized in their methodology. You can tell right away that they care about the students. They provide a game plan for their students. Would definitely recommend them.",
      src: "/testimonial-logos/folsom.png",
      rating: 5,
    },
    {
      name: "IM1 Tutoring: Folsom High School",
      designation: "Concept Breakdown",
      school: "Folsom High School",
      quote:
        "The tutors have been really good about breaking down the steps of my son's struggles. They provided help with preparing for quizzes and tests. They have provided tips and tricks that helped math concepts makes sense that common core just is not accomplishing.",
      src: "/testimonial-logos/folsom.png",
      rating: 5,
    },
  ],
  satCoaching: [
    {
      quote: "Increased my SAT score by 300 points! The strategies and practice tests were game-changing.",
      name: "Rachel Martinez",
      designation: "SAT Score: 1520",
      school: "Folsom High School",
      src: "/testimonial-logos/folsom.png",
      rating: 5,
    },
    {
      quote: "The SAT prep course was comprehensive and well-structured. I felt completely prepared on test day.",
      name: "James Thompson",
      designation: "SAT Score: 1480",
      school: "Granite Bay High School",
      src: "/testimonial-logos/GraniteBayHighSchool.png",
      rating: 5,
    },
    {
      quote: "The personalized study plan and expert guidance helped me achieve my target score. Couldn't be happier!",
      name: "Aisha Patel",
      designation: "SAT Score: 1550",
      school: "Vista del Lago High School",
      src: "/testimonial-logos/VistaDelLagoHS-GraphicsTransparent.png",
      rating: 5,
    },
    {
      quote: "From 1200 to 1450 in just 3 months! The instructors know exactly how to tackle each section effectively.",
      name: "Tyler Rodriguez",
      designation: "SAT Score: 1450",
      school: "Folsom High School",
      src: "/testimonial-logos/folsom.png",
      rating: 5,
    },
    {
      quote: "The mock tests and detailed feedback prepared me perfectly. I exceeded my own expectations!",
      name: "Lily Wang",
      designation: "SAT Score: 1500",
      school: "Granite Bay High School",
      src: "/testimonial-logos/GraniteBayHighSchool.png",
      rating: 5,
    },
  ],
  collegePrep: [
    {
      quote: "The college prep program helped me get into my dream school! The essay guidance was invaluable.",
      name: "Michael Chang",
      designation: "Admitted to Stanford University",
      school: "Folsom High School",
      src: "/testimonial-logos/folsom.png",
      rating: 5,
    },
    {
      quote:
        "From application strategy to interview prep, they covered everything. I got into 8 out of 10 colleges I applied to!",
      name: "Isabella Garcia",
      designation: "Admitted to MIT",
      school: "Granite Bay High School",
      src: "/testimonial-logos/GraniteBayHighSchool.png",
      rating: 5,
    },
    {
      quote: "The college counselors helped me discover schools I never would have considered. Found the perfect fit!",
      name: "Kevin Lee",
      designation: "Admitted to UC Berkeley",
      school: "Vista del Lago High School",
      src: "/testimonial-logos/VistaDelLagoHS-GraphicsTransparent.png",
      rating: 5,
    },
    {
      quote: "The scholarship guidance alone saved my family thousands of dollars. Plus, I got into my top choice!",
      name: "Zoe Anderson",
      designation: "Admitted to Harvard University",
      school: "Folsom High School",
      src: "/testimonial-logos/folsom.png",
      rating: 5,
    },
    {
      quote:
        "They helped me craft a compelling narrative that showcased my unique strengths. The results speak for themselves!",
      name: "Nathan Kim",
      designation: "Admitted to Princeton University",
      school: "Granite Bay High School",
      src: "/testimonial-logos/GraniteBayHighSchool.png",
      rating: 5,
    },
  ],
  researchProgram: [
    {
      quote:
        "The research program opened doors I never knew existed. I'm now published and heading to graduate school!",
      name: "Sarah Mitchell",
      designation: "Published Researcher",
      school: "Folsom High School",
      src: "/testimonial-logos/folsom.png",
      rating: 5,
    },
    {
      quote: "Working with PhD mentors gave me real research experience. My project won the state science fair!",
      name: "Daniel Foster",
      designation: "State Science Fair Winner",
      school: "Granite Bay High School",
      src: "/testimonial-logos/GraniteBayHighSchool.png",
      rating: 5,
    },
    {
      quote: "The research program taught me critical thinking and methodology that I use in all my studies now.",
      name: "Maya Patel",
      designation: "Research Intern at Johns Hopkins",
      school: "Vista del Lago High School",
      src: "/testimonial-logos/VistaDelLagoHS-GraphicsTransparent.png",
      rating: 5,
    },
    {
      quote: "I discovered my passion for biomedical research through this program. Now I'm pre-med at Yale!",
      name: "Carlos Mendoza",
      designation: "Pre-Med Student at Yale",
      school: "Folsom High School",
      src: "/testimonial-logos/folsom.png",
      rating: 5,
    },
    {
      quote: "The hands-on research experience and mentorship were invaluable. I'm now pursuing a PhD in physics!",
      name: "Grace Liu",
      designation: "PhD Candidate at Caltech",
      school: "Granite Bay High School",
      src: "/testimonial-logos/GraniteBayHighSchool.png",
      rating: 5,
    },
  ],
  mathCompetition: [
    {
      quote: "Qualified for USAMO after training here! The problem-solving techniques are incredibly effective.",
      name: "Andrew Zhou",
      designation: "USAMO Qualifier",
      school: "Folsom High School",
      src: "/testimonial-logos/folsom.png",
      rating: 5,
    },
    {
      quote: "Won first place at the state math competition! The coaches here are absolutely phenomenal.",
      name: "Priya Sharma",
      designation: "State Math Champion",
      school: "Granite Bay High School",
      src: "/testimonial-logos/GraniteBayHighSchool.png",
      rating: 5,
    },
    {
      quote:
        "From struggling with algebra to competing nationally in math contests. The transformation was incredible!",
      name: "Jordan Taylor",
      designation: "National Math Competitor",
      school: "Vista del Lago High School",
      src: "/testimonial-logos/VistaDelLagoHS-GraphicsTransparent.png",
      rating: 5,
    },
    {
      quote: "The AMC preparation was thorough and challenging. I improved my score by over 50 points!",
      name: "Elena Volkov",
      designation: "AMC 12 High Scorer",
      school: "Folsom High School",
      src: "/testimonial-logos/folsom.png",
      rating: 5,
    },
    {
      quote: "Made it to the Math Olympiad team thanks to the expert coaching and rigorous practice sessions here!",
      name: "Ryan O'Connor",
      designation: "Math Olympiad Team Member",
      school: "Granite Bay High School",
      src: "/testimonial-logos/GraniteBayHighSchool.png",
      rating: 5,
    },
  ],
}

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Enhanced Header Section */}
      <div className="pt-20 pb-16 px-4 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-24 h-24 bg-yellow-400 rounded-full opacity-5 animate-float"></div>
          <div className="absolute top-40 right-20 w-20 h-20 bg-blue-400 rounded-full opacity-5 animate-float-reverse"></div>
          <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-purple-400 rounded-full opacity-5 animate-float"></div>
        </div>
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 bg-yellow-400/10 text-yellow-400 border-yellow-400/20 px-6 py-3 text-lg font-semibold">
              Student Success Stories
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              The Teams We Empower
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Explore real testimonials from our five programs. Scroll each section to reveal detailed stories in a sticky panel and discover how ACHARYA Educational Services transforms academic journeys.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-6xl px-4 pb-20">
        <StickyTestimonialsSection title="Tutoring" items={sections.tutoring} />
        <StickyTestimonialsSection title="SAT Coaching" items={sections.satCoaching} />
        <StickyTestimonialsSection title="College Prep" items={sections.collegePrep} />
        <StickyTestimonialsSection title="Research Program" items={sections.researchProgram} />
        <StickyTestimonialsSection title="Math Competition" items={sections.mathCompetition} />
      </main>
    </div>
  )
}
