"use client"

import { useRef } from "react"
import { motion } from "framer-motion"
import { PlayCircle } from "lucide-react"

export interface VideoTestimonial {
  id: number
  name: string
  designation: string | null
  program: string | null
  description: string | null
  videoUrl: string
  mimeType: string
}

interface VideoTestimonialSectionProps {
  title?: string
  description?: string
  videos: VideoTestimonial[]
}

export default function VideoTestimonialSection({
  title = "Video Testimonials",
  description = "Hear directly from our students and parents",
  videos,
}: VideoTestimonialSectionProps) {
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map())

  // The section only exists when there is at least one visible video.
  if (videos.length === 0) return null

  // Only one video plays at a time.
  const handlePlay = (playingId: number) => {
    videoRefs.current.forEach((element, id) => {
      if (id !== playingId && !element.paused) element.pause()
    })
  }

  return (
    <section className="w-full" aria-labelledby="video-testimonials-heading">
      <div className="mb-12">
        <h2 id="video-testimonials-heading" className="text-4xl md:text-5xl font-bold theme-text-light mb-3">
          {title}
        </h2>
        <p className="text-lg theme-text-muted">{description}</p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video, index) => (
          <motion.article
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, delay: Math.min(index, 5) * 0.05 }}
            className="bg-slate-800 border border-slate-700 rounded-2xl shadow-lg overflow-hidden flex flex-col"
          >
            <div className="relative aspect-video bg-black">
              <video
                ref={(element) => {
                  if (element) videoRefs.current.set(video.id, element)
                  else videoRefs.current.delete(video.id)
                }}
                className="h-full w-full object-contain"
                controls
                playsInline
                preload="metadata"
                onPlay={() => handlePlay(video.id)}
                aria-label={`Video testimonial from ${video.name}`}
              >
                {/* "#t=0.1" makes browsers show the first frame as a preview. */}
                <source src={`${video.videoUrl}#t=0.1`} type={video.mimeType} />
                Your browser does not support embedded videos.
              </video>
            </div>

            <div className="p-6 flex flex-col gap-2 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold theme-text-light truncate">{video.name}</h3>
                  {video.designation && (
                    <p className="text-sm theme-text-muted">{video.designation}</p>
                  )}
                </div>
                <PlayCircle className="h-5 w-5 shrink-0 text-yellow-400" aria-hidden="true" />
              </div>
              {video.program && (
                <span className="self-start rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-xs font-semibold text-yellow-400">
                  {video.program}
                </span>
              )}
              {video.description && (
                <p className="text-sm leading-relaxed theme-text-muted">{video.description}</p>
              )}
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  )
}
