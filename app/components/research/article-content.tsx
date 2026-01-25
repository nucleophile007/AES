"use client"

import { useEffect, useRef } from "react"
import { Microscope, Target, Lightbulb, BookOpen, Zap, ArrowRight } from "lucide-react"
import { SlideViewer } from "./slide-viewer"
import { PresentationSection } from "./presentation-section"
import { Button } from "@/components/ui/button"

interface ArticleContentProps {
    onSectionChange: (section: string) => void
    hasAccess: boolean
    onSlideView: (index: number) => void
    onRequestAccess: () => void
}

export function ArticleContent({ onSectionChange, hasAccess, onSlideView, onRequestAccess }: ArticleContentProps) {
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
            {/* Introduction */}
            <section id="introduction" ref={setRef("introduction")} className="space-y-6">
                <p className="text-xl theme-text-light leading-relaxed font-serif">
                    Modern cancer research has shifted from trying to just kill cancer cells to understanding and using the
                    biological systems that surround them. This technical report explores two revolutionary approaches.
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="group p-5 bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700 rounded-xl hover:border-yellow-400/30 transition-all duration-300">
                        <div className="w-10 h-10 bg-yellow-400/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-yellow-400/20 transition-colors">
                            <Microscope className="w-5 h-5 text-yellow-400" />
                        </div>
                        <h3 className="font-semibold theme-text-light mb-2">Activity-based Nanosensors</h3>
                        <p className="text-sm theme-text-muted leading-relaxed">
                            Revolutionary early detection through molecular-scale sensors that respond to cancer biomarkers.
                        </p>
                    </div>

                    <div className="group p-5 bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700 rounded-xl hover:border-yellow-400/30 transition-all duration-300">
                        <div className="w-10 h-10 bg-yellow-400/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-yellow-400/20 transition-colors">
                            <Target className="w-5 h-5 text-yellow-400" />
                        </div>
                        <h3 className="font-semibold theme-text-light mb-2">CAR-T Cell Therapy</h3>
                        <p className="text-sm theme-text-muted leading-relaxed">
                            Genetically engineered immune cells designed to target and destroy cancer with precision.
                        </p>
                    </div>
                </div>

                <p className="theme-text-muted leading-relaxed">
                    Both approaches share a foundation in molecular targeting and biological specificity—using receptor-ligand
                    interactions to transform microscopic molecular events into actionable medical interventions.
                </p>
            </section>

            {/* CTA Box */}
            <div className="relative overflow-hidden bg-gradient-to-r from-yellow-400/10 via-yellow-400/5 to-yellow-400/10 border border-yellow-400/20 rounded-2xl p-6 md:p-8">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-2xl" />
                <div className="relative flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                        <h3 className="font-semibold text-lg theme-text-light mb-2 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-400" />
                            Explore Cancer Research with Expert Guidance
                        </h3>
                        <p className="theme-text-muted">
                            Work with a research mentor to dive deeper into immunotherapy, nanotechnology, or other cutting-edge
                            cancer research topics.
                        </p>
                    </div>
                    <Button className="shrink-0 gap-2">
                        Learn More <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Nanosensor Detection */}
            <section id="nanosensor-detection" ref={setRef("nanosensor-detection")} className="space-y-6">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400/20 to-yellow-400/5 rounded-xl flex items-center justify-center">
                        <Microscope className="w-6 h-6 text-yellow-400" />
                    </div>
                    <h2 className="text-3xl font-serif font-semibold theme-text-light">Nanosensor Detection</h2>
                </div>

                <p className="theme-text-muted leading-relaxed">
                    Activity-based nanosensors represent a paradigm shift in cancer detection. Developed by researchers at MIT and
                    Harvard, these sensors detect tumors as small as a few millimeters by responding to enzymes (proteases like
                    MMP9) overexpressed in cancerous tissue.
                </p>

                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-lg font-semibold theme-text-light mb-4">How Nanosensors Work</h3>
                    <p className="theme-text-muted leading-relaxed mb-5">
                        The nanosensors are coated with peptide substrates that are cleaved by tumor-associated proteases. When
                        these substrates are cleaved, they release synthetic biomarkers that are small enough to be filtered by the
                        kidneys and detected in urine—enabling completely non-invasive early detection.
                    </p>
                    <ul className="space-y-3">
                        {[
                            "Utilizes the Enhanced Permeability and Retention (EPR) effect",
                            "Detects protease activity specific to tumor microenvironment",
                            "Non-invasive detection through urine analysis",
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <span className="w-6 h-6 bg-yellow-400/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="w-2 h-2 bg-yellow-400 rounded-full" />
                                </span>
                                <span className="theme-text-muted">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* CAR-T Therapy */}
            <section id="car-t-therapy" ref={setRef("car-t-therapy")} className="space-y-6">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400/20 to-yellow-400/5 rounded-xl flex items-center justify-center">
                        <Target className="w-6 h-6 text-yellow-400" />
                    </div>
                    <h2 className="text-3xl font-serif font-semibold theme-text-light">CAR-T Cell Therapy</h2>
                </div>

                <p className="theme-text-muted leading-relaxed">
                    Chimeric Antigen Receptor T-cell (CAR-T) therapy represents one of the most promising advances in cancer
                    immunotherapy. This approach takes a patient&apos;s own T-cells and genetically modifies them to target and destroy
                    cancer cells with unprecedented precision.
                </p>

                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-lg font-semibold theme-text-light mb-5">The CAR-T Engineering Process</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {[
                            { step: "01", title: "Collection", desc: "T-cells are extracted from the patient's blood" },
                            {
                                step: "02",
                                title: "Modification",
                                desc: "Cells are genetically engineered to express chimeric antigen receptors",
                            },
                            { step: "03", title: "Expansion", desc: "Modified cells are multiplied in the laboratory" },
                            { step: "04", title: "Infusion", desc: "CAR-T cells are infused back into the patient" },
                        ].map((item) => (
                            <div key={item.step} className="flex gap-4 p-4 bg-slate-900/30 rounded-lg">
                                <span className="text-2xl font-mono font-bold text-yellow-400/40">{item.step}</span>
                                <div>
                                    <h4 className="font-semibold theme-text-light mb-1">{item.title}</h4>
                                    <p className="text-sm theme-text-muted">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="theme-text-muted leading-relaxed">
                    These engineered receptors can target tumor-specific antigens like EGFRvIII or IL-13Rα2, allowing the T-cells
                    to recognize and attack cancer cells while largely sparing healthy tissue.
                </p>
            </section>

            {/* Research Slides */}
            <section id="research-slides" ref={setRef("research-slides")} className="space-y-6">
                <h2 className="text-3xl font-serif font-semibold theme-text-light">Research Slides</h2>
                <p className="theme-text-muted">
                    Explore the visual presentation of this research. The first 2 slides are freely available—request full access
                    to view the complete presentation.
                </p>
                <SlideViewer onSlideView={onSlideView} hasAccess={hasAccess} maxFreeSlides={2} />
            </section>

            {/* Presentation */}
            <section id="presentation" ref={setRef("presentation")} className="space-y-6">
                <h2 className="text-3xl font-serif font-semibold theme-text-light">Presentation</h2>
                <p className="theme-text-muted">Download or view the full PowerPoint presentation for this research.</p>
                <PresentationSection hasAccess={hasAccess} onRequestAccess={onRequestAccess} />
            </section>

            {/* Future Implications */}
            <section id="future-implications" ref={setRef("future-implications")} className="space-y-6">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400/20 to-yellow-400/5 rounded-xl flex items-center justify-center">
                        <Lightbulb className="w-6 h-6 text-yellow-400" />
                    </div>
                    <h2 className="text-3xl font-serif font-semibold theme-text-light">Future Implications</h2>
                </div>

                <div className="bg-gradient-to-br from-slate-800 via-slate-800 to-yellow-400/5 border border-slate-700 rounded-xl p-6 md:p-8">
                    <p className="text-lg theme-text-light leading-relaxed mb-4 font-serif">
                        The convergence of nanosensor technology and CAR-T therapy opens new possibilities for personalized cancer
                        treatment.
                    </p>
                    <p className="theme-text-muted leading-relaxed">
                        Imagine a future where nanosensors detect cancer at its earliest stages, and CAR-T cells—guided by similar
                        molecular targeting principles—eliminate tumors before they can spread. The future of cancer medicine lies
                        in manipulating these precise molecular interactions with accuracy and intelligence, combining early
                        detection with targeted treatment for truly personalized care.
                    </p>
                </div>
            </section>

            {/* Sources */}
            <section id="sources" ref={setRef("sources")} className="space-y-6 pt-8 border-t border-slate-700">
                <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-yellow-400" />
                    <h2 className="text-xl font-semibold theme-text-light">Sources & References</h2>
                </div>
                <div className="space-y-3">
                    {[
                        {
                            authors: "Kwon, E. J. et al.",
                            year: "2017",
                            title: "Ultrasensitive tumour-penetrating nanosensors of protease activity.",
                            journal: "Nature Biomedical Engineering",
                        },
                        {
                            authors: "Hin Chau, C. et al.",
                            year: "2023",
                            title: "CAR-T cell therapy: A promising alternative to traditional glioblastoma treatment.",
                            journal: "NHSJS",
                        },
                        {
                            authors: "National Cancer Institute",
                            year: "2024",
                            title: "CAR T-Cell Therapy Overview.",
                            journal: "cancer.gov",
                        },
                    ].map((ref, i) => (
                        <div
                            key={i}
                            className="group flex gap-4 p-4 bg-slate-800/50 border border-slate-700/50 rounded-lg hover:border-slate-600 transition-colors"
                        >
                            <span className="text-sm font-mono text-slate-600">[{i + 1}]</span>
                            <div>
                                <p className="text-sm theme-text-muted">
                                    <span className="theme-text-light">{ref.authors}</span> ({ref.year}). {ref.title}
                                    <span className="text-yellow-400 ml-1">{ref.journal}</span>
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}
