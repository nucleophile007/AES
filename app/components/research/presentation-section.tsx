"use client"

import { FileText, Lock, Download, ExternalLink, Presentation } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PresentationSectionProps {
    hasAccess: boolean
    onRequestAccess: () => void
}

export function PresentationSection({ hasAccess, onRequestAccess }: PresentationSectionProps) {
    return (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
            <div className="flex flex-col md:flex-row">
                {/* PPT Preview Placeholder */}
                <div className="relative w-full md:w-80 shrink-0 bg-gradient-to-br from-slate-900 to-slate-800/50">
                    <div className="aspect-[4/3] flex items-center justify-center p-8">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400/20 to-yellow-400/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-yellow-400/20">
                                <Presentation className="w-10 h-10 text-yellow-400" />
                            </div>
                            <p className="text-sm font-medium theme-text-light">PowerPoint Presentation</p>
                            <p className="text-xs theme-text-muted mt-1">25 slides • 4.2 MB</p>
                        </div>
                    </div>
                    {!hasAccess && (
                        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-slate-800/90 rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-700">
                                    <Lock className="w-5 h-5 theme-text-muted" />
                                </div>
                                <p className="text-sm theme-text-muted">Request access to view</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Info Section */}
                <div className="flex-1 p-6 md:p-8 space-y-5">
                    <div>
                        <h3 className="text-xl font-semibold theme-text-light mb-2">Full Research Presentation</h3>
                        <p className="theme-text-muted leading-relaxed">
                            Access the complete presentation covering CAR-T Cell Therapy and Nanosensor Detection. Includes diagrams,
                            data visualizations, and comprehensive analysis.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-3">
                        {[
                            { label: "Visual aids & diagrams" },
                            { label: "Molecular biology" },
                            { label: "Research findings" },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-2 p-3 bg-slate-900/30 rounded-lg">
                                <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                                <span className="text-sm theme-text-muted">{item.label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-wrap gap-3 pt-2">
                        {hasAccess ? (
                            <>
                                <Button className="gap-2">
                                    <Download className="w-4 h-4" />
                                    Download PPT
                                </Button>
                                <Button variant="outline" className="gap-2">
                                    <ExternalLink className="w-4 h-4" />
                                    View Online
                                </Button>
                            </>
                        ) : (
                            <Button onClick={onRequestAccess} className="gap-2">
                                <Lock className="w-4 h-4" />
                                Request Full Access
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
