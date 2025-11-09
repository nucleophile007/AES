"use client"

import * as React from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Star, Quote } from "lucide-react"

const testimonials = [
  // Academic Tutoring (3 testimonials)
  {
    name: "Pragna",
    designation: "Physics: 95% | Math: B's to A's",
    school: "Raleigh Charter High School",
    quote: "ACHARYA Educational Services has significantly improved my academic performance in both physics and math. With their guidance, I achieved a 95 on my physics midterm and raised my math test scores from low B's to consistent A's.",
    src: "/testimonial-logos/Raleigh_Charter__NC__Phoenix_logo.png.webp",
    program: "Academic Tutoring",
    rating: 5,
  },
  {
    name: "Adwitha",
    designation: "Math Grade: D to A",
    school: "West Park High School",
    quote: "ACHARYA Educational Services has great tutors who have helped me improve in math a lot. I went from a D to an A this year. Math is now easier than before when I was struggling everything finally clicked.",
    src: "/testimonial-logos/WestParkHighSchool.png",
    program: "Academic Tutoring",
    rating: 5,
  },
  {
    name: "Lalit Pinisetti",
    designation: "Personalized Learning Success",
    school: "Folsom High School",
    quote: "The tutor is strict with students when he needs to be strict, and gentle with students when he needs to be gentle. He truly understands what each student is capable of and motivates each student precisely enough for their highest chances of success.",
    src: "/testimonial-logos/folsom.png",
    program: "Academic Tutoring",
    rating: 5,
  },
  
  // AES Explorers - Research (2 testimonials)
  {
    name: "Sarah Chen",
    designation: "Research Publication",
    school: "UC Davis",
    quote: "The research program at ACHARYA helped me develop critical thinking skills and guided me through my first research publication. The mentors are incredibly knowledgeable and supportive throughout the entire process.",
    src: "/testimonial-logos/folsom.png",
    program: "AES Explorers",
    rating: 5,
  },
  {
    name: "Michael Rodriguez",
    designation: "Conference Presentation",
    school: "Stanford University",
    quote: "Working with ACHARYA's research program gave me the confidence to present my findings at a national conference. The guidance on research methodology and presentation skills was invaluable.",
    src: "/testimonial-logos/folsom.png",
    program: "AES Explorers",
    rating: 5,
  },
  
  // AES Champions - Math Competitions (2 testimonials)
  {
    name: "Alex Kim",
    designation: "AMC 12 Qualifier",
    school: "Granite Bay High School",
    quote: "The math competition training at ACHARYA transformed my problem-solving approach. I qualified for AIME for the first time and improved my AMC scores significantly through their systematic training methods.",
    src: "/testimonial-logos/GraniteBayHighSchool.png",
    program: "AES Champions",
    rating: 5,
  },
  {
    name: "Emma Thompson",
    designation: "Math Olympiad Success",
    school: "Vista del Lago High School",
    quote: "The competition preparation program helped me develop advanced mathematical thinking. The tutors provided challenging problems and clear explanations that built my confidence for high-level competitions.",
    src: "/testimonial-logos/VistaDelLagoHS-GraphicsTransparent.png",
    program: "AES Champions",
    rating: 5,
  },
  
  // UAchieve - College Prep (3 testimonials)
  {
    name: "Jessica Park",
    designation: "UC Berkeley Admit",
    school: "Folsom High School",
    quote: "ACHARYA's college prep program helped me craft compelling essays and build a strong profile. The personalized guidance throughout the application process was crucial to my acceptance at UC Berkeley.",
    src: "/testimonial-logos/folsom.png",
    program: "UAchieve",
    rating: 5,
  },
  {
    name: "David Liu",
    designation: "Stanford Admit",
    school: "Granite Bay High School",
    quote: "The college counseling at ACHARYA was exceptional. They helped me identify my strengths, develop a compelling narrative, and navigate the complex application process. I couldn't have done it without their support.",
    src: "/testimonial-logos/GraniteBayHighSchool.png",
    program: "UAchieve",
    rating: 5,
  },
  {
    name: "Maya Patel",
    designation: "MIT Admit",
    school: "Raleigh Charter High School",
    quote: "ACHARYA's college prep program provided comprehensive support from profile building to essay writing. Their strategic approach and attention to detail made all the difference in my MIT application.",
    src: "/testimonial-logos/Raleigh_Charter__NC__Phoenix_logo.png.webp",
    program: "UAchieve",
    rating: 5,
  },
]

export function TestimonialCarousel() {
  // Duplicate the array to create seamless infinite scroll
  const duplicatedTestimonials = [...testimonials, ...testimonials]

  return (
    <section className="py-12 sm:py-16 lg:py-20 theme-bg-dark relative overflow-hidden">
      {/* Enhanced Background Elements */}
      {/* <div className="absolute inset-0 overflow-hidden"> */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-32 right-10 w-24 h-24 bg-blue-400 rounded-full opacity-5 animate-float-reverse"></div>
        <div className="absolute bottom-32 left-20 w-20 h-20 bg-purple-400 rounded-full opacity-5 animate-float"></div>
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-green-400 rounded-full opacity-5 animate-float-reverse"></div>
      </div>
      {/* </div> */}
      
      {/* Gradient Overlay */}
      {/* <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-amber-500/10"></div> */}

      {/* <div className="container mx-auto px-6 relative z-10"> */}
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold theme-text-light leading-tight mb-4">
            What Our Students 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500">
              {" "}Say
            </span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl theme-text-muted leading-relaxed max-w-3xl mx-auto">
            Real stories from students across all our programs
          </p>
        </div>

        {/* Infinite Carousel */}
        <div className="relative overflow-hidden group py-16">
          <div className="flex animate-scroll-reverse group-hover:pause-animation">
            {duplicatedTestimonials.map((testimonial, index) => (
              <div
                key={`${testimonial.name}-${index}`}
                className="flex-shrink-0 mx-4 md:mx-6 flex items-center justify-center"
              >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-80 md:w-96 h-[400px] bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-yellow-400 transition-all duration-300 hover:bg-slate-750 relative shadow-lg hover:shadow-xl flex flex-col"
                  >
                  {/* Student Avatar at Top */}
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-yellow-400 shadow-lg">
                      <Image
                        src={testimonial.src}
                        alt={testimonial.name}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="flex flex-col h-full justify-between">
                    {/* Program Badge */}
                    <div className="mt-12 mb-4">
                      <span className="inline-block px-3 py-1 text-xs font-medium bg-yellow-400 text-slate-900 rounded-full border border-yellow-400">
                        {testimonial.program}
                      </span>
                    </div>

                    {/* Quote */}
                    <div className="flex-1 flex items-center mb-6">
                      <p className="text-slate-200 text-sm leading-relaxed italic text-center">
                        &quot;{testimonial.quote}&quot;
                      </p>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center justify-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current mx-0.5" />
                      ))}
                    </div>

                    {/* Student Info */}
                    <div className="text-center">
                      <h4 className="text-white font-semibold text-sm">{testimonial.name}</h4>
                      <p className="text-yellow-400 text-xs font-medium">{testimonial.designation}</p>
                      <p className="text-slate-400 text-xs">{testimonial.school}</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      {/* </div> */}
    </section>
  )
}

export default TestimonialCarousel
