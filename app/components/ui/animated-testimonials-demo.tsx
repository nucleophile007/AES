import { AnimatedTestimonials } from "@/components/ui/animated-testimonial2"

// Helper function to generate initials from name
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2); // Take max 2 initials
}

export default function AnimatedTestimonialsDemo() {
  const sections = {
    tutoring: [
      {
        name: "Pragna",
        designation: "Physics: 95% | Math: B's to A's", // Mapped from achievement
        quote:
          "ACHARYA Educational Services has significantly improved my academic performance in both physics and math. With their guidance, I achieved a 95 on my physics midterm and raised my math test scores from low B's to consistent A's. The tutors are knowledgeable, clear in their explanations, and genuinely committed to student success.",
        initials: getInitials("Pragna"),
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
        initials: getInitials("Adwitha"),
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
        initials: getInitials("Lalit Pinisetti"),
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
        initials: getInitials("Ruhee"),
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
        initials: getInitials("Rishitha"),
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
        initials: getInitials("Sloane Stenson"),
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
        initials: getInitials("Geetika"),
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
        initials: getInitials("IM1 Tutoring: Sutter Middle School"),
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
        initials: getInitials("Pre-Calc Tutoring: Folsom High School"),
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
        initials: getInitials("IM3 Tutoring: Folsom High School"),
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
        initials: getInitials("IM2 Tutoring: Folsom High School"),
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
        initials: getInitials("IM1 Tutoring: Folsom High School"),
        achievement: "Concept Breakdown",
        improvement: "Test Preparation",
        subject: "Mathematics",
        highlight: "Step-by-Step Learning",
        rating: 5,
      },
    ],
    satCoaching: [
      {
        quote: "Coming Soon! Our comprehensive SAT coaching program will help you achieve your target scores with proven strategies and personalized guidance.",
        name: "Coming Soon",
        designation: "SAT Coaching Program",
        initials: "CS",
      },
    ],
    collegePrep: [
      {
        quote: "Shanti helped my daughter with college essay writing and application strategy. His coaching helped identify her strengths and achievements in the correct format. He maintains different strategies for each college and provides excellent guidance throughout the process.",
        name: "Srinivas Eerpina",
        designation: "Parent of High School Senior",
        initials: getInitials("Srinivas Eerpina"),
      },
      {
        quote: "Working with Shanti for half a year has been transformative. He helped with everything from volunteering guidance to course selection for the next 4 years. His insights on career matters and big picture ambitions are invaluable.",
        name: "Athreya",
        designation: "High School Student",
        initials: getInitials("Athreya"),
      },
      {
        quote: "Dr. Shanti Swaroop's guidance was essential to understanding the college application process. His patience and constant encouragement helped us narrow down potential universities based on my major and make my application stand out.",
        name: "Sahasra",
        designation: "College Applicant",
        initials: getInitials("Sahasra"),
      },
    ],
    researchProgram: [
      {
        quote: "Coming Soon! Our advanced research program will connect students with PhD mentors for hands-on research experience and scientific discovery.",
        name: "Coming Soon",
        designation: "Research Program",
        initials: "CS",
      },
    ],
    mathCompetition: [
      {
        quote: "Coming Soon! Our math competition training will prepare students for AMC, USAMO, and other prestigious mathematics competitions.",
        name: "Coming Soon",
        designation: "Math Competition Training",
        initials: "CS",
      },
    ],
  }

  return <AnimatedTestimonials sections={sections}/>
}
