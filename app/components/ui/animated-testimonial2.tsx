"use client"

import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState, useCallback } from "react"

type Testimonial = {
  quote: string
  name: string
  designation: string
  src?: string  // Made optional
  initials?: string  // Added initials field
  // New fields from the provided data
  achievement?: string
  improvement?: string
  subject?: string
  highlight?: string
  rating?: number
}

type Section = {
  tutoring: Testimonial[]
  satCoaching: Testimonial[]
  collegePrep: Testimonial[]
  researchProgram: Testimonial[]
  mathCompetition: Testimonial[]
}

export const AnimatedTestimonials = ({
  sections,
  autoplay = false,
}: {
  sections: Section
  autoplay?: boolean
}) => {
  const [activeSection, setActiveSection] = useState<keyof Section>("tutoring")
  const [active, setActive] = useState(0)

  const sectionLabels = {
    tutoring: "Tutoring",
    satCoaching: "SAT Coaching",
    collegePrep: "College Prep",
    researchProgram: "Research Program",
    mathCompetition: "Math Competition",
  }

  const currentTestimonials = sections[activeSection] || []

  const handleNext = useCallback(() => {
    if (currentTestimonials.length === 0) return
    setActive((prev) => (prev + 1) % currentTestimonials.length)
  }, [currentTestimonials.length])

  const handlePrev = () => {
    if (currentTestimonials.length === 0) return
    setActive((prev) => (prev - 1 + currentTestimonials.length) % currentTestimonials.length)
  }

  const handleSectionChange = (section: keyof Section) => {
    if (section === activeSection) return
    setActiveSection(section)
    setActive(0)
  }

  const isActive = (index: number) => {
    return index === active
  }

  useEffect(() => {
    if (autoplay && currentTestimonials.length > 1) {
      const interval = setInterval(handleNext, 5000)
      return () => clearInterval(interval)
    }
  }, [autoplay, currentTestimonials.length, handleNext])

  // Deterministic rotation based on index to avoid hydration mismatches
  const getRotateY = (index: number) => {
    const rotations = [-8, -6, -4, -2, 0, 2, 4, 6, 8, -7, -5, -3, -1, 1, 3, 5, 7, -9, -8, -6, -4]
    return rotations[index % rotations.length]
  }

  // Function to determine if testimonial is short (for dynamic spacing)
  const isShortTestimonial = (quote: string) => {
    return quote.length < 200
  }

  if (!currentTestimonials.length) {
    return (
      <div className="mx-auto max-w-sm px-4 py-20 font-sans antialiased md:max-w-6xl md:px-8 lg:px-12 bg-slate-900 min-h-screen flex items-center justify-center">
        <div className="text-center text-sky-300">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p>Loading testimonials...</p>
        </div>
      </div>
    )
  }

  const currentTestimonial = currentTestimonials[active]
  const isShort = currentTestimonial ? isShortTestimonial(currentTestimonial.quote) : false

  return (
    <div className="mx-auto max-w-sm px-4 py-20 font-sans antialiased md:max-w-6xl md:px-8 lg:px-12 bg-slate-900 min-h-screen">
      {/* Section Navigation - Increased margin bottom */}
      <div className="mb-16 flex flex-wrap justify-center gap-3 md:gap-5 relative z-10">
        {Object.entries(sectionLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => handleSectionChange(key as keyof Section)}
            className={`rounded-full px-5 py-3 text-sm font-medium transition-all duration-200 md:px-7 md:py-4 md:text-base transform hover:scale-105 ${
              activeSection === key
                ? "bg-yellow-400 text-slate-900 shadow-lg font-semibold hover:bg-yellow-300 hover:shadow-xl"
                : "bg-slate-700 text-sky-300 hover:bg-slate-600 hover:text-white hover:border-sky-300/60 hover:shadow-md border border-sky-300/40"
            }`}
            aria-label={`Switch to ${label} testimonials`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Testimonials Section - FLEXIBLE DIMENSIONS */}
      <div className="relative grid grid-cols-1 gap-20 md:grid-cols-2 z-10">
        {/* Image Section - FIXED HEIGHT */}
        <div className="relative">
          <div className="relative h-80 w-full">
            <AnimatePresence mode="wait">
              {currentTestimonials.map((testimonial, index) => (
                <motion.div
                  key={`testimonial-${activeSection}-${index}`}
                  initial={{
                    opacity: 0,
                    scale: 0.9,
                    z: -100,
                    rotate: getRotateY(index),
                  }}
                  animate={{
                    opacity: isActive(index) ? 1 : 0.7,
                    scale: isActive(index) ? 1 : 0.95,
                    z: isActive(index) ? 0 : -100,
                    rotate: isActive(index) ? 0 : getRotateY(index),
                    zIndex: isActive(index) ? 40 : currentTestimonials.length + 2 - index,
                    y: isActive(index) ? [0, -80, 0] : 0,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                    z: 100,
                    rotate: getRotateY(index),
                  }}
                  transition={{
                    duration: 0.4,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 origin-bottom"
                >
                  <div className="h-full w-full rounded-3xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center shadow-inner">
                    <span className="text-6xl md:text-7xl font-bold text-[#1a2236] select-none">
                      {testimonial.initials || testimonial.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Content Section - ADAPTIVE HEIGHT AND LAYOUT */}
        <div
          className={`relative bg-slate-700 rounded-2xl shadow-xl min-h-[480px] flex flex-col ${
            isShort ? "p-12 md:p-16" : "p-8"
          }`}
        >
          {/* Content Area - FLEXIBLE HEIGHT */}
          <div className="flex-1 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeSection}-${active}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="flex flex-col h-full justify-center"
              >
                {/* Badge */}
                <div className={`${isShort ? "mb-8" : "mb-4"}`}>
                  <span className="inline-block rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-slate-900 shadow-md">
                    {sectionLabels[activeSection]}
                  </span>
                </div>

                {/* Name - ADAPTIVE SPACING */}
                <div className={`flex items-start ${isShort ? "mb-6" : "mb-4"}`}>
                  <h3 className="text-2xl md:text-3xl font-bold text-sky-300 leading-tight">
                    {currentTestimonials[active]?.name}
                  </h3>
                </div>

                {/* Designation - ADAPTIVE SPACING */}
                <div className={`flex items-start ${isShort ? "mb-10" : "mb-6"}`}>
                  <p className="text-sm md:text-base text-yellow-400 font-medium">
                    {currentTestimonials[active]?.designation}
                  </p>
                </div>

                {/* Quote - ADAPTIVE SPACING AND CENTERING */}
                <div className={`flex-1 flex flex-col justify-center ${isShort ? "py-4" : ""}`}>
                  <blockquote
                    className={`text-xs md:text-sm text-sky-200 leading-relaxed flex flex-col ${
                      isShort ? "text-center" : ""
                    }`}
                  >
                    <span
                      className={`text-sky-300 text-4xl font-serif leading-none ${
                        isShort ? "mb-6 self-center" : "mb-2"
                      }`}
                    >
                      &quot;
                    </span>
                    <div className={`flex-1 ${isShort ? "px-4" : ""}`}>
                      <span>{currentTestimonials[active]?.quote}</span>
                    </div>
                    <span
                      className={`text-sky-300 text-4xl font-serif leading-none ${
                        isShort ? "mt-6 self-center" : "mt-2 self-end"
                      }`}
                    >
                      &quot;
                    </span>
                  </blockquote>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Controls - FIXED POSITION - Enhanced hover effects */}
          <div
            className={`flex items-center justify-between border-t border-sky-300/20 ${
              isShort ? "pt-8 mt-8" : "pt-6 mt-6"
            }`}
          >
            <div className="flex gap-4">
              <button
                onClick={handlePrev}
                disabled={currentTestimonials.length <= 1}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400 hover:bg-yellow-300 hover:scale-110 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                aria-label="Previous testimonial"
              >
                <IconArrowLeft className="h-5 w-5 text-slate-900" />
              </button>
              <button
                onClick={handleNext}
                disabled={currentTestimonials.length <= 1}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400 hover:bg-yellow-300 hover:scale-110 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                aria-label="Next testimonial"
              >
                <IconArrowRight className="h-5 w-5 text-slate-900" />
              </button>
            </div>

            {/* Progress Indicators - FIXED POSITION - Enhanced hover effects */}
            <div className="flex gap-2">
              {currentTestimonials.map((_, index) => (
                <button
                  key={`progress-${activeSection}-${index}`}
                  onClick={() => setActive(index)}
                  className={`h-2 rounded-full transition-all duration-200 hover:scale-125 ${
                    isActive(index) ? "bg-sky-300 w-6" : "bg-slate-600 hover:bg-slate-500 w-2"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`                  }
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
