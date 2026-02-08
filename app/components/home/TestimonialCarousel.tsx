// "use client"

// import * as React from "react"
// import { useEffect, useState } from "react"
// import Image from "next/image"
// import { motion } from "framer-motion"
// import { Star, Quote } from "lucide-react"

// // Fallback static testimonials
// const fallbackTestimonials = [
//   // Academic Tutoring (3 testimonials)
//   {
//     name: "Pragna",
//     designation: "Physics: 95% | Math: B's to A's",
//     school: "Raleigh Charter High School",
//     quote: "ACHARYA Educational Services has significantly improved my academic performance in both physics and math. With their guidance, I achieved a 95 on my physics midterm and raised my math test scores from low B's to consistent A's.",
//     src: "/testimonial-logos/Raleigh_Charter__NC__Phoenix_logo.png.webp",
//     program: "Academic Tutoring",
//     rating: 5,
//   },
//   // {
//   //   name: "Adwitha",
//   //   designation: "Math Grade: D to A",
//   //   school: "West Park High School",
//   //   quote: "ACHARYA Educational Services has great tutors who have helped me improve in math a lot. I went from a D to an A this year. Math is now easier than before when I was struggling everything finally clicked.",
//   //   src: "/testimonial-logos/WestParkHighSchool.png",
//   //   program: "Academic Tutoring",
//   //   rating: 5,
//   // },
//   // {
//   //   name: "Lalit Pinisetti",
//   //   designation: "Personalized Learning Success",
//   //   school: "Folsom High School",
//   //   quote: "The tutor is strict with students when he needs to be strict, and gentle with students when he needs to be gentle. He truly understands what each student is capable of and motivates each student precisely enough for their highest chances of success.",
//   //   src: "/testimonial-logos/folsom.png",
//   //   program: "Academic Tutoring",
//   //   rating: 5,
//   // },
  
//   // // AES Explorers - Research (2 testimonials)
//   // {
//   //   name: "Sarah Chen",
//   //   designation: "Research Publication",
//   //   school: "UC Davis",
//   //   quote: "The research program at ACHARYA helped me develop critical thinking skills and guided me through my first research publication. The mentors are incredibly knowledgeable and supportive throughout the entire process.",
//   //   src: "/testimonial-logos/folsom.png",
//   //   program: "AES Explorers",
//   //   rating: 5,
//   // },
//   // {
//   //   name: "Michael Rodriguez",
//   //   designation: "Conference Presentation",
//   //   school: "Stanford University",
//   //   quote: "Working with ACHARYA's research program gave me the confidence to present my findings at a national conference. The guidance on research methodology and presentation skills was invaluable.",
//   //   src: "/testimonial-logos/folsom.png",
//   //   program: "AES Explorers",
//   //   rating: 5,
//   // },
  
//   // // AES Champions - Math Competitions (2 testimonials)
//   // {
//   //   name: "Alex Kim",
//   //   designation: "AMC 12 Qualifier",
//   //   school: "Granite Bay High School",
//   //   quote: "The math competition training at ACHARYA transformed my problem-solving approach. I qualified for AIME for the first time and improved my AMC scores significantly through their systematic training methods.",
//   //   src: "/testimonial-logos/GraniteBayHighSchool.png",
//   //   program: "AES Champions",
//   //   rating: 5,
//   // },
//   // {
//   //   name: "Emma Thompson",
//   //   designation: "Math Olympiad Success",
//   //   school: "Vista del Lago High School",
//   //   quote: "The competition preparation program helped me develop advanced mathematical thinking. The tutors provided challenging problems and clear explanations that built my confidence for high-level competitions.",
//   //   src: "/testimonial-logos/VistaDelLagoHS-GraphicsTransparent.png",
//   //   program: "AES Champions",
//   //   rating: 5,
//   // },
  
//   // // UAchieve - College Prep (3 testimonials)
//   // {
//   //   name: "Jessica Park",
//   //   designation: "UC Berkeley Admit",
//   //   school: "Folsom High School",
//   //   quote: "ACHARYA's college prep program helped me craft compelling essays and build a strong profile. The personalized guidance throughout the application process was crucial to my acceptance at UC Berkeley.",
//   //   src: "/testimonial-logos/folsom.png",
//   //   program: "UAchieve",
//   //   rating: 5,
//   // },
//   // {
//   //   name: "David Liu",
//   //   designation: "Stanford Admit",
//   //   school: "Granite Bay High School",
//   //   quote: "The college counseling at ACHARYA was exceptional. They helped me identify my strengths, develop a compelling narrative, and navigate the complex application process. I couldn't have done it without their support.",
//   //   src: "/testimonial-logos/GraniteBayHighSchool.png",
//   //   program: "UAchieve",
//   //   rating: 5,
//   // },
//   // {
//   //   name: "Maya Patel",
//   //   designation: "MIT Admit",
//   //   school: "Raleigh Charter High School",
//   //   quote: "ACHARYA's college prep program provided comprehensive support from profile building to essay writing. Their strategic approach and attention to detail made all the difference in my MIT application.",
//   //   src: "/testimonial-logos/Raleigh_Charter__NC__Phoenix_logo.png.webp",
//   //   program: "UAchieve",
//   //   rating: 5,
//   // },
// ]

// // Helper function to map program names
// const mapProgramName = (programs?: string[]): string => {
//   if (!programs || programs.length === 0) return "Student Program";
  
//   const program = programs[0].toLowerCase();
//   if (program.includes('tutor') || program.includes('academic')) return "Academic Tutoring";
//   if (program.includes('sat') || program.includes('coaching')) return "SAT Coaching";
//   if (program.includes('college') || program.includes('uachieve')) return "UAchieve";
//   if (program.includes('research') || program.includes('explorer')) return "AES Explorers";
//   if (program.includes('math') || program.includes('champion') || program.includes('competition')) return "AES Champions";
  
//   return programs[0];
// };

// // Helper function to get school logo
// const getSchoolLogo = (schoolName?: string): string => {
//   if (!schoolName) return "/testimonial-logos/folsom.png";
  
//   const school = schoolName.toLowerCase();
//   if (school.includes("raleigh charter")) return "/testimonial-logos/Raleigh_Charter__NC__Phoenix_logo.png.webp";
//   if (school.includes("west park")) return "/testimonial-logos/WestParkHighSchool.png";
//   if (school.includes("granite bay")) return "/testimonial-logos/GraniteBayHighSchool.png";
//   if (school.includes("vista del lago")) return "/testimonial-logos/VistaDelLagoHS-GraphicsTransparent.png";
//   if (school.includes("folsom") || school.includes("sutter")) return "/testimonial-logos/folsom.png";
//   if (school.includes("uc davis") || school.includes("davis")) return "/testimonial-logos/folsom.png";
//   if (school.includes("stanford")) return "/testimonial-logos/folsom.png";
//   if (school.includes("berkeley")) return "/testimonial-logos/folsom.png";
  
//   return "/testimonial-logos/folsom.png";
// };

// // Transform database testimonial to carousel format - only use approved fields
// // const transformTestimonial = (dbTestimonial: any) => {
// //   // Only use fields that are actually present in the response (API already filtered by approval)
// //   const testimonial: any = {
// //     name: dbTestimonial.studentName || dbTestimonial.authorName || "Student",
// //     school: dbTestimonial.school || "School",
// //     src: getSchoolLogo(dbTestimonial.school),
// //   };

// //   // Use successStory if available and approved, otherwise use grade
// //   if (dbTestimonial.successStory) {
// //     testimonial.designation = dbTestimonial.successStory;
// //   } else if (dbTestimonial.grade) {
// //     testimonial.designation = dbTestimonial.grade;
// //   } else {
// //     testimonial.designation = "Student";
// //   }

// //   // Use content if approved, otherwise use experienceDescription
// //   if (dbTestimonial.content) {
// //     testimonial.quote = dbTestimonial.content;
// //   } else if (dbTestimonial.experienceDescription) {
// //     testimonial.quote = dbTestimonial.experienceDescription;
// //   } else {
// //     testimonial.quote = "";
// //   }

// //   // Only include program if approved (API filters this)
// //   if (dbTestimonial.programs) {
// //     testimonial.program = mapProgramName(dbTestimonial.programs);
// //   } else {
// //     testimonial.program = "Student Program";
// //   }

// //   // Only include rating if approved (API filters this)
// //   if (dbTestimonial.rating) {
// //     testimonial.rating = dbTestimonial.rating;
// //   } else {
// //     testimonial.rating = 5; // default
// //   }

// //   return testimonial;
// // };
// const transformTestimonial = (dbTestimonial: any) => {
//   return {
//     name: dbTestimonial.studentName || "Student",
//     school: dbTestimonial.school || "School",
//     src: getSchoolLogo(dbTestimonial.school),

//     designation: dbTestimonial.grade || "Student",

//     quote:
//       dbTestimonial.content ||
//       dbTestimonial.experienceDescription ||
//       "",

//     program: dbTestimonial.program || "Student Program",

//     rating: dbTestimonial.rating || 5,
//   };
// };

// export function TestimonialCarousel() {
//   const [testimonials, setTestimonials] = useState(fallbackTestimonials);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchTestimonials = async () => {
//       try {
//         const response = await fetch("/api/testimonials");
//         const data = await response.json();
        
//         if (data.success && data.testimonials && data.testimonials.length > 0) {
//           // Filter testimonials that have approved content to display
//           const transformed = data.testimonials
//             .filter((t: any) => {
//               // Only include if has content (API already checked contentApproved)
//               return t.content || t.experienceDescription;
//             })
//             .map(transformTestimonial);
          
//           console.log('Fetched testimonials from API:', transformed.length);
          
//           if (transformed.length > 0) {
//             setTestimonials(transformed);
//           } else {
//             console.log('No testimonials with approved content, using fallback');
//           }
//         } else {
//           console.log('API returned no testimonials, using fallback');
//         }
//       } catch (error) {
//         console.error("Error fetching testimonials:", error);
//         // Keep fallback testimonials on error
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTestimonials();
//   }, []);

//   // Duplicate the array to create seamless infinite scroll
//   const duplicatedTestimonials = [...testimonials, ...testimonials]

//   return (
//     <section className="py-12 sm:py-16 lg:py-20 theme-bg-dark relative overflow-hidden">
//       {/* Enhanced Background Elements */}
//       {/* <div className="absolute inset-0 overflow-hidden"> */}
//       <div className="absolute inset-0 overflow-hidden">
//         <div className="absolute top-32 right-10 w-24 h-24 bg-blue-400 rounded-full opacity-5 animate-float-reverse"></div>
//         <div className="absolute bottom-32 left-20 w-20 h-20 bg-purple-400 rounded-full opacity-5 animate-float"></div>
//         <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-green-400 rounded-full opacity-5 animate-float-reverse"></div>
//       </div>
//       {/* </div> */}
      
//       {/* Gradient Overlay */}
//       {/* <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-amber-500/10"></div> */}

//       {/* <div className="container mx-auto px-6 relative z-10"> */}
//         {/* Section Header */}
//         <div className="text-center mb-12">
//           <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold theme-text-light leading-tight mb-4">
//             What Our Students 
//             <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500">
//               {" "}Say
//             </span>
//           </h2>
//           <p className="text-base sm:text-lg lg:text-xl theme-text-muted leading-relaxed max-w-3xl mx-auto">
//             Real stories from students across all our programs
//           </p>
//         </div>

//         {/* Infinite Carousel */}
//         <div className="relative overflow-hidden group py-16">
//           <div className="flex animate-scroll-reverse group-hover:pause-animation">
//             {duplicatedTestimonials.map((testimonial, index) => (
//               <div
//                 key={`${testimonial.name}-${index}`}
//                 className="flex-shrink-0 mx-4 md:mx-6 flex items-center justify-center"
//               >
//                   <motion.div
//                     initial={{ opacity: 0, y: 20 }}
//                     whileInView={{ opacity: 1, y: 0 }}
//                     transition={{ duration: 0.6 }}
//                     className="w-80 md:w-96 h-[400px] bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-yellow-400 transition-all duration-300 hover:bg-slate-750 relative shadow-lg hover:shadow-xl flex flex-col"
//                   >
//                   {/* Student Avatar at Top */}
//                   <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
//                     <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-yellow-400 shadow-lg">
//                       <Image
//                         src={testimonial.src}
//                         alt={testimonial.name}
//                         width={96}
//                         height={96}
//                         className="w-full h-full object-cover"
//                       />
//                     </div>
//                   </div>

//                   {/* Card Content */}
//                   <div className="flex flex-col h-full justify-between">
//                     {/* Program Badge */}
//                     <div className="mt-12 mb-4">
//                       <span className="inline-block px-3 py-1 text-xs font-medium bg-yellow-400 text-slate-900 rounded-full border border-yellow-400">
//                         {testimonial.program}
//                       </span>
//                     </div>

//                     {/* Quote */}
//                     <div className="flex-1 flex items-center mb-6">
//                       <p className="text-slate-200 text-sm leading-relaxed italic text-center">
//                         &quot;{testimonial.quote}&quot;
//                       </p>
//                     </div>

//                     {/* Rating */}
//                     <div className="flex items-center justify-center mb-4">
//                       {[...Array(testimonial.rating)].map((_, i) => (
//                         <Star key={i} className="w-4 h-4 text-yellow-400 fill-current mx-0.5" />
//                       ))}
//                     </div>

//                     {/* Student Info */}
//                     <div className="text-center">
//                       <h4 className="text-white font-semibold text-sm">{testimonial.name}</h4>
//                       <p className="text-yellow-400 text-xs font-medium">{testimonial.designation}</p>
//                       <p className="text-slate-400 text-xs">{testimonial.school}</p>
//                     </div>
//                   </div>
//                 </motion.div>
//               </div>
//             ))}
//           </div>
//         </div>
//       {/* </div> */}
//     </section>
//   )
// }

// export default TestimonialCarousel
// "use client"

// import * as React from "react"
// import { useEffect, useState } from "react"
// import Image from "next/image"
// import { motion } from "framer-motion"
// import { Star } from "lucide-react"

// /* ------------------------------------------------------------------ */
// /* Types */
// /* ------------------------------------------------------------------ */

// interface Testimonial {
//   name: string
//   school: string
//   src: string
//   designation: string
//   programs: string[]
//   successStory?: string
//   beforeAfter?: string
//   content?: string
//   rating?: number
// }

// /* ------------------------------------------------------------------ */
// /* Fallback testimonials (safe minimal) */
// /* ------------------------------------------------------------------ */

// const fallbackTestimonials: Testimonial[] = [
//   {
//     name: "Pragna",
//     designation: "Physics: 95% | Math: B's to A's",
//     school: "Raleigh Charter High School",
//     src: "/testimonial-logos/Raleigh_Charter__NC__Phoenix_logo.png.webp",
//     programs: ["Academic Tutoring"],
//     content:
//       "ACHARYA Educational Services has significantly improved my academic performance in both physics and math.",
//     rating: 5,
//   },
// ]

// /* ------------------------------------------------------------------ */
// /* Helpers */
// /* ------------------------------------------------------------------ */

// const getSchoolLogo = (schoolName?: string): string => {
//   if (!schoolName) return "/testimonial-logos/folsom.png"

//   const school = schoolName.toLowerCase()
//   if (school.includes("raleigh charter"))
//     return "/testimonial-logos/Raleigh_Charter__NC__Phoenix_logo.png.webp"
//   if (school.includes("west park"))
//     return "/testimonial-logos/WestParkHighSchool.png"
//   if (school.includes("granite bay"))
//     return "/testimonial-logos/GraniteBayHighSchool.png"
//   if (school.includes("vista del lago"))
//     return "/testimonial-logos/VistaDelLagoHS-GraphicsTransparent.png"

//   return "/testimonial-logos/folsom.png"
// }

// const transformTestimonial = (db: any): Testimonial => ({
//   name: db.studentName || "Student",
//   school: db.school || "School",
//   src: getSchoolLogo(db.school),

//   designation: db.grade || "Student",

//   programs: db.programs || [],

//   successStory: db.successStory,
//   beforeAfter: db.beforeAfterExpectations,
//   content: db.content || db.experienceDescription,
//   rating: db.rating,
// })

// /* ------------------------------------------------------------------ */
// /* Component */
// /* ------------------------------------------------------------------ */

// export default function TestimonialCarousel() {
//   const [testimonials, setTestimonials] =
//     useState<Testimonial[]>(fallbackTestimonials)

//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     const fetchTestimonials = async () => {
//       try {
//         const res = await fetch("/api/testimonials")
//         const data = await res.json()

//         if (data.success && Array.isArray(data.testimonials)) {
//           const transformed = data.testimonials
//           .map(transformTestimonial)
//           .filter((t: Testimonial) =>
//             t.successStory ||
//             t.beforeAfter ||
//             t.content ||
//             t.rating
//           )
//           if (transformed.length > 0) {
//             setTestimonials(transformed)
//           }
//         }
//       } catch (err) {
//         console.error("Failed to fetch testimonials:", err)
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchTestimonials()
//   }, [])

//   const duplicatedTestimonials = [...testimonials, ...testimonials]

//   return (
//     <section className="py-16 theme-bg-dark relative overflow-hidden">
//       {/* Header */}
//       <div className="text-center mb-12">
//         <h2 className="text-3xl md:text-5xl font-bold theme-text-light mb-4">
//           What Our Students{" "}
//           <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
//             Say
//           </span>
//         </h2>
//         <p className="theme-text-muted max-w-2xl mx-auto">
//           Real stories from students across our programs
//         </p>
//       </div>

//       {/* Carousel */}
//       <div className="relative overflow-hidden py-16">
//         <div className="flex animate-scroll-reverse">
//           {duplicatedTestimonials.map((t, i) => (
//             <div
//               key={`${t.name}-${i}`}
//               className="flex-shrink-0 mx-6"
//             >
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.5 }}
//                 className="w-80 md:w-96 h-[420px] bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-yellow-400 transition-all flex flex-col"
//               >
//                 {/* Avatar */}
//                 <div className="relative -mt-16 mb-4 flex justify-center">
//                   <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-yellow-400">
//                     <Image
//                       src={t.src}
//                       alt={t.name}
//                       width={96}
//                       height={96}
//                       className="object-cover"
//                     />
//                   </div>
//                 </div>

//                 {/* Programs */}
//                 <div className="flex flex-wrap justify-center gap-2 mb-4">
//                   {t.programs.map((p, idx) => (
//                     <span
//                       key={idx}
//                       className="px-3 py-1 text-xs font-medium bg-yellow-400 text-slate-900 rounded-full"
//                     >
//                       {p}
//                     </span>
//                   ))}
//                 </div>

//                 {/* Sections */}
//                 <div className="flex-1 text-center space-y-3 overflow-hidden">
//                   {t.successStory && (
//                     <p className="text-slate-200 text-sm italic">
//                       “{t.successStory}”
//                     </p>
//                   )}

//                   {t.beforeAfter && (
//                     <p className="text-slate-300 text-xs">
//                       {t.beforeAfter}
//                     </p>
//                   )}

//                   {t.content && (
//                     <p className="text-slate-200 text-sm italic">
//                       “{t.content}”
//                     </p>
//                   )}
//                 </div>

//                 {/* Rating */}
//                 {t.rating && (
//                   <div className="flex justify-center mt-4">
//                     {[...Array(t.rating)].map((_, idx) => (
//                       <Star
//                         key={idx}
//                         className="w-4 h-4 text-yellow-400 fill-current mx-0.5"
//                       />
//                     ))}
//                   </div>
//                 )}

//                 {/* Footer */}
//                 <div className="text-center mt-4">
//                   <h4 className="text-white font-semibold text-sm">
//                     {t.name}
//                   </h4>
//                   <p className="text-yellow-400 text-xs">
//                     {t.designation}
//                   </p>
//                   <p className="text-slate-400 text-xs">
//                     {t.school}
//                   </p>
//                 </div>
//               </motion.div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   )
// }

"use client"

import * as React from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Star } from "lucide-react"
import useSWR from "swr"

/* ------------------------------------------------------------------ */
/* Types */
/* ------------------------------------------------------------------ */

interface Testimonial {
  name: string
  school: string
  src: string
  designation: string
  programs: string[]
  successStory?: string
  beforeAfter?: string
  content?: string
  rating?: number
}

/* ------------------------------------------------------------------ */
/* Skeleton Loader Component */
/* ------------------------------------------------------------------ */

const TestimonialSkeleton = () => (
  <div className="flex-shrink-0 mx-6">
    <div className="w-80 md:w-96 h-[420px] bg-slate-800 rounded-2xl p-6 border border-slate-700 animate-pulse">
      <div className="relative -mt-16 mb-4 flex justify-center">
        <div className="w-24 h-24 rounded-full bg-slate-700" />
      </div>

      <div className="flex justify-center gap-2 mb-4">
        <div className="h-6 w-24 bg-slate-700 rounded-full" />
      </div>

      <div className="space-y-3">
        <div className="h-4 bg-slate-700 rounded w-full" />
        <div className="h-4 bg-slate-700 rounded w-5/6" />
        <div className="h-4 bg-slate-700 rounded w-4/6" />
      </div>

      <div className="flex justify-center gap-1 mt-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-4 h-4 bg-slate-700 rounded" />
        ))}
      </div>

      <div className="text-center mt-4 space-y-2">
        <div className="h-4 bg-slate-700 rounded w-32 mx-auto" />
        <div className="h-3 bg-slate-700 rounded w-40 mx-auto" />
        <div className="h-3 bg-slate-700 rounded w-36 mx-auto" />
      </div>
    </div>
  </div>
)

/* ------------------------------------------------------------------ */
/* Helpers */
/* ------------------------------------------------------------------ */

const getSchoolLogo = (schoolName?: string): string => {
  if (!schoolName) return "/testimonial-logos/folsom.png"

  const school = schoolName.toLowerCase()
  if (school.includes("raleigh charter"))
    return "/testimonial-logos/Raleigh_Charter__NC__Phoenix_logo.png.webp"
  if (school.includes("west park"))
    return "/testimonial-logos/WestParkHighSchool.png"
  if (school.includes("granite bay"))
    return "/testimonial-logos/GraniteBayHighSchool.png"
  if (school.includes("vista del lago"))
    return "/testimonial-logos/VistaDelLagoHS-GraphicsTransparent.png"

  return "/testimonial-logos/folsom.png"
}

const transformTestimonial = (db: any): Testimonial => ({
  name: db.studentName || "Student",
  school: db.school || "School",
  src: getSchoolLogo(db.school),
  designation: db.grade || "Student",
  programs: db.programs || [],
  successStory: db.successStory,
  beforeAfter: db.beforeAfterExpectations,
  content: db.content || db.experienceDescription,
  rating: db.rating,
})

const fetcher = (url: string) => fetch(url).then((res) => res.json())

/* ------------------------------------------------------------------ */
/* Component */
/* ------------------------------------------------------------------ */

export default function TestimonialCarousel() {
  const { data, error, isLoading } = useSWR<{
    success: boolean
    testimonials: any[]
  }>("/api/testimonials", fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: true,
    dedupingInterval: 60000,
  })

  const testimonials = React.useMemo<Testimonial[]>(() => {
    if (!data?.testimonials) return []

    return data.testimonials
      .map(transformTestimonial)
      .filter(
        (t: Testimonial) =>
          t.successStory || t.beforeAfter || t.content || t.rating
      )
  }, [data])

  const duplicatedTestimonials =
    testimonials.length > 0
      ? [...testimonials, ...testimonials]
      : []

  /* ---------------- Empty State ---------------- */

  if (!isLoading && testimonials.length === 0) {
    return (
      <section className="py-16 theme-bg-dark text-center">
        <h2 className="text-3xl md:text-5xl font-bold theme-text-light mb-4">
          What Our Students{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            Say
          </span>
        </h2>
        <p className="theme-text-muted">
          Testimonials will appear here once they are approved.
        </p>
      </section>
    )
  }

  /* ---------------- Main Render ---------------- */

  return (
    <section className="py-16 theme-bg-dark relative overflow-hidden">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-bold theme-text-light mb-4">
          What Our Students{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            Say
          </span>
        </h2>
        <p className="theme-text-muted max-w-2xl mx-auto">
          Real stories from students across our programs
        </p>
      </div>

      {/* Carousel */}
      <div className="relative overflow-hidden py-16">
        {isLoading ? (
          <div className="flex animate-scroll-reverse">
            {[...Array(6)].map((_, i) => (
              <TestimonialSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="flex animate-scroll-reverse">
            {duplicatedTestimonials.map((t, i) => (
              <div key={`${t.name}-${i}`} className="flex-shrink-0 mx-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-80 md:w-96 h-[420px] bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-yellow-400 transition-all flex flex-col"
                >
                  {/* Avatar */}
                  <div className="relative -mt-16 mb-4 flex justify-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-yellow-400">
                      <Image
                        src={t.src}
                        alt={t.name}
                        width={96}
                        height={96}
                        className="object-cover"
                      />
                    </div>
                  </div>

                  {/* Programs */}
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    {t.programs.map((p, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 text-xs font-medium bg-yellow-400 text-slate-900 rounded-full"
                      >
                        {p}
                      </span>
                    ))}
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-center space-y-3 overflow-hidden">
                    {t.successStory && (
                      <p className="text-slate-200 text-sm italic">
                        &quot;{t.successStory}&quot;
                      </p>
                    )}

                    {t.beforeAfter && (
                      <p className="text-slate-300 text-xs">{t.beforeAfter}</p>
                    )}

                    {t.content && (
                      <p className="text-slate-200 text-sm italic">
                        &quot;{t.content}&quot;
                      </p>
                    )}
                  </div>

                  {/* Rating */}
                  {t.rating && (
                    <div className="flex justify-center mt-4">
                      {[...Array(t.rating)].map((_, idx) => (
                        <Star
                          key={idx}
                          className="w-4 h-4 text-yellow-400 fill-current mx-0.5"
                        />
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="text-center mt-4">
                    <h4 className="text-white font-semibold text-sm">
                      {t.name}
                    </h4>
                    <p className="text-yellow-400 text-xs">{t.designation}</p>
                    <p className="text-slate-400 text-xs">{t.school}</p>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
