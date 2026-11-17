"use client"

import * as React from "react"
import Image from "next/image"
import { motion, useReducedMotion } from "framer-motion"
import { ChevronLeft, ChevronRight, Play, Star } from "lucide-react"
import useSWR from "swr"

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

interface VideoTestimonial {
  id: number
  name: string
  designation: string | null
  program: string | null
  description: string | null
  videoUrl: string
  mimeType: string
}

type Slide =
  | { kind: "text"; item: ParentTestimonial }
  | { kind: "video"; item: VideoTestimonial }

const fetcher = (url: string) => fetch(url).then((res) => res.json())

/**
 * Alternates text and video testimonials: T1 V1 T2 V2 ...
 * The shorter list starts over when it runs out, the longer list sets the length,
 * and an empty list simply means only the other kind is shown.
 * e.g. 5 text + 2 video -> T1 V1 T2 V2 T3 V1 T4 V2 T5
 */
const interleaveSlides = (texts: ParentTestimonial[], videos: VideoTestimonial[]): Slide[] => {
  const textSlides = texts.map((item): Slide => ({ kind: "text", item }))
  const videoSlides = videos.map((item): Slide => ({ kind: "video", item }))
  if (!videoSlides.length) return textSlides
  if (!textSlides.length) return videoSlides

  const length = Math.max(textSlides.length, videoSlides.length)
  const slides: Slide[] = []
  for (let i = 0; i < length; i++) {
    slides.push(textSlides[i % textSlides.length])
    // When text is the longer list, finish on text instead of adding one more repeated video.
    const isLastRound = i === length - 1
    if (!(isLastRound && textSlides.length > videoSlides.length)) {
      slides.push(videoSlides[i % videoSlides.length])
    }
  }
  return slides
}

const AUTOPLAY_MS = 3500
const SWIPE_THRESHOLD_PX = 40

/**
 * Signed distance from the active card, wrapped so the carousel loops:
 * 0 = front card, -1 = left card, 1 = right card, anything else is hidden.
 */
const getOffset = (index: number, active: number, count: number) => {
  let offset = index - active
  if (offset > count / 2) offset -= count
  if (offset < -count / 2) offset += count
  // With exactly two cards, always place the other one on the right.
  if (count === 2 && offset === -1) offset = 1
  return offset
}

const cardPose = (offset: number) => {
  if (offset === 0) return { x: "0%", scale: 1, rotateY: 0, opacity: 1, zIndex: 30, filter: "brightness(1)" }
  if (Math.abs(offset) === 1) {
    return {
      x: `${offset * 62}%`,
      scale: 0.8,
      rotateY: offset * -28,
      opacity: 0.55,
      zIndex: 20,
      filter: "brightness(0.6)",
    }
  }
  return {
    x: `${Math.sign(offset) * 110}%`,
    scale: 0.6,
    rotateY: Math.sign(offset) * -40,
    opacity: 0,
    zIndex: 10,
    filter: "brightness(0.4)",
  }
}

function TestimonialCard({ testimonial }: { testimonial: ParentTestimonial }) {
  const quotes = [testimonial.childExperience, testimonial.successStory, testimonial.overallExperience]
    .map((quote) => quote?.trim())
    .filter(Boolean) as string[]

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-700 bg-slate-800 p-6 transition-colors hover:border-yellow-400">
      {/* Avatar, overlapping the top edge of the card */}
      <div className="relative -mt-16 mb-4 flex justify-center">
        <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-yellow-400 bg-slate-900">
          <Image src={testimonial.src} alt={testimonial.name} width={96} height={96} className="h-full w-full object-cover" />
        </div>
      </div>

      {/* Programs */}
      {testimonial.programs?.length > 0 && (
        <div className="mb-4 flex flex-wrap justify-center gap-2">
          {testimonial.programs.map((program) => (
            <span key={program} className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-medium text-slate-900">
              {program}
            </span>
          ))}
        </div>
      )}

      {/* Content */}
      <div
        className="flex-1 space-y-3 overflow-hidden text-center"
        style={{ maskImage: "linear-gradient(to bottom, black 85%, transparent)" }}
      >
        {quotes.map((quote, index) => (
          <p key={index} className="text-sm italic text-slate-200">&quot;{quote}&quot;</p>
        ))}
      </div>

      {/* Rating */}
      {testimonial.rating ? (
        <div className="mt-4 flex justify-center" aria-label={`${testimonial.rating} out of 5 stars`}>
          {Array.from({ length: Math.min(5, testimonial.rating) }, (_, index) => (
            <Star key={index} className="mx-0.5 h-4 w-4 fill-current text-yellow-400" />
          ))}
        </div>
      ) : null}

      {/* Footer */}
      <div className="mt-4 text-center">
        <h4 className="text-sm font-semibold text-white">{testimonial.name}</h4>
        {testimonial.designation && <p className="text-xs text-yellow-400">{testimonial.designation}</p>}
        {testimonial.school && <p className="text-xs text-slate-400">{testimonial.school}</p>}
      </div>
    </div>
  )
}

function VideoTestimonialCard({
  video,
  isFront,
  isNear,
  onPlayingChange,
}: {
  video: VideoTestimonial
  isFront: boolean
  isNear: boolean
  onPlayingChange: (playing: boolean) => void
}) {
  const videoRef = React.useRef<HTMLVideoElement>(null)

  // Stop playback as soon as the card leaves the front position.
  React.useEffect(() => {
    if (!isFront && videoRef.current && !videoRef.current.paused) videoRef.current.pause()
  }, [isFront])

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-700 bg-slate-800 p-6 transition-colors hover:border-yellow-400">
      {/* Badge in the avatar position, overlapping the top edge of the card */}
      <div className="relative -mt-16 mb-4 flex justify-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-yellow-400 bg-slate-900 text-yellow-400">
          <Play className="ml-1 h-10 w-10 fill-current" aria-hidden="true" />
        </div>
      </div>

      {video.program && (
        <div className="mb-4 flex justify-center">
          <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-medium text-slate-900">{video.program}</span>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-hidden rounded-xl bg-black">
        <video
          ref={videoRef}
          className="h-full w-full object-contain"
          style={{ pointerEvents: isFront ? "auto" : "none" }}
          controls={isFront}
          playsInline
          preload={isFront || isNear ? "metadata" : "none"}
          tabIndex={isFront ? 0 : -1}
          onPlay={() => onPlayingChange(true)}
          onPause={() => onPlayingChange(false)}
          onEnded={() => onPlayingChange(false)}
          aria-label={`Video testimonial from ${video.name}`}
        >
          {/* "#t=0.1" makes browsers show the first frame as a preview. */}
          <source src={`${video.videoUrl}#t=0.1`} type={video.mimeType} />
        </video>
      </div>

      <div className="mt-4 text-center">
        <h4 className="text-sm font-semibold text-white">{video.name}</h4>
        {video.designation && <p className="text-xs text-yellow-400">{video.designation}</p>}
        {video.description && <p className="mt-1 line-clamp-2 text-xs text-slate-400">{video.description}</p>}
      </div>
    </div>
  )
}

export default function ParentTestimonialCoverflow({ className = "" }: { className?: string }) {
  const { data, isLoading } = useSWR<{ success: boolean; testimonials: ParentTestimonial[] }>(
    "/api/testimonials/parent-testimonials",
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  )

  const { data: videoData, isLoading: videosLoading } = useSWR<{ success: boolean; videos: VideoTestimonial[] }>(
    "/api/testimonials/video-testimonials",
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  )

  const testimonials = React.useMemo(() => {
    const texts = (data?.testimonials || []).filter(
      (t) => t.childExperience || t.successStory || t.overallExperience || t.rating
    )
    return interleaveSlides(texts, videoData?.videos || [])
  }, [data, videoData])

  // With 2–3 slides, repeat them so there is always a card on both sides of the front card.
  const slides = React.useMemo(() => {
    if (testimonials.length < 2 || testimonials.length >= 4) return testimonials
    const repeats = Math.ceil(4 / testimonials.length)
    return Array.from({ length: repeats }, () => testimonials).flat()
  }, [testimonials])

  const realCount = testimonials.length
  const count = slides.length
  const [active, setActive] = React.useState(0)
  const activeReal = realCount ? active % realCount : 0
  const [paused, setPaused] = React.useState(false)
  const [videoPlaying, setVideoPlaying] = React.useState(false)
  const reduceMotion = useReducedMotion()
  const touchStartX = React.useRef<number | null>(null)

  const go = React.useCallback(
    (step: number) => setActive((current) => (count ? (current + step + count) % count : 0)),
    [count]
  )

  React.useEffect(() => {
    if (active >= count && count > 0) setActive(0)
  }, [active, count])

  React.useEffect(() => {
    if (paused || videoPlaying || reduceMotion || count < 2) return
    const timer = window.setInterval(() => {
      if (!document.hidden) go(1)
    }, AUTOPLAY_MS)
    return () => window.clearInterval(timer)
  }, [paused, videoPlaying, reduceMotion, count, go])

  // A video that was playing is paused when its card leaves the front.
  React.useEffect(() => {
    setVideoPlaying(false)
  }, [active])

  if (isLoading || videosLoading) {
    return (
      <div className={`flex h-[550px] items-end justify-center pb-6 ${className}`}>
        <div className="h-[460px] w-80 animate-pulse rounded-2xl border border-slate-700 bg-slate-800 md:w-96" />
      </div>
    )
  }

  if (count === 0) return null

  return (
    <div
      className={`relative ${className}`}
      role="region"
      aria-roledescription="carousel"
      aria-label="What parents say about us"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") go(-1)
        if (event.key === "ArrowRight") go(1)
      }}
    >
      <div
        className="relative h-[550px] overflow-hidden"
        style={{ perspective: "1200px" }}
        onTouchStart={(event) => { touchStartX.current = event.touches[0].clientX }}
        onTouchEnd={(event) => {
          if (touchStartX.current === null) return
          const delta = event.changedTouches[0].clientX - touchStartX.current
          if (Math.abs(delta) > SWIPE_THRESHOLD_PX) go(delta < 0 ? 1 : -1)
          touchStartX.current = null
        }}
      >
        {slides.map((slide, index) => {
          const offset = getOffset(index, active, count)
          const isFront = offset === 0
          const isSide = Math.abs(offset) === 1
          return (
            <motion.div
              key={`${slide.kind}-${slide.item.id}-${index}`}
              // top-[68px] leaves room for the avatar that overlaps the card's top edge.
              className="absolute left-1/2 top-[68px] h-[460px] w-80 -ml-40 md:w-96 md:-ml-48"
              style={{ transformStyle: "preserve-3d", pointerEvents: isFront || isSide ? "auto" : "none" }}
              initial={false}
              animate={cardPose(offset)}
              transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 32 }}
              onClick={() => { if (isSide) go(offset) }}
              aria-hidden={!isFront}
              aria-roledescription="slide"
              aria-label={`${(index % realCount) + 1} of ${realCount}`}
            >
              <div className={isSide ? "h-full cursor-pointer" : "h-full"}>
                {slide.kind === "text" ? (
                  <TestimonialCard testimonial={slide.item} />
                ) : (
                  <VideoTestimonialCard
                    video={slide.item}
                    isFront={isFront}
                    isNear={isSide}
                    onPlayingChange={setVideoPlaying}
                  />
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {realCount > 1 && (
        <div className="mt-2 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous testimonial"
            className="rounded-full bg-yellow-400 p-2.5 text-slate-900 transition hover:bg-yellow-500"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex gap-2">
            {testimonials.map((slide, index) => (
              <button
                key={`${slide.kind}-${slide.item.id}-${index}`}
                type="button"
                onClick={() => go(index - activeReal)}
                aria-label={`Show testimonial ${index + 1}`}
                aria-current={index === activeReal}
                className={`h-1.5 rounded-full transition-all ${index === activeReal ? "w-6 bg-yellow-400" : "w-1.5 bg-slate-600 hover:bg-slate-500"}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next testimonial"
            className="rounded-full bg-yellow-400 p-2.5 text-slate-900 transition hover:bg-yellow-500"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  )
}
