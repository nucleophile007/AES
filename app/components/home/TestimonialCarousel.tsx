"use client"

import * as React from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Star } from "lucide-react"
import useSWR from "swr"

/* ------------------------------------------------------------------ */
/* Types */
/* ------------------------------------------------------------------ */

interface ParentTestimonial {
  id: string
  name: string
  school: string
  src: string
  designation: string
  programs: string[]
  childExperience?: string
  successStory?: string
  overallExperience?: string
  rating?: number
}

/* ------------------------------------------------------------------ */
/* Skeleton Loader */
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

const fetcher = (url: string) => fetch(url).then((res) => res.json())

/* ------------------------------------------------------------------ */
/* Component */
/* ------------------------------------------------------------------ */

export default function ParentTestimonialCarousel() {
  const { data, isLoading } = useSWR<{
    success: boolean
    testimonials: ParentTestimonial[]
  }>("/api/testimonials/parent-testimonials", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  })

  const testimonials = React.useMemo<ParentTestimonial[]>(() => {
    if (!data?.testimonials) return []

    return data.testimonials.filter(
      (t) => t.childExperience || t.successStory || t.overallExperience || t.rating
    )
  }, [data])

  const duplicatedTestimonials =
    testimonials.length > 0
      ? [...testimonials, ...testimonials, ...testimonials, ...testimonials]
      : []

  /* ---------------- Empty State ---------------- */

  if (!isLoading && testimonials.length === 0) {
    return (
      <section className="py-16 theme-bg-dark text-center">
        <h2 className="text-3xl md:text-5xl font-bold theme-text-light mb-4">
          What Parents{" "}
          <span className="theme-text-light leading-tight text-blue-400">
            Say About Us
          </span>
        </h2>
        <p className="theme-text-muted">
          Testimonials will appear here once approved.
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
          What Parents{" "}
          <span className="theme-text-light leading-tight text-blue-400">
            Say About Us
          </span>
        </h2>
        <p className="theme-text-muted max-w-2xl mx-auto">
          Honest feedback from parents across our programs
        </p>
      </div>

      {/* Carousel */}
      <div className="relative overflow-hidden group pt-24 pb-8">
        {isLoading ? (
          <div className="flex animate-scroll group-hover:pause-animation">
            {[...Array(12)].map((_, i) => (
              <TestimonialSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="flex animate-scroll group-hover:pause-animation">
            {duplicatedTestimonials.map((t, i) => (
              <div key={`${t.id}-${i}`} className="flex-shrink-0 mx-6">
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
                  {t.programs?.length > 0 && (
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
                  )}

                  {/* Content */}
                  <div className="flex-1 text-center space-y-3 overflow-hidden">
                    {t.childExperience && (
                      <div>
                        
                        <p className="text-slate-200 text-sm italic">
                          &quot;{t.childExperience}&quot;
                        </p>
                      </div>
                    )}
                    
                    {t.successStory && (
                      <div>
                        
                        <p className="text-slate-200 text-sm italic">
                          &quot;{t.successStory}&quot;
                        </p>
                      </div>
                    )}
                    
                    {t.overallExperience && (
                      <div>
                        
                        <p className="text-slate-200 text-sm italic">
                          &quot;{t.overallExperience}&quot;
                        </p>
                      </div>
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
                    <p className="text-yellow-400 text-xs">
                      {t.designation}
                    </p>
                    <p className="text-slate-400 text-xs">
                      {t.school}
                    </p>
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


// "use client"

// import * as React from "react"
// import Image from "next/image"
// import { motion } from "framer-motion"
// import { Star } from "lucide-react"
// import useSWR from "swr"

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
//   // beforeAfter?: string
//   content?: string
//   rating?: number
// }

// /* ------------------------------------------------------------------ */
// /* Skeleton Loader Component */
// /* ------------------------------------------------------------------ */

// const TestimonialSkeleton = () => (
//   <div className="flex-shrink-0 mx-6">
//     <div className="w-80 md:w-96 h-[420px] bg-slate-800 rounded-2xl p-6 border border-slate-700 animate-pulse">
//       <div className="relative -mt-16 mb-4 flex justify-center">
//         <div className="w-24 h-24 rounded-full bg-slate-700" />
//       </div>

//       <div className="flex justify-center gap-2 mb-4">
//         <div className="h-6 w-24 bg-slate-700 rounded-full" />
//       </div>

//       <div className="space-y-3">
//         <div className="h-4 bg-slate-700 rounded w-full" />
//         <div className="h-4 bg-slate-700 rounded w-5/6" />
//         <div className="h-4 bg-slate-700 rounded w-4/6" />
//       </div>

//       <div className="flex justify-center gap-1 mt-6">
//         {[...Array(5)].map((_, i) => (
//           <div key={i} className="w-4 h-4 bg-slate-700 rounded" />
//         ))}
//       </div>

//       <div className="text-center mt-4 space-y-2">
//         <div className="h-4 bg-slate-700 rounded w-32 mx-auto" />
//         <div className="h-3 bg-slate-700 rounded w-40 mx-auto" />
//         <div className="h-3 bg-slate-700 rounded w-36 mx-auto" />
//       </div>
//     </div>
//   </div>
// )

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
//   // beforeAfter: db.beforeAfterExpectations,
//   content: db.content || db.experienceDescription,
//   rating: db.rating,
// })

// const fetcher = (url: string) => fetch(url).then((res) => res.json())

// /* ------------------------------------------------------------------ */
// /* Component */
// /* ------------------------------------------------------------------ */

// export default function TestimonialCarousel() {
//   const { data, error, isLoading } = useSWR<{
//     success: boolean
//     testimonials: any[]
//   }>("/api/testimonials", fetcher, {
//     revalidateOnFocus: false,
//     revalidateIfStale: true,
//     dedupingInterval: 60000,
//   })

//   const testimonials = React.useMemo<Testimonial[]>(() => {
//     if (!data?.testimonials) return []

//     return data.testimonials
//       .map(transformTestimonial)
//       .filter(
//         (t: Testimonial) =>
//           t.successStory || t.content || t.rating
//       )
//   }, [data])

//   const duplicatedTestimonials =
//     testimonials.length > 0
//       ? [...testimonials, ...testimonials]
//       : []

//   /* ---------------- Empty State ---------------- */

//   if (!isLoading && testimonials.length === 0) {
//     return (
//       <section className="py-16 theme-bg-dark text-center">
//         <h2 className="text-3xl md:text-5xl font-bold theme-text-light mb-4">
//           What Our Students{" "}
//           <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
//             Say
//           </span>
//         </h2>
//         <p className="theme-text-muted">
//           Testimonials will appear here once they are approved.
//         </p>
//       </section>
//     )
//   }

//   /* ---------------- Main Render ---------------- */

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
//         {isLoading ? (
//           <div className="flex animate-scroll-reverse">
//             {[...Array(6)].map((_, i) => (
//               <TestimonialSkeleton key={i} />
//             ))}
//           </div>
//         ) : (
//           <div className="flex animate-scroll-reverse">
//             {duplicatedTestimonials.map((t, i) => (
//               <div key={`${t.name}-${i}`} className="flex-shrink-0 mx-6">
//                 <motion.div
//                   initial={{ opacity: 0, y: 20 }}
//                   whileInView={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.5 }}
//                   className="w-80 md:w-96 h-[420px] bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-yellow-400 transition-all flex flex-col"
//                 >
//                   {/* Avatar */}
//                   <div className="relative -mt-16 mb-4 flex justify-center">
//                     <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-yellow-400">
//                       <Image
//                         src={t.src}
//                         alt={t.name}
//                         width={96}
//                         height={96}
//                         className="object-cover"
//                       />
//                     </div>
//                   </div>

//                   {/* Programs */}
//                   <div className="flex flex-wrap justify-center gap-2 mb-4">
//                     {t.programs.map((p, idx) => (
//                       <span
//                         key={idx}
//                         className="px-3 py-1 text-xs font-medium bg-yellow-400 text-slate-900 rounded-full"
//                       >
//                         {p}
//                       </span>
//                     ))}
//                   </div>

//                   {/* Content */}
//                   <div className="flex-1 text-center space-y-3 overflow-hidden">
//                     {t.successStory && (
//                       <p className="text-slate-200 text-sm italic">
//                         &quot;{t.successStory}&quot;
//                       </p>
//                     )}

//                     {/* {t.beforeAfter && (
//                       <p className="text-slate-300 text-xs">{t.beforeAfter}</p>
//                     )} */}

//                     {t.content && (
//                       <p className="text-slate-200 text-sm italic">
//                         &quot;{t.content}&quot;
//                       </p>
//                     )}
//                   </div>

//                   {/* Rating */}
//                   {t.rating && (
//                     <div className="flex justify-center mt-4">
//                       {[...Array(t.rating)].map((_, idx) => (
//                         <Star
//                           key={idx}
//                           className="w-4 h-4 text-yellow-400 fill-current mx-0.5"
//                         />
//                       ))}
//                     </div>
//                   )}

//                   {/* Footer */}
//                   <div className="text-center mt-4">
//                     <h4 className="text-white font-semibold text-sm">
//                       {t.name}
//                     </h4>
//                     <p className="text-yellow-400 text-xs">{t.designation}</p>
//                     <p className="text-slate-400 text-xs">{t.school}</p>
//                   </div>
//                 </motion.div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </section>
//   )
// }
