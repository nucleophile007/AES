"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

interface Testimonial {
  name: string
  designation: string
  school: string
  quote: string
  src: string
  rating: number
}

interface TestimonialSectionProps {
  title: string
  description: string
  testimonials: Testimonial[]
  color: string
}

export default function TestimonialSection({ title, description, testimonials, color }: TestimonialSectionProps) {
  const [current, setCurrent] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)

  // Auto-advance testimonials
  useEffect(() => {
    if (!isAutoPlay) return

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [isAutoPlay, testimonials.length])

  const next = () => {
    setCurrent((prev) => (prev + 1) % testimonials.length)
    setIsAutoPlay(false)
  }

  const prev = () => {
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    setIsAutoPlay(false)
  }

  // Calculate indices for previous, current, and next testimonials
  const getTestimonialIndex = (offset: number) => {
    return (current + offset + testimonials.length) % testimonials.length
  }

  const prevIndex = getTestimonialIndex(-1)
  const nextIndex = getTestimonialIndex(1)

  const renderTestimonialCard = (testimonial: Testimonial, index: number, isCenter: boolean, position: 'left' | 'center' | 'right') => {
    return (
      <motion.div
        key={`${testimonial.name}-${index}-${current}`}
        layout
        initial={false}
        animate={{ 
          opacity: isCenter ? 1 : 0.6, 
          scale: isCenter ? 1 : 0.85,
        }}
        transition={{ 
          type: "spring",
          stiffness: 300,
          damping: 30,
          mass: 0.8,
          layout: { 
            type: "spring",
            stiffness: 300,
            damping: 30,
            mass: 0.8
          }
        }}
        className={`bg-slate-800 border rounded-2xl shadow-lg transition-all relative flex flex-col h-[500px] md:h-[550px] ${
          isCenter
            ? "border-yellow-400 p-8 md:p-12 hover:shadow-xl hover:border-yellow-300"
            : "border-slate-700 p-6 md:p-8"
        }`}
      >
        {/* Rating */}
        <div className="flex gap-1 mb-4 md:mb-6 flex-shrink-0">
          {Array.from({ length: testimonial.rating }).map((_, i) => (
            <Star
              key={i}
              size={isCenter ? 20 : 16}
              className="fill-yellow-400 text-yellow-400"
            />
          ))}
        </div>

        {/* Quote */}
        <blockquote className="mb-6 md:mb-8 flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="flex-1 flex items-center justify-center min-h-0">
            <p
              className={`theme-text-light leading-relaxed italic max-h-full ${
                isCenter 
                  ? "text-lg md:text-xl overflow-y-auto" 
                  : "text-sm md:text-base line-clamp-4 overflow-hidden"
              }`}
            >
              &quot;{testimonial.quote}&quot;
            </p>
          </div>
        </blockquote>

        {/* Author Info */}
        <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
          <div
            className={`rounded-full overflow-hidden border-2 border-yellow-400 ${
              isCenter ? "w-14 h-14" : "w-10 h-10"
            }`}
          >
            <Image
              src={testimonial.src || "/placeholder.svg"}
              alt={testimonial.name}
              width={isCenter ? 56 : 40}
              height={isCenter ? 56 : 40}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className={`font-semibold text-white ${isCenter ? "text-base" : "text-sm"}`}>
              {testimonial.name}
            </p>
            <p className={`text-yellow-400 ${isCenter ? "text-sm" : "text-xs"}`}>
              {testimonial.designation}
            </p>
            <p className={`theme-text-muted ${isCenter ? "text-xs" : "text-[10px]"}`}>
              {testimonial.school}
            </p>
          </div>
        </div>

        {/* Decorative Quote Mark */}
        <div
          className={`absolute top-4 right-4 md:top-6 md:right-8 text-yellow-400/10 font-serif ${
            isCenter ? "text-6xl" : "text-4xl"
          }`}
        >
          &quot;
        </div>
      </motion.div>
    )
  }

  return (
    <section className="w-full">
      {/* Section Header */}
      <div className="mb-12">
        <h2 className="text-4xl md:text-5xl font-bold theme-text-light mb-3">{title}</h2>
        <p className="text-lg theme-text-muted">{description}</p>
      </div>

      {/* Testimonial Carousel */}
      <div className="w-full">
        {/* Three Testimonial Cards */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-start">
            {/* Left Card (Previous) */}
            <div className="hidden md:block">
              {renderTestimonialCard(testimonials[prevIndex], prevIndex, false, 'left')}
            </div>

            {/* Center Card (Current - Focused) */}
            <div className="md:col-span-1">
              {renderTestimonialCard(testimonials[current], current, true, 'center')}
            </div>

            {/* Right Card (Next) */}
            <div className="hidden md:block">
              {renderTestimonialCard(testimonials[nextIndex], nextIndex, false, 'right')}
            </div>
          </div>
        </div>

        {/* Navigation Controls - Below Card */}
        <div className="flex flex-col items-center gap-4">
          {/* Navigation Buttons */}
          <div className="flex gap-3">
            <button
              onClick={prev}
              className="p-3 rounded-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={next}
              className="p-3 rounded-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Progress Indicators */}
          <div className="flex gap-2">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrent(idx)
                  setIsAutoPlay(false)
                }}
                className={`h-1 rounded-full transition-all ${
                  idx === current ? `w-8 bg-gradient-to-r ${color}` : "w-2 bg-slate-600"
                }`}
                aria-label={`Go to testimonial ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

