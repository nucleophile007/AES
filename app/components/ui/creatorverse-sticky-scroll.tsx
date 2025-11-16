"use client"

import React, { useEffect, useRef } from "react"
import { motion, useScroll } from "framer-motion"

interface CreatorverseStickyScrollProps {
  content: Array<{
    title: string
    description: string
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
  })

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
            className="relative h-screen w-full flex items-center justify-center overflow-hidden"
          >
            <div className="sticky top-0 h-screen w-full flex items-center justify-center theme-bg-dark">
              <div className="w-full h-full flex items-center justify-center px-8 md:px-16">
                {imageOnLeft && (
                  <motion.div
                    className="flex-1 flex items-center justify-center h-full pr-8"
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: false }}
                  >
                    <div
                      className={`w-full h-4/5 rounded-2xl bg-gradient-to-br ${linearGradients[index]} backdrop-blur-sm border border-yellow-400/20 overflow-hidden shadow-2xl flex items-center justify-center`}
                    >
                      {item.content}
                    </div>
                  </motion.div>
                )}

                <motion.div
                  className={`${imageOnLeft ? "flex-1 pl-8" : "flex-1 pr-8"} max-w-xl z-10`}
                  initial={{ opacity: 0, x: imageOnLeft ? 50 : -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: false }}
                >
                  <h2 className="text-5xl font-bold theme-text-light mb-6">{item.title}</h2>
                  <p className="text-lg theme-text-muted leading-relaxed">{item.description}</p>
                </motion.div>

                {!imageOnLeft && (
                  <motion.div
                    className="flex-1 flex items-center justify-center h-full pl-8"
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: false }}
                  >
                    <div
                      className={`w-full h-4/5 rounded-2xl bg-gradient-to-br ${linearGradients[index]} backdrop-blur-sm border border-yellow-400/20 overflow-hidden shadow-2xl flex items-center justify-center`}
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


