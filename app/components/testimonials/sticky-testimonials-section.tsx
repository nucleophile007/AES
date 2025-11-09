"use client"
import { StickyScroll } from "@/components/ui/sticky-scroll-reveal"
import { Star } from "lucide-react"
import Image from "next/image"

export type Testimonial = {
  name: string
  designation?: string
  school?: string
  quote: string
  src?: string
  rating?: number
}

export function StickyTestimonialsSection({
  title,
  items,
}: {
  title: string
  items: Testimonial[]
}) {
  const content = items.map((t) => ({
    title: `${t.name}${t.designation ? " — " + t.designation : ""}`,
    description: t.school,
    content: (
      <figure className="flex flex-col gap-6">
        <blockquote className="text-pretty text-lg leading-relaxed md:text-xl text-slate-200">
          {"\u201C"}
          {t.quote}
          {"\u201D"}
        </blockquote>
        <figcaption className="flex items-center gap-4">
          <div className="relative">
            <Image
              src={t.src || "/placeholder.svg?height=64&width=64&query=student%20avatar"}
              alt="student avatar"
              className="h-16 w-16 rounded-full object-cover ring-2 ring-yellow-400/20"
              width={64}
              height={64}
            />
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400/20 to-amber-500/20 rounded-full blur opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <div className="flex-1">
            <div className="font-semibold text-white text-lg">{t.name}</div>
            <div className="text-yellow-400 font-medium">
              {t.designation || "Student"}
              {t.school ? ` • ${t.school}` : ""}
            </div>
            {typeof t.rating === "number" ? (
              <div className="mt-2 flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${
                      i < (t.rating || 0) 
                        ? "fill-yellow-400 text-yellow-400" 
                        : "fill-slate-600 text-slate-600"
                    }`} 
                  />
                ))}
                <span className="text-slate-400 text-sm ml-2">({t.rating}/5)</span>
              </div>
            ) : null}
          </div>
        </figcaption>
      </figure>
    ),
  }))

  return (
    <section className="py-10 md:py-16">
      <div className="mb-8 md:mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center">
            <span className="text-slate-900 font-bold text-lg">
              {title.charAt(0)}
            </span>
          </div>
          <h2 className="text-balance text-3xl font-bold md:text-4xl text-white">
            {title}
          </h2>
        </div>
        <p className="text-slate-300 text-lg max-w-2xl">
          Real outcomes from students in our {title.toLowerCase()} program. Scroll to explore detailed success stories.
        </p>
      </div>
      <StickyScroll content={content} />
    </section>
  )
}
