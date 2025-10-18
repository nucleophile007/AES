"use client"

import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

const supporters = [
  {
    name: "BICS",
    logo: "/organisations/BICS Logo.PNG",
    alt: "BICS Logo"
  },
  {
    name: "Folsom High School",
    logo: "/organisations/FHS.png",
    alt: "Folsom High School Logo"
  },
  {
    name: "Natomas High School",
    logo: "/organisations/natomas.jpeg",
    alt: "Natomas High School Logo"
  },
  {
    name: "Sutter Middle School",
    logo: "/organisations/Sutter_MiddleSchool.png",
    alt: "Sutter Middle School Logo"
  },
  {
    name: "Vista Del Lago High School",
    logo: "/organisations/VISTA_DEL_LAGO.PNG",
    alt: "Vista Del Lago High School Logo"
  },
  {
    name: "Images Organization",
    logo: "/organisations/images.jpeg",
    alt: "Images Organization Logo"
  },
  {
    name: "Tags Organization",
    logo: "/organisations/tags.png",
    alt: "Tags Organization Logo"
  }
]

export function SupportersCarousel() {
  // Duplicate the array to create seamless infinite scroll
  const duplicatedSupporters = [...supporters, ...supporters]

  return (
    <section className="py-12 sm:py-16 lg:py-20 theme-bg-dark relative overflow-hidden">
      {/* Enhanced Background Elements */}
      {/* <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-400 rounded-full opacity-5 animate-float"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-blue-400 rounded-full opacity-5 animate-float-reverse"></div>
        <div className="absolute top-1/2 left-1/3 w-20 h-20 bg-purple-400 rounded-full opacity-5 animate-float"></div>
        <div className="absolute bottom-32 left-1/4 w-16 h-16 bg-green-400 rounded-full opacity-5 animate-float-reverse"></div>
      </div> */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-32 right-10 w-24 h-24 bg-blue-400 rounded-full opacity-5 animate-float-reverse"></div>
        <div className="absolute bottom-32 left-20 w-20 h-20 bg-purple-400 rounded-full opacity-5 animate-float"></div>
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-green-400 rounded-full opacity-5 animate-float-reverse"></div>
      </div>
      
      {/* Gradient Overlay */}
      {/* <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-amber-500/10"></div> */}

      {/* <div className="container mx-auto px-6 relative z-10"> */}
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold theme-text-light leading-tight mb-4">
            Organizations That 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500">
              {" "}Support Us
            </span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl theme-text-muted leading-relaxed max-w-3xl mx-auto">
            Trusted by leading universities and high schools across the nation
          </p>
        </div>

        {/* Infinite Carousel */}
        <div className="relative overflow-hidden group">
          <div className="flex animate-scroll group-hover:pause-animation">
            {duplicatedSupporters.map((supporter, index) => (
              <div
                key={`${supporter.name}-${index}`}
                className="flex-shrink-0 mx-6 md:mx-8 flex items-center justify-center"
              >
                <div className="w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-yellow-400/20 hover:scale-110 hover:shadow-xl transition-transform duration-300 overflow-hidden">
                  <Image
                    src={supporter.logo}
                    alt={supporter.alt}
                    width={80}
                    height={80}
                    className="object-contain transition-all duration-300"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gradient Overlays for seamless effect */}
        {/* <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-slate-800 to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-800 to-transparent pointer-events-none" /> */}
      {/* </div> */}
    </section>
  )
}

export default SupportersCarousel
