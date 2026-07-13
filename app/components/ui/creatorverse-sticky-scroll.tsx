"use client"

import React, { useEffect, useRef } from "react"
import { motion, useScroll } from "framer-motion"
import { LucideIcon } from "lucide-react"

interface CreatorverseStickyScrollProps {
  content: Array<{
    shortTitle?: string
    title: string
    description: string
    sectionIcon?: LucideIcon
    content?: React.ReactNode | any
  }>
  offset?: number
}

export const CreatorverseStickyScroll: React.FC<CreatorverseStickyScrollProps> = ({ content, offset = 100 }) => {
  const [activeCard, setActiveCard] = React.useState(0)
  const ref = useRef<any>(null)
  const containerRef = useRef<any>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  useEffect(() => {
    const progress = scrollYProgress.get()
    const cardIndex = Math.min(Math.floor(progress * content.length), content.length - 1)
    setActiveCard(cardIndex)
  }, [scrollYProgress, content.length])

  const linearGradients = [
    "from-yellow-400/10 to-amber-500/10",
    "from-yellow-400/10 to-amber-500/10",
    "from-yellow-400/10 to-amber-500/10",
    "from-yellow-400/10 to-amber-500/10",
  ]

  return (
    <div className="relative w-full" ref={containerRef}>
      {content.map((item, index) => {
        const imageOnLeft = index % 2 === 0
        return (
          <div
            key={`scroll-${index}`}
            className="relative min-h-[85vh] w-full flex items-center justify-center overflow-hidden"
          >
            <div className="sticky top-0 min-h-[85vh] w-full flex items-center justify-center theme-bg-dark py-10 md:py-14">
              <div className="w-full flex flex-col gap-10 md:flex-row md:items-center md:justify-center px-5 sm:px-8 md:px-16">
                {imageOnLeft && (
                  <motion.div
                    className="flex-1 flex items-center justify-center md:pr-8"
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: false }}
                  >
                    <div
                      className={`w-full max-w-2xl overflow-hidden rounded-2xl bg-gradient-to-br ${linearGradients[index]} backdrop-blur-sm border border-yellow-400/20 shadow-2xl flex min-h-[300px] md:min-h-[520px] items-center justify-center`}
                    >
                      {item.content}
                    </div>
                  </motion.div>
                )}

                <motion.div
                  className={`${imageOnLeft ? "flex-1 md:pl-8" : "flex-1 md:pr-8"} max-w-2xl z-10`}
                  initial={{ opacity: 0, x: imageOnLeft ? 50 : -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: false }}
                >
                  {item.shortTitle && (
                    <div className="mb-4 inline-flex items-center rounded-full border border-yellow-400/25 bg-yellow-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-yellow-400">
                      {item.shortTitle}
                    </div>
                  )}
                  {item.sectionIcon && (
                    <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-yellow-400/20 bg-yellow-400/10 text-yellow-400 shadow-lg shadow-yellow-500/10">
                      <item.sectionIcon className="h-8 w-8" />
                    </div>
                  )}
                  <h2 className="text-4xl md:text-5xl font-bold theme-text-light mb-5">{item.title}</h2>
                  <p className="text-lg theme-text-muted leading-relaxed">{item.description}</p>
                </motion.div>

                {!imageOnLeft && (
                  <motion.div
                    className="flex-1 flex items-center justify-center md:pl-8"
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: false }}
                  >
                    <div
                      className={`w-full max-w-2xl overflow-hidden rounded-2xl bg-gradient-to-br ${linearGradients[index]} backdrop-blur-sm border border-yellow-400/20 shadow-2xl flex min-h-[300px] md:min-h-[520px] items-center justify-center`}
                    >
                      {item.content}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
