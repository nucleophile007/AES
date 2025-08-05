import { AnimatedTestimonials } from "@/components/ui/animated-testimonial2"

export default function AnimatedTestimonialsDemo() {
  const sections = {
    tutoring: [
      {
        name: "Pragna",
        designation: "Physics: 95% | Math: B's to A's", // Mapped from achievement
        quote:
          "ACHARYA Educational Services has significantly improved my academic performance in both physics and math. With their guidance, I achieved a 95 on my physics midterm and raised my math test scores from low B's to consistent A's. The tutors are knowledgeable, clear in their explanations, and genuinely committed to student success.",
        src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Realistic dummy image link
        achievement: "Physics: 95% | Math: B's to A's",
        improvement: "Academic Excellence",
        subject: "Physics & Mathematics",
        highlight: "Outstanding Results",
        rating: 5,
      },
      {
        name: "Adwitha",
        designation: "Math Grade: D to A", // Mapped from achievement
        quote:
          "Shanti Swaroop is a great tutor and has helped improve in math a lot. I went from a D to an A this year. Math is now easier than before when I was struggling everything finally clicked. My confidence in math has grown throughout the year.",
        src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Realistic dummy image link
        achievement: "Math Grade: D to A",
        improvement: "Complete Turnaround",
        subject: "Mathematics",
        highlight: "Grade Transformation",
        rating: 5,
      },
      {
        name: "Lalit Pinisetti",
        designation: "Personalized Learning Success", // Mapped from achievement
        quote:
          "The tutor is strict with students when he needs to be strict, and gentle with students when he needs to be gentle. He truly understands what each student is capable of and motivates each student precisely enough for their highest chances of success. He makes each topic easy to understand for students and is overall a great teacher.",
        src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Realistic dummy image link
        achievement: "Personalized Learning Success",
        improvement: "Understanding & Motivation",
        subject: "Mathematics & Physics",
        highlight: "Personalized Approach",
        rating: 5,
      },
      {
        name: "Ruhee",
        designation: "AP Calculus Confidence", // Mapped from achievement
        quote:
          "I joined because I wanted help in preparing for the AP Calculus exam, and these sessions definitely boosted my confidence in and familiarity with the subject. Shanti provided lots of good practice problems, explained concepts that I didn't understand at first, and was patient if it took me a while to figure something out. Overall, great experience!",
        src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Realistic dummy image link
        achievement: "AP Calculus Confidence",
        improvement: "Exam Preparation Success",
        subject: "AP Calculus",
        highlight: "AP Exam Success",
        rating: 5,
      },
      {
        name: "Rishitha",
        designation: "Tailored Learning Method", // Mapped from achievement
        quote:
          "I have joined these classes to help me get hold and excel in some of the classes that I am taking in school. Shanti Swaroop gained insights on how I learn and tailors the classes based on that which helps me to understand the different concepts even better. His way of teaching is very unique and different from any other tutor.",
        src: "https://images.unsplash.com/photo-1623582854588-d60de57fa33f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Realistic dummy image link
        achievement: "Tailored Learning Method",
        improvement: "Concept Mastery",
        subject: "Multiple Subjects",
        highlight: "Customized Learning",
        rating: 5,
      },
      {
        name: "Sloane Stenson",
        designation: "Online Learning Success", // Mapped from achievement
        quote:
          "Shanti has been so helpful to me as my tutor. He thoroughly explains every question I have to me and provides me with extra practice when needed. Being available via zoom makes tutoring easier and more accessible.",
        src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Realistic dummy image link
        achievement: "Online Learning Success",
        improvement: "Accessible Tutoring",
        subject: "Mathematics",
        highlight: "Online Excellence",
        rating: 5,
      },
      {
        name: "Geetika",
        designation: "Pre-Calculus Mastery", // Mapped from achievement
        quote:
          "I joined these classes because I need help with Pre-Calculus, and every time I come to my classes I leave feeling more confident in the topic I am learning. Going to these classes helped me improve my test scores and helped me improve my overall grade in my pre-calculus class.",
        src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Realistic dummy image link
        achievement: "Pre-Calculus Mastery",
        improvement: "Test Score Improvement",
        subject: "Pre-Calculus",
        highlight: "Confidence Building",
        rating: 5,
      },
      {
        name: "IM1 Tutoring: Sutter Middle School",
        designation: "Patient Teaching Approach", // Mapped from achievement
        quote:
          "Shanti Swaroop is very patient and positive. Our daughter is having difficulty keeping up with the pace of her teacher at school. Shanti is better at explaining the concepts and allows her time to learn. He is very encouraging and helps to boost her confidence.",
        src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Realistic dummy image link
        achievement: "Patient Teaching Approach",
        improvement: "Pace Adaptation",
        subject: "Mathematics",
        highlight: "Patient Guidance",
        rating: 5,
      },
      {
        name: "Pre-Calc Tutoring: Folsom High School",
        designation: "Interactive Learning", // Mapped from achievement
        quote:
          "Amazing Service! Shanti Swaroop is very interactive and focused with my kid. He explains concepts very well in multiple different ways and also a very nice and understanding person. Great Tutor!",
        src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Realistic dummy image link
        achievement: "Interactive Learning",
        improvement: "Concept Understanding",
        subject: "Pre-Calculus",
        highlight: "Interactive Teaching",
        rating: 5,
      },
      {
        name: "IM3 Tutoring: Folsom High School",
        designation: "Flexible Scheduling", // Mapped from achievement
        quote:
          "Shanti Swaroop has flexible scheduling and we worked together to find the best days to meet that provide the most benefit for my son. He makes sure that my son is not just working on math when he is in his session but rather, he also asks that my son check in, provides updates and samples of what he is working on.",
        src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Realistic dummy image link
        achievement: "Flexible Scheduling",
        improvement: "Ongoing Support",
        subject: "Mathematics",
        highlight: "Flexible Support",
        rating: 5,
      },
      {
        name: "IM2 Tutoring: Folsom High School",
        designation: "Professional Methodology", // Mapped from achievement
        quote:
          "Shanti Swaroop is a great Tutor! He is very professional and organized in his methodology. You can tell right away that he cares about the students. He provides a game plan for his students. Would definitely recommend him.",
        src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Realistic dummy image link
        achievement: "Professional Methodology",
        improvement: "Strategic Planning",
        subject: "Mathematics",
        highlight: "Professional Approach",
        rating: 5,
      },
      {
        name: "IM1 Tutoring: Folsom High School",
        designation: "Concept Breakdown", // Mapped from achievement
        quote:
          "Shanti has been really good about breaking down the steps of my son's struggles. He provided help with preparing for quizzes and tests. He has provided tips and tricks that helped math concepts makes sense that common core just is not accomplishing.",
        src: "https://images.unsplash.com/photo-1623582854588-d60de57fa33f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Realistic dummy image link
        achievement: "Concept Breakdown",
        improvement: "Test Preparation",
        subject: "Mathematics",
        highlight: "Step-by-Step Learning",
        rating: 5,
      },
    ],
    satCoaching: [
      {
        quote: "Increased my SAT score by 300 points! The strategies and practice tests were game-changing.",
        name: "Rachel Martinez",
        designation: "SAT Score: 1520",
        src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
      {
        quote: "The SAT prep course was comprehensive and well-structured. I felt completely prepared on test day.",
        name: "James Thompson",
        designation: "SAT Score: 1480",
        src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
      {
        quote:
          "The personalized study plan and expert guidance helped me achieve my target score. Couldn't be happier!",
        name: "Aisha Patel",
        designation: "SAT Score: 1550",
        src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
      {
        quote:
          "From 1200 to 1450 in just 3 months! The instructors know exactly how to tackle each section effectively.",
        name: "Tyler Rodriguez",
        designation: "SAT Score: 1450",
        src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
      {
        quote: "The mock tests and detailed feedback prepared me perfectly. I exceeded my own expectations!",
        name: "Lily Wang",
        designation: "SAT Score: 1500",
        src: "https://images.unsplash.com/photo-1623582854588-d60de57fa33f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
    ],
    collegePrep: [
      {
        quote: "The college prep program helped me get into my dream school! The essay guidance was invaluable.",
        name: "Michael Chang",
        designation: "Admitted to Stanford University",
        src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
      {
        quote:
          "From application strategy to interview prep, they covered everything. I got into 8 out of 10 colleges I applied to!",
        name: "Isabella Garcia",
        designation: "Admitted to MIT",
        src: "https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
      {
        quote:
          "The college counselors helped me discover schools I never would have considered. Found the perfect fit!",
        name: "Kevin Lee",
        designation: "Admitted to UC Berkeley",
        src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
      {
        quote: "The scholarship guidance alone saved my family thousands of dollars. Plus, I got into my top choice!",
        name: "Zoe Anderson",
        designation: "Admitted to Harvard University",
        src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
      {
        quote:
          "They helped me craft a compelling narrative that showcased my unique strengths. The results speak for themselves!",
        name: "Nathan Kim",
        designation: "Admitted to Princeton University",
        src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
    ],
    researchProgram: [
      {
        quote:
          "The research program opened doors I never knew existed. I'm now published and heading to graduate school!",
        name: "Sarah Mitchell",
        designation: "Published Researcher",
        src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
      {
        quote: "Working with PhD mentors gave me real research experience. My project won the state science fair!",
        name: "Daniel Foster",
        designation: "State Science Fair Winner",
        src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
      {
        quote: "The research program taught me critical thinking and methodology that I use in all my studies now.",
        name: "Maya Patel",
        designation: "Research Intern at Johns Hopkins",
        src: "https://images.unsplash.com/photo-1623582854588-d60de57fa33f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
      {
        quote: "I discovered my passion for biomedical research through this program. Now I'm pre-med at Yale!",
        name: "Carlos Mendoza",
        designation: "Pre-Med Student at Yale",
        src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
      {
        quote: "The hands-on research experience and mentorship were invaluable. I'm now pursuing a PhD in physics!",
        name: "Grace Liu",
        designation: "PhD Candidate at Caltech",
        src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
    ],
    mathCompetition: [
      {
        quote: "Qualified for USAMO after training here! The problem-solving techniques are incredibly effective.",
        name: "Andrew Zhou",
        designation: "USAMO Qualifier",
        src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
      {
        quote: "Won first place at the state math competition! The coaches here are absolutely phenomenal.",
        name: "Priya Sharma",
        designation: "State Math Champion",
        src: "https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
      {
        quote:
          "From struggling with algebra to competing nationally in math contests. The transformation was incredible!",
        name: "Jordan Taylor",
        designation: "National Math Competitor",
        src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
      {
        quote: "The AMC preparation was thorough and challenging. I improved my score by over 50 points!",
        name: "Elena Volkov",
        designation: "AMC 12 High Scorer",
        src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
      {
        quote: "Made it to the Math Olympiad team thanks to the expert coaching and rigorous practice sessions here!",
        name: "Ryan O'Connor",
        designation: "Math Olympiad Team Member",
        src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
    ],
  }

  return <AnimatedTestimonials sections={sections}/>
}
