"use client"

import { useEffect, useRef } from "react"
import { SlideViewer } from "./slide-viewer"
import { TechnicalReportSection } from "./technical-report-section"

interface ArticleContentProps {
    slides: {
        id: string
        imagePath: string
        order: number
    }[]
    onSectionChange: (section: string) => void
    hasAccess: boolean
    onSlideView: (index: number) => void
    onViewPDF: () => void
    onDownloadPDF: () => void
    onRequestAccess: () => void
    extractedContent?: {
        sections?: Array<{
            id: string
            order: number
            title: string
            summary: string
            keyPoints: string[]
        }>
    } | null
}


export function ArticleContent({
    slides,
    onSectionChange,
    hasAccess,
    onSlideView,
    onViewPDF,
    onDownloadPDF,
    onRequestAccess,
    extractedContent,
}: ArticleContentProps)
{
    const sectionsRef = useRef<Map<string, HTMLElement>>(new Map())

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        onSectionChange(entry.target.id)
                    }
                })
            },
            { rootMargin: "-100px 0px -66% 0px" },
        )

        sectionsRef.current.forEach((section) => {
            observer.observe(section)
        })

        return () => observer.disconnect()
    }, [onSectionChange])

    const setRef = (id: string) => (el: HTMLElement | null) => {
        if (el) sectionsRef.current.set(id, el)
    }

    return (
        <div className="space-y-16">
            {/* Dynamic Sections from Extracted Content */}
            {extractedContent?.sections && extractedContent.sections.length > 0 ? (
                extractedContent.sections.map((section, index) => {
                    const isEven = index % 2 === 0
                    const sectionStyle = index % 3 // Creates 3 different styles rotating
                    
                    return (
                        <section 
                            key={section.id} 
                            id={section.id} 
                            ref={setRef(section.id)} 
                            className="space-y-6 scroll-mt-28"
                        >
                            {/* Alternating header styles */}
                            {isEven ? (
                                // Style 1: Icon on left with gradient background
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="w-14 h-14 bg-gradient-to-br from-yellow-400/20 via-yellow-400/10 to-transparent rounded-xl flex items-center justify-center border border-yellow-400/20 shrink-0">
                                        <span className="text-yellow-400 font-bold text-xl">{index + 1}</span>
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-3xl font-serif font-bold theme-text-light leading-tight">
                                            {section.title}
                                        </h2>
                                    </div>
                                </div>
                            ) : (
                                // Style 2: Full-width header with different styling
                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-1 w-12 bg-gradient-to-r from-yellow-400 to-transparent rounded"></div>
                                        <span className="text-sm font-mono font-semibold text-yellow-400/80 tracking-wider">
                                            SECTION {String(index + 1).padStart(2, '0')}
                                        </span>
                                    </div>
                                    <h2 className="text-3xl font-serif font-bold theme-text-light">
                                        {section.title}
                                    </h2>
                                </div>
                            )}

                            {/* Varied content styles based on section position */}
                            {sectionStyle === 0 ? (
                                // Style 1: Simple paragraphs with subtle background
                                <div className="space-y-5">
                                    <p className="text-base theme-text-muted leading-relaxed">
                                        {section.summary}
                                    </p>
                                    {section.keyPoints.map((point, i) => (
                                        <p key={i} className="text-base theme-text-muted leading-relaxed">
                                            {point}
                                        </p>
                                    ))}
                                </div>
                            ) : sectionStyle === 1 ? (
                                // Style 2: Content in a bordered box with gradient
                                <div className="bg-gradient-to-br from-slate-800/30 via-slate-800/20 to-transparent border border-slate-700/50 rounded-2xl p-6 md:p-8 space-y-5">
                                    <p className="text-base theme-text-muted leading-relaxed">
                                        {section.summary}
                                    </p>
                                    {section.keyPoints.map((point, i) => (
                                        <p key={i} className="text-base theme-text-muted leading-relaxed pl-4 border-l-2 border-yellow-400/30">
                                            {point}
                                        </p>
                                    ))}
                                </div>
                            ) : (
                                // Style 3: CTA-style with highlighted first paragraph
                                <div className="space-y-6">
                                    <div className="relative overflow-hidden bg-gradient-to-r from-yellow-400/10 via-yellow-400/5 to-yellow-400/10 border border-yellow-400/20 rounded-2xl p-6 md:p-8">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-2xl" />
                                        <p className="relative text-lg theme-text-light leading-relaxed font-serif">
                                            {section.summary}
                                        </p>
                                    </div>
                                    <div className="space-y-5">
                                        {section.keyPoints.map((point, i) => (
                                            <p key={i} className="text-base theme-text-muted leading-relaxed">
                                                {point}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Optional: Show key highlights box for first two sections */}
                            {index < 2 && section.keyPoints.length > 3 && (
                                <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-6 mt-6">
                                    <h3 className="text-sm font-semibold text-yellow-400/80 mb-4 uppercase tracking-wide flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>
                                        Quick Overview
                                    </h3>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {section.keyPoints.slice(0, 4).map((point, i) => (
                                            <div key={i} className="flex items-start gap-2">
                                                <span className="w-1.5 h-1.5 bg-yellow-400/60 rounded-full shrink-0 mt-2"></span>
                                                <span className="theme-text-muted text-sm leading-relaxed">{point.split('.')[0]}.</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>
                    )
                })
            ) : (
                <section id="introduction" ref={setRef("introduction")} className="space-y-6">
                    <p className="text-xl theme-text-light leading-relaxed font-serif">
                        Content is being processed. Please check back later for detailed research information.
                    </p>
                </section>
            )}

            {/* Research Slides */}
            <section id="research-slides" ref={setRef("research-slides")} className="space-y-6">
                <h2 className="text-3xl font-serif font-semibold theme-text-light">Research Slides</h2>
                <p className="theme-text-muted">
                    Explore the visual presentation of this research. The first 2 slides are freely available—request full access
                    to view the complete presentation.
                </p>
                <SlideViewer
                    slides={slides}
                    onSlideView={onSlideView}
                    hasAccess={hasAccess}
                    maxFreeSlides={2}
                />
            </section>

            {/* Technical Report */}
            <section
            id="technical-report"
            ref={setRef("technical-report")}
            className="space-y-6"
            >
            <h2 className="text-3xl font-serif font-semibold theme-text-light">
                Technical Report
            </h2>

            <TechnicalReportSection
                hasAccess={hasAccess}
                onRequestAccess={onRequestAccess}
                onViewReport={onViewPDF}
                onDownloadReport={onDownloadPDF}
            />
            </section>
        </div>
    )
}
