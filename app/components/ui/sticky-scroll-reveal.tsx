"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type StickyItem = {
  title: string
  description?: string
  content: React.ReactNode
}

export function StickyScroll({
  content,
  className,
  stickyOffset = 96, // px from top to account for potential headers
}: {
  content: StickyItem[]
  className?: string
  stickyOffset?: number
}) {
  const [active, setActive] = React.useState(0)
  const itemRefs = React.useRef<(HTMLDivElement | null)[]>([])

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const indexAttr = entry.target.getAttribute("data-index")
          if (!indexAttr) return
          const idx = Number.parseInt(indexAttr, 10)
          if (entry.isIntersecting) {
            setActive(idx)
          }
        })
      },
      {
        root: null,
        rootMargin: `-${stickyOffset}px 0px -40% 0px`,
        threshold: 0.1,
      },
    )

    itemRefs.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [stickyOffset])

  return (
    <section className={cn("grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10", className)}>
      {/* Scrolling list */}
      <div className="flex flex-col">
        {content.map((item, i) => (
          <div
            key={i}
            ref={(el) => {
              itemRefs.current[i] = el
            }}
            data-index={i}
            className={cn(
              "py-16 border-b border-slate-700/30 min-h-[500px] flex flex-col justify-center",
              i === 0 && "pt-2",
              i === content.length - 1 && "border-b-0 pb-2",
            )}
          >
            <h3
              className={cn(
                "text-pretty text-xl font-semibold tracking-tight transition-colors md:text-2xl",
                i === active ? "text-yellow-400" : "text-slate-300",
              )}
            >
              {item.title}
            </h3>
            {item.description ? (
              <p className="mt-2 text-sm leading-relaxed text-slate-400 md:text-base">{item.description}</p>
            ) : null}
          </div>
        ))}
      </div>

      {/* Sticky content */}
      <div className="relative h-fit">
        <div
          className="sticky top-24 rounded-2xl border border-slate-700/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-6 md:p-8"
          style={{ top: stickyOffset }}
          aria-live="polite"
        >
          {content[active]?.content}
        </div>
      </div>
    </section>
  )
}
