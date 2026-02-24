// "use client"

// import { useState } from "react"
// import { ChevronLeft, ChevronRight, Lock, Maximize2, Play } from "lucide-react"
// import { Button } from "@/components/ui/button"

// interface SlideViewerProps {
//   slides: {
//     id: string
//     imagePath: string
//     order: number
//   }[]
//   onSlideView: (index: number) => void
//   hasAccess: boolean
//   maxFreeSlides: number
// }

// export function SlideViewer({
//   slides,
//   onSlideView,
//   hasAccess,
//   maxFreeSlides,
// }: SlideViewerProps) {
//   const [currentSlide, setCurrentSlide] = useState(0)

//   if (!slides || slides.length === 0) {
//     return (
//       <div className="p-6 bg-slate-800 rounded-xl text-center theme-text-muted">
//         No slides available for this research.
//       </div>
//     )
//   }

//   const goToSlide = (index: number) => {
//     if (index >= maxFreeSlides && !hasAccess) {
//       onSlideView(index)
//       return
//     }
//     setCurrentSlide(index)
//     onSlideView(index)
//   }

//   const nextSlide = () => {
//     const next = currentSlide + 1
//     if (next < slides.length) {
//       goToSlide(next)
//     }
//   }

//   const prevSlide = () => {
//     if (currentSlide > 0) {
//       setCurrentSlide(currentSlide - 1)
//     }
//   }

//   const isLocked = (index: number) =>
//     index >= maxFreeSlides && !hasAccess

//   return (
//     <div className="space-y-5 max-w-4xl mx-auto">
//       {/* Main Slide Display */}
//       <div className="relative bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-lg shadow-black/10">
//         <div className="aspect-video relative">
//           <img
//             src={slides[currentSlide]?.imagePath || "/placeholder.svg"}
//             alt={`Slide ${currentSlide + 1}`}
//             className="w-full h-full object-cover"
//           />

//           {/* Gradient Overlay */}
//           <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />

//           {/* Slide Info */}
//           <div className="absolute bottom-0 left-0 right-0 p-6">
//             <div className="flex items-center gap-2 mb-2">
//               <span className="px-2.5 py-1 bg-yellow-400/20 backdrop-blur-sm text-yellow-400 text-xs font-medium rounded-full">
//                 Slide {currentSlide + 1} of {slides.length}
//               </span>

//               {!isLocked(currentSlide) && (
//                 <span className="px-2.5 py-1 bg-slate-800/80 backdrop-blur-sm theme-text-muted text-xs rounded-full">
//                   Free Preview
//                 </span>
//               )}
//             </div>
//           </div>

//           {/* Controls */}
//           <div className="absolute top-4 right-4 flex items-center gap-2">
//             <Button
//               variant="ghost"
//               size="icon"
//               className="bg-slate-800/80 backdrop-blur-sm hover:bg-slate-700 border border-slate-700/50"
//             >
//               <Play className="w-4 h-4" />
//             </Button>

//             <Button
//               variant="ghost"
//               size="icon"
//               className="bg-slate-800/80 backdrop-blur-sm hover:bg-slate-700 border border-slate-700/50"
//             >
//               <Maximize2 className="w-4 h-4" />
//             </Button>
//           </div>
//         </div>

//         {/* Navigation Arrows */}
//         <Button
//           variant="ghost"
//           size="icon"
//           className="absolute left-4 top-1/2 -translate-y-1/2 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 shadow-lg"
//           onClick={prevSlide}
//           disabled={currentSlide === 0}
//         >
//           <ChevronLeft className="w-5 h-5" />
//         </Button>

//         <Button
//           variant="ghost"
//           size="icon"
//           className="absolute right-4 top-1/2 -translate-y-1/2 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 shadow-lg"
//           onClick={nextSlide}
//           disabled={currentSlide === slides.length - 1}
//         >
//           <ChevronRight className="w-5 h-5" />
//         </Button>
//       </div>

//       {/* Slide Thumbnails */}
//       <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
//         {slides.map((slide, index) => (
//           <button
//             key={slide.id}
//             onClick={() => goToSlide(index)}
//             className={`relative shrink-0 w-32 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
//               currentSlide === index
//                 ? "border-yellow-400 ring-2 ring-yellow-400/20 scale-105"
//                 : "border-slate-700/50 hover:border-slate-600"
//             }`}
//           >
//             <div className="aspect-video relative">
//               <img
//                 src={slide.imagePath || "/placeholder.svg"}
//                 alt={`Slide ${index + 1}`}
//                 className={`w-full h-full object-cover transition-all ${
//                   isLocked(index) ? "blur-sm grayscale" : ""
//                 }`}
//               />

//               {isLocked(index) && (
//                 <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
//                   <div className="w-8 h-8 bg-slate-800/90 rounded-full flex items-center justify-center border border-slate-700">
//                     <Lock className="w-3.5 h-3.5 theme-text-muted" />
//                   </div>
//                 </div>
//               )}

//               {currentSlide === index && !isLocked(index) && (
//                 <div className="absolute inset-0 bg-yellow-400/10" />
//               )}
//             </div>
//           </button>
//         ))}
//       </div>

//       {/* Access Notice */}
//       {!hasAccess && (
//         <div className="flex items-center gap-4 p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
//           <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center shrink-0">
//             <Lock className="w-5 h-5 theme-text-muted" />
//           </div>
//           <div className="flex-1">
//             <p className="text-sm theme-text-light font-medium">
//               Limited Preview
//             </p>
//             <p className="text-sm theme-text-muted">
//               You can view the first {maxFreeSlides} slides. Request full
//               access to view all content.
//             </p>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }
"use client"

import { useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  Maximize2,
  Play,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface Slide {
  id: string
  imagePath: string
  order: number
}

interface SlideViewerProps {
  slides: Slide[]
  hasAccess: boolean
  maxFreeSlides: number
  onSlideView: (index: number) => void
}

export function SlideViewer({
  slides,
  hasAccess,
  maxFreeSlides,
  onSlideView,
}: SlideViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  /* --------------------------------------------
     SAFETY CHECK
  ---------------------------------------------*/
  if (!slides || slides.length === 0) {
    return (
      <div className="p-6 bg-slate-800 rounded-xl text-center text-slate-400">
        No slides available.
      </div>
    )
  }

  /* --------------------------------------------
     HELPERS
  ---------------------------------------------*/
  const isLocked = (index: number) =>
    index >= maxFreeSlides && !hasAccess

  const goToSlide = (index: number) => {
    if (isLocked(index)) {
      onSlideView(index)
      return
    }

    setCurrentSlide(index)
    onSlideView(index)
  }

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      goToSlide(currentSlide + 1)
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      goToSlide(currentSlide - 1)
    }
  }

  const currentImage = slides[currentSlide]?.imagePath

  /* --------------------------------------------
     RENDER
  ---------------------------------------------*/
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* ================= MAIN SLIDE ================= */}
      <div className="relative bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
        <div className="aspect-video relative">
          {currentImage ? (
            <img
              src={currentImage}
              alt={`Slide ${currentSlide + 1}`}
              className="w-full h-full object-contain bg-black"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              Slide image not found
            </div>
          )}

          {/* Slide label */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            <span className="px-3 py-1 text-xs rounded-full bg-yellow-400/20 text-yellow-400">
              Slide {currentSlide + 1} of {slides.length}
            </span>

            {!isLocked(currentSlide) && (
              <span className="px-3 py-1 text-xs rounded-full bg-slate-700 text-slate-300">
                Free Preview
              </span>
            )}
          </div>

          {/* Top-right controls (visual only for now) */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="bg-slate-800/80 border border-slate-700"
            >
              <Play className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="bg-slate-800/80 border border-slate-700"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Navigation arrows */}
        <Button
          size="icon"
          variant="ghost"
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-slate-800 border border-slate-700"
        >
          <ChevronLeft />
        </Button>

        <Button
          size="icon"
          variant="ghost"
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-slate-800 border border-slate-700"
        >
          <ChevronRight />
        </Button>
      </div>

      {/* ================= THUMBNAILS ================= */}
      <div className="flex gap-3 overflow-x-hidden pb-2">
        {slides.map((slide, index) => {
          const locked = isLocked(index)

          return (
            <button
              key={slide.id}
              onClick={() => goToSlide(index)}
              className={`relative w-32 shrink-0 rounded-xl overflow-hidden border-2 transition
                ${
                  currentSlide === index
                    ? "border-yellow-400"
                    : "border-slate-700"
                }`}
            >
              <div className="aspect-video relative">
                <img
                  src={slide.imagePath}
                  alt={`Slide ${index + 1}`}
                  className={`w-full h-full object-cover ${
                    locked ? "blur-sm grayscale" : ""
                  }`}
                />

                {locked && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-slate-300" />
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* ================= ACCESS NOTICE ================= */}
      {!hasAccess && (
        <div className="flex items-center gap-4 p-4 bg-slate-800 border border-slate-700 rounded-xl">
          <Lock className="w-5 h-5 text-slate-400" />
          <p className="text-sm text-slate-300">
            You can view the first {maxFreeSlides} slides.  
            Request access to unlock all slides.
          </p>
        </div>
      )}
    </div>
  )
}
