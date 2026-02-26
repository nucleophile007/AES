"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"

interface Testimonial {
  id: string
  name: string
  designation: string
  school: string
  content: string
  successStory: string
  src: string
  rating: number
}

interface TestimonialSectionProps {
  title: string
  description: string
  testimonials: Testimonial[]
  color: string
  loading?: boolean
}

export default function TestimonialSection({
  title,
  description,
  testimonials,
  color,
  loading = false,
}: TestimonialSectionProps) {
  const [current, setCurrent] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)

  useEffect(() => {
    if (!isAutoPlay || testimonials.length === 0) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [isAutoPlay, testimonials])

  /* =========================
     Skeleton Loader
  ========================== */
  if (loading) {
    return (
      <section className="w-full">
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-bold theme-text-light mb-3">
            {title}
          </h2>
          <p className="text-lg theme-text-muted">{description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-8 h-[550px] animate-pulse"
            >
              <div className="flex gap-2 mb-4">
                <div className="h-4 w-4 bg-slate-600 rounded" />
                <div className="h-4 w-4 bg-slate-600 rounded" />
                <div className="h-4 w-4 bg-slate-600 rounded" />
              </div>

              <div className="space-y-3">
                <div className="h-4 bg-slate-700 rounded w-3/4" />
                <div className="h-4 bg-slate-700 rounded w-full" />
                <div className="h-4 bg-slate-700 rounded w-5/6" />
              </div>

              <div className="mt-8 flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-600 rounded-full" />
                <div className="space-y-2">
                  <div className="h-3 bg-slate-700 rounded w-24" />
                  <div className="h-3 bg-slate-700 rounded w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  /* =========================
     If No Testimonials
  ========================== */
  if (!testimonials || testimonials.length === 0) {
    return (
      <section className="w-full">
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-bold theme-text-light mb-3">
            {title}
          </h2>
          <p className="text-lg theme-text-muted">{description}</p>
        </div>
        <div className="text-center text-slate-400 py-12">
          <p>No testimonials available yet.</p>
        </div>
      </section>
    )
  }

  /* =========================
     Carousel UI
  ========================== */

  const next = () => {
    setCurrent((prev) => (prev + 1) % testimonials.length)
    setIsAutoPlay(false)
  }

  const prev = () => {
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    setIsAutoPlay(false)
  }

  const getIndex = (offset: number) =>
    (current + offset + testimonials.length) % testimonials.length

  const renderCard = (testimonial: Testimonial, isCenter: boolean) => (
    <motion.div
      key={`${testimonial.id}-${current}`}
      layout
      animate={{
        opacity: isCenter ? 1 : 0.6,
        scale: isCenter ? 1 : 0.9,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`bg-slate-800 border rounded-2xl shadow-lg flex flex-col h-[550px] ${
        isCenter ? "border-yellow-400 p-8" : "border-slate-700 p-6"
      }`}
    >
      {/* Rating */}
      <div className="flex gap-1 mb-4">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star
            key={i}
            size={isCenter ? 20 : 16}
            className="fill-yellow-400 text-yellow-400"
          />
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-hide">
        {testimonial.content && (
          <div>
            <h3 className="text-yellow-400 font-semibold mb-2">
              Experience With Us
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {testimonial.content}
            </p>
          </div>
        )}

        {testimonial.successStory && (
          <div>
            <h3 className="text-emerald-400 font-semibold mb-2">
              Success Story
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {testimonial.successStory}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 mt-6">
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-yellow-400">
          <Image
            src={testimonial.src}
            alt={testimonial.name}
            width={48}
            height={48}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <p className="font-semibold text-white text-sm">
            {testimonial.name}
          </p>
          <p className="text-yellow-400 text-xs">
            {testimonial.designation}
          </p>
          <p className="theme-text-muted text-[11px]">
            {testimonial.school}
          </p>
        </div>
      </div>
    </motion.div>
  )

  return (
    <section className="w-full">
      <div className="mb-12">
        <h2 className="text-4xl md:text-5xl font-bold theme-text-light mb-3">
          {title}
        </h2>
        <p className="text-lg theme-text-muted">{description}</p>
      </div>

      <div className="max-w-7xl mx-auto mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="hidden md:block">
            {renderCard(testimonials[getIndex(-1)], false)}
          </div>

          <div>
            {renderCard(testimonials[current], true)}
          </div>

          <div className="hidden md:block">
            {renderCard(testimonials[getIndex(1)], false)}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-3">
          <button
            onClick={prev}
            className="p-3 rounded-full bg-yellow-400 hover:bg-yellow-500 text-slate-900"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={next}
            className="p-3 rounded-full bg-yellow-400 hover:bg-yellow-500 text-slate-900"
          >
            <ChevronRight size={22} />
          </button>
        </div>

        <div className="flex gap-2">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrent(idx)
                setIsAutoPlay(false)
              }}
              className={`h-1 rounded-full transition-all ${
                idx === current
                  ? `w-8 bg-gradient-to-r ${color}`
                  : "w-2 bg-slate-600"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}


// "use client"

// import { useState, useEffect } from "react"
// import { ChevronLeft, ChevronRight, Star } from "lucide-react"
// import { motion } from "framer-motion"
// import Image from "next/image"

// interface Testimonial {
//   id: string
//   name: string
//   designation: string
//   school: string
//   content: string
//   successStory: string
//   src: string
//   rating: number
// }

// interface TestimonialSectionProps {
//   title: string
//   description: string
//   testimonials: Testimonial[]
//   color: string
// }

// export default function TestimonialSection({
//   title,
//   description,
//   testimonials,
//   color,
// }: TestimonialSectionProps) {
//   const [current, setCurrent] = useState(0)
//   const [isAutoPlay, setIsAutoPlay] = useState(true)

//   useEffect(() => {
//     if (!isAutoPlay || testimonials.length === 0) return

//     const timer = setInterval(() => {
//       setCurrent((prev) => (prev + 1) % testimonials.length)
//     }, 5000)

//     return () => clearInterval(timer)
//   }, [isAutoPlay, testimonials])

//   if (!testimonials || testimonials.length === 0) {
//     return (
//       <section className="w-full">
//         <div className="mb-12">
//           <h2 className="text-4xl md:text-5xl font-bold theme-text-light mb-3">
//             {title}
//           </h2>
//           <p className="text-lg theme-text-muted">{description}</p>
//         </div>
//         <div className="text-center text-slate-400 py-12">
//           <p>No testimonials available at the moment.</p>
//         </div>
//       </section>
//     )
//   }

//   const next = () => {
//     setCurrent((prev) => (prev + 1) % testimonials.length)
//     setIsAutoPlay(false)
//   }

//   const prev = () => {
//     setCurrent(
//       (prev) => (prev - 1 + testimonials.length) % testimonials.length
//     )
//     setIsAutoPlay(false)
//   }

//   const getIndex = (offset: number) =>
//     (current + offset + testimonials.length) % testimonials.length

//   const renderCard = (
//     testimonial: Testimonial,
//     isCenter: boolean
//   ) => {
//     return (
//       <motion.div
//         key={`${testimonial.id}-${current}`}
//         layout
//         initial={false}
//         animate={{
//           opacity: isCenter ? 1 : 0.6,
//           scale: isCenter ? 1 : 0.9,
//         }}
//         transition={{ type: "spring", stiffness: 300, damping: 30 }}
//         className={`bg-slate-800 border rounded-2xl shadow-lg flex flex-col h-[550px] ${
//           isCenter
//             ? "border-yellow-400 p-8"
//             : "border-slate-700 p-6"
//         }`}
//       >
//         {/* ⭐ Rating */}
//         <div className="flex gap-1 mb-4">
//           {Array.from({ length: testimonial.rating }).map((_, i) => (
//             <Star
//               key={i}
//               size={isCenter ? 20 : 16}
//               className="fill-yellow-400 text-yellow-400"
//             />
//           ))}
//         </div>

//         {/* Scrollable Content Area */}
//         <div className="flex-1 overflow-y-auto pr-2 space-y-6">

//           {/* Experience With Us */}
//           {testimonial.content && (
//             <div>
//               <h3 className="text-yellow-400 font-semibold mb-2">
//                 Experience With Us
//               </h3>
//               <p className="text-gray-300 text-sm leading-relaxed">
//                 {testimonial.content}
//               </p>
//             </div>
//           )}

//           {/* Success Story */}
//           {testimonial.successStory && (
//             <div>
//               <h3 className="text-emerald-400 font-semibold mb-2">
//                 Success Story
//               </h3>
//               <p className="text-gray-300 text-sm leading-relaxed">
//                 {testimonial.successStory}
//               </p>
//             </div>
//           )}
//         </div>

//         {/* Author */}
//         <div className="flex items-center gap-4 mt-6">
//           <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-yellow-400">
//             <Image
//               src={testimonial.src}
//               alt={testimonial.name}
//               width={48}
//               height={48}
//               className="w-full h-full object-cover"
//             />
//           </div>
//           <div>
//             <p className="font-semibold text-white text-sm">
//               {testimonial.name}
//             </p>
//             <p className="text-yellow-400 text-xs">
//               {testimonial.designation}
//             </p>
//             <p className="theme-text-muted text-[11px]">
//               {testimonial.school}
//             </p>
//           </div>
//         </div>
//       </motion.div>
//     )
//   }

//   return (
//     <section className="w-full">
//       {/* Header */}
//       <div className="mb-12">
//         <h2 className="text-4xl md:text-5xl font-bold theme-text-light mb-3">
//           {title}
//         </h2>
//         <p className="text-lg theme-text-muted">{description}</p>
//       </div>

//       <div className="max-w-7xl mx-auto mb-8">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           <div className="hidden md:block">
//             {renderCard(testimonials[getIndex(-1)], false)}
//           </div>

//           <div>
//             {renderCard(testimonials[current], true)}
//           </div>

//           <div className="hidden md:block">
//             {renderCard(testimonials[getIndex(1)], false)}
//           </div>
//         </div>
//       </div>

//       {/* Controls */}
//       <div className="flex flex-col items-center gap-4">
//         <div className="flex gap-3">
//           <button
//             onClick={prev}
//             className="p-3 rounded-full bg-yellow-400 hover:bg-yellow-500 text-slate-900"
//           >
//             <ChevronLeft size={22} />
//           </button>
//           <button
//             onClick={next}
//             className="p-3 rounded-full bg-yellow-400 hover:bg-yellow-500 text-slate-900"
//           >
//             <ChevronRight size={22} />
//           </button>
//         </div>

//         <div className="flex gap-2">
//           {testimonials.map((_, idx) => (
//             <button
//               key={idx}
//               onClick={() => {
//                 setCurrent(idx)
//                 setIsAutoPlay(false)
//               }}
//               className={`h-1 rounded-full transition-all ${
//                 idx === current
//                   ? `w-8 bg-gradient-to-r ${color}`
//                   : "w-2 bg-slate-600"
//               }`}
//             />
//           ))}
//         </div>
//       </div>
//     </section>
//   )
// }
