"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

interface Program {
  id: number
  title: string
  description: string
  image: string
  buttonText: string
  buttonVariant: "default" | "secondary"
  href: string
}

const programs: Program[] = [
  {
    id: 1,
    title: "Master the SAT with Expert Guidance",
    description: "Personalized strategies to boost your score and unlock your potential",
    image: "/program-image/satimage.png",
    buttonText: "Learn More",
    buttonVariant: "default",
    href: "/satcoaching"
  },
  {
    id: 2,
    title: "Navigate Your College Journey",
    description: "Comprehensive support for applications, essays, and college selection",
    image: "/program-image/collegeprep.png",
    buttonText: "Learn More",
    buttonVariant: "secondary",
    href: "/collegeprep"
  },
  {
    id: 3,
    title: "Unlock Your Potential with Academic Tutoring",
    description: "Tailored sessions in all subjects with expert mentors",
    image: "/program-image/academictutoring.png",
    buttonText: "Learn More",
    buttonVariant: "default",
    href: "/academictutoring"
  },
  {
    id: 4,
    title: "Explore Our Research Programs",
    description: "Gain hands-on experience and mentorship in cutting-edge research",
    image: "/program-image/research.png",
    buttonText: "Learn More",
    buttonVariant: "secondary",
    href: "/aes-explorers"
  },
  {
    id: 5,
    title: "Challenge Yourself in Math Competitions",
    description: "Compete, learn, and grow with our math competition programs",
    image: "/program-image/mathimage.png",
    buttonText: "Learn More",
    buttonVariant: "default",
    href: "/mathcompetition"
  },
]

export function ProgramCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      nextSlide()
    }, 3000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const nextSlide = () => {
    if (isTransitioning) return

    setIsTransitioning(true)
    setCurrentSlide((prev) => {
      const next = prev + 1
      
      // Check if we're moving to the duplicate slide
      if (next >= programs.length) {
        // We're moving to the duplicate slide, set up the reset
        setTimeout(() => {
          setIsTransitioning(false)
          setCurrentSlide(0)
          if (carouselRef.current) {
            carouselRef.current.style.transition = "none"
            carouselRef.current.style.transform = "translateX(0%)"
            setTimeout(() => {
              if (carouselRef.current) {
                carouselRef.current.style.transition = "transform 500ms ease-in-out"
              }
            }, 50)
          }
        }, 500)
      } else {
        // Normal slide transition
        setTimeout(() => setIsTransitioning(false), 500)
      }
      
      return next
    })
  }

  const prevSlide = () => {
    if (isTransitioning) return

    setIsAutoPlaying(false)
    setIsTransitioning(true)

    setCurrentSlide((prev) => {
      if (prev === 0) {
        // Jump to the duplicate slide at the end
        setCurrentSlide(programs.length)
        if (carouselRef.current) {
          carouselRef.current.style.transition = "none"
          carouselRef.current.style.transform = `translateX(-${programs.length * 100}%)`
          setTimeout(() => {
            if (carouselRef.current) {
              carouselRef.current.style.transition = "transform 500ms ease-in-out"
              setCurrentSlide(programs.length - 1)
              setTimeout(() => setIsTransitioning(false), 500)
            }
          }, 50)
        }
        return programs.length
      } else {
        // Normal backward movement
        setTimeout(() => setIsTransitioning(false), 500)
        return prev - 1
      }
    })
  }

  const goToSlide = (index: number) => {
    if (isTransitioning) return
    setCurrentSlide(index)
    setIsAutoPlaying(false)
  }

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      {/* Simple carousel container */}
      <div className="relative overflow-hidden rounded-2xl theme-bg-medium shadow-lg border border-yellow-400/30">
        <div
          ref={carouselRef}
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {[...programs, programs[0]].map((program, index) => (
            <div key={`${program.id}-${index}`} className="w-full flex-shrink-0">
              <Card className="group border-0 rounded-none bg-transparent shadow-none transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover-tilt">
                <CardContent className="p-0">
                  <div className="grid md:grid-cols-2 h-[420px]">
                    {/* Simple Image Section */}
                    <div className="relative overflow-hidden h-full rounded-xl">
                      <Image
                        src={program.image || "/placeholder.svg"}
                        alt={program.title}
                        fill
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                        priority={index === 0}
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                      {/* subtle gradient edge for depth */}
                      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black/15 to-transparent" />
                      {/* soft vignette */}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-transparent" />
                    </div>
                    
                    {/* Simple Content Section */}
                    <div className="flex flex-col justify-center p-8 md:p-12 h-full theme-bg-medium md:border-l md:border-yellow-400/20 animate-slide-in-bottom">
                      <div className="space-y-4 rounded-xl glass-effect border border-yellow-400/10 p-6 md:p-8">
                        {/* Accent bar */}
                        <div className="h-1 w-12 rounded mb-1 bg-yellow-400 transition-all duration-300 group-hover:w-16" />
                        {/* Simple title */}
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold theme-text-light leading-tight tracking-tight">
                          {program.title}
                        </h2>
                        
                        
                        {/* Simple description */}
                        <p className="text-base md:text-lg theme-text-muted leading-relaxed line-clamp-3">
                          {program.description}
                        </p>
                        
                        {/* Simple button */}
                        <div className="pt-4">
                          <Button 
                            variant={program.buttonVariant} 
                            size="lg" 
                            className="px-6 py-3 text-base font-semibold group/cta hover-glow ring-1 ring-yellow-400/30 hover:ring-yellow-400/60 shadow-md hover:shadow-yellow-400/20 transition-transform duration-200 hover:-translate-y-0.5"
                            onClick={() => window.location.href = program.href}
                          >
                            <span className="inline-flex items-center gap-2">
                              {program.buttonText}
                              <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover/cta:translate-x-1" />
                            </span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Simple Navigation Arrows */}
        <Button
          variant="outline"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 theme-bg-medium border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-slate-900 transition-colors"
          onClick={prevSlide}
          disabled={isTransitioning}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous slide</span>
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 theme-bg-medium border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-slate-900 transition-colors"
          onClick={nextSlide}
          disabled={isTransitioning}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next slide</span>
        </Button>
      </div>

      {/* Simple Dots Indicator */}
      <div className="flex justify-center mt-6 gap-2">
        {programs.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === (currentSlide % programs.length)
                ? "bg-yellow-400"
                : "bg-slate-400 hover:bg-slate-300"
            }`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
