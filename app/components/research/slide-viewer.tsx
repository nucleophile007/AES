"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Lock, Maximize2, Play } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SlideViewerProps {
    onSlideView: (index: number) => void
    hasAccess: boolean
    maxFreeSlides: number
}

const slides = [
    {
        title: "Introduction to Cancer Research",
        description: "Overview of modern approaches combining detection and treatment",
        image: "/cancer-research-presentation-slide-introduction-ce.jpg",
    },
    {
        title: "Nanosensor Technology",
        description: "How activity-based nanosensors detect tumor proteases",
        image: "/nanosensor-technology-medical-nanoparticles-diagra.jpg",
    },
    {
        title: "CAR-T Cell Engineering",
        description: "Genetic modification of T-cells for targeted therapy",
        image: "/car-t-cell-engineering-immune-cells-diagram.jpg",
    },
    {
        title: "Tumor Microenvironment",
        description: "Navigating the complex ecosystem surrounding tumors",
        image: "/tumor-microenvironment-cellular-biology-diagram.jpg",
    },
    {
        title: "Future of Cancer Medicine",
        description: "Combining detection and treatment for personalized care",
        image: "/future-cancer-medicine-technology-research.jpg",
    },
]

export function SlideViewer({ onSlideView, hasAccess, maxFreeSlides }: SlideViewerProps) {
    const [currentSlide, setCurrentSlide] = useState(0)

    const goToSlide = (index: number) => {
        if (index >= maxFreeSlides && !hasAccess) {
            onSlideView(index)
            return
        }
        setCurrentSlide(index)
        onSlideView(index)
    }

    const nextSlide = () => {
        const next = currentSlide + 1
        if (next < slides.length) {
            goToSlide(next)
        }
    }

    const prevSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1)
        }
    }

    const isLocked = (index: number) => index >= maxFreeSlides && !hasAccess

    return (
        <div className="space-y-5">
            {/* Main Slide Display */}
            <div className="relative bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-lg shadow-black/10">
                <div className="aspect-video relative">
                    <img
                        src={slides[currentSlide].image || "/placeholder.svg"}
                        alt={slides[currentSlide].title}
                        className="w-full h-full object-cover"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />

                    {/* Slide Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2.5 py-1 bg-yellow-400/20 backdrop-blur-sm text-yellow-400 text-xs font-medium rounded-full">
                                Slide {currentSlide + 1} of {slides.length}
                            </span>
                            {!isLocked(currentSlide) && (
                                <span className="px-2.5 py-1 bg-slate-800/80 backdrop-blur-sm theme-text-muted text-xs rounded-full">
                                    Free Preview
                                </span>
                            )}
                        </div>
                        <h3 className="text-xl font-semibold theme-text-light mb-1">{slides[currentSlide].title}</h3>
                        <p className="text-sm theme-text-muted">{slides[currentSlide].description}</p>
                    </div>

                    {/* Controls */}
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="bg-slate-800/80 backdrop-blur-sm hover:bg-slate-700 border border-slate-700/50"
                        >
                            <Play className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="bg-slate-800/80 backdrop-blur-sm hover:bg-slate-700 border border-slate-700/50"
                        >
                            <Maximize2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Navigation Arrows */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 shadow-lg"
                    onClick={prevSlide}
                    disabled={currentSlide === 0}
                >
                    <ChevronLeft className="w-5 h-5" />
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 shadow-lg"
                    onClick={nextSlide}
                    disabled={currentSlide === slides.length - 1}
                >
                    <ChevronRight className="w-5 h-5" />
                </Button>
            </div>

            {/* Slide Thumbnails */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {slides.map((slide, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`relative shrink-0 w-32 rounded-xl overflow-hidden border-2 transition-all duration-200 ${currentSlide === index
                                ? "border-yellow-400 ring-2 ring-yellow-400/20 scale-105"
                                : "border-slate-700/50 hover:border-slate-600"
                            }`}
                    >
                        <div className="aspect-video relative">
                            <img
                                src={slide.image || "/placeholder.svg"}
                                alt={slide.title}
                                className={`w-full h-full object-cover transition-all ${isLocked(index) ? "blur-sm grayscale" : ""}`}
                            />
                            {isLocked(index) && (
                                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
                                    <div className="w-8 h-8 bg-slate-800/90 rounded-full flex items-center justify-center border border-slate-700">
                                        <Lock className="w-3.5 h-3.5 theme-text-muted" />
                                    </div>
                                </div>
                            )}
                            {currentSlide === index && !isLocked(index) && <div className="absolute inset-0 bg-yellow-400/10" />}
                        </div>
                    </button>
                ))}
            </div>

            {/* Access Notice */}
            {!hasAccess && (
                <div className="flex items-center gap-4 p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
                    <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center shrink-0">
                        <Lock className="w-5 h-5 theme-text-muted" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm theme-text-light font-medium">Limited Preview</p>
                        <p className="text-sm theme-text-muted">
                            You can view the first {maxFreeSlides} slides. Request full access to view all content.
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
