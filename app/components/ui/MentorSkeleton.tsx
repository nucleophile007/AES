"use client";
import React from "react";
import { motion } from "framer-motion";

export function MentorCardSkeleton() {
    return (
        <div className="relative p-[1px] rounded-2xl bg-gradient-to-br from-yellow-400/30 via-amber-500/30 to-yellow-600/30 animate-pulse">
            <div className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-2xl p-8 h-full">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Image skeleton */}
                    <div className="md:w-80 flex-shrink-0">
                        <div className="w-48 h-48 mx-auto mb-6 rounded-2xl bg-slate-700/50" />
                        <div className="space-y-2 text-center">
                            <div className="h-6 bg-slate-700/50 rounded w-3/4 mx-auto" />
                            <div className="h-4 bg-slate-700/40 rounded w-1/2 mx-auto" />
                        </div>
                    </div>
                    {/* Content skeleton */}
                    <div className="flex-1 space-y-6">
                        <div className="space-y-3">
                            <div className="h-4 bg-slate-700/50 rounded w-1/4" />
                            <div className="h-5 bg-slate-700/40 rounded w-3/4" />
                            <div className="h-4 bg-slate-700/30 rounded w-1/2" />
                        </div>
                        <div className="h-px bg-slate-700" />
                        <div className="space-y-3">
                            <div className="h-4 bg-slate-700/50 rounded w-1/4" />
                            <div className="h-16 bg-slate-700/30 rounded w-full" />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-6 bg-slate-700/40 rounded-full w-20" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function MentorGridSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4">
            {Array.from({ length: count }).map((_, i) => (
                <MentorCardSkeleton key={i} />
            ))}
        </div>
    );
}

export function FacultyCardSkeleton() {
    return (
        <div className="h-full border-2 border-brand-blue/10 rounded-lg bg-white animate-pulse">
            <div className="p-6 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-200" />
                <div className="h-5 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
                <div className="h-4 bg-gray-100 rounded w-1/2 mx-auto mb-2" />
                <div className="h-5 bg-orange-100 rounded-full w-16 mx-auto" />
            </div>
            <div className="px-6 pb-6 space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-3/4" />
                </div>
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                    <div className="flex flex-wrap gap-1">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-5 bg-gray-100 rounded w-16" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function FacultyGridSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: count }).map((_, i) => (
                <FacultyCardSkeleton key={i} />
            ))}
        </div>
    );
}
