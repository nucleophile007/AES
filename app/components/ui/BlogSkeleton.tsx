"use client";
import React from "react";

export function BlogCardSkeleton() {
    return (
        <div className="relative p-[1px] rounded-2xl bg-gradient-to-br from-yellow-400/30 via-amber-500/30 to-yellow-600/30 animate-pulse">
            <div className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-2xl p-6 h-full">
                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
                    {/* Left tile - Student info skeleton */}
                    <div className="flex flex-col items-center lg:items-start space-y-4">
                        {/* Photo skeleton */}
                        <div className="w-32 h-32 rounded-full bg-slate-700/50" />
                        
                        {/* Name skeleton */}
                        <div className="w-full space-y-2">
                            <div className="h-6 bg-slate-700/50 rounded w-3/4 mx-auto lg:mx-0" />
                            {/* Grade badge skeleton */}
                            <div className="h-6 bg-slate-700/40 rounded-full w-20 mx-auto lg:mx-0" />
                            {/* School skeleton */}
                            <div className="h-4 bg-slate-700/30 rounded w-full" />
                            <div className="h-4 bg-slate-700/30 rounded w-2/3 mx-auto lg:mx-0" />
                        </div>
                    </div>

                    {/* Right tile - Blog content skeleton */}
                    <div className="flex-1 space-y-4">
                        {/* Title skeleton */}
                        <div className="space-y-2">
                            <div className="h-7 bg-slate-700/50 rounded w-4/5" />
                            <div className="h-7 bg-slate-700/50 rounded w-3/5" />
                        </div>
                        
                        {/* Date badge skeleton */}
                        <div className="h-6 bg-slate-700/40 rounded-full w-32" />
                        
                        {/* Abstract skeleton */}
                        <div className="space-y-2">
                            <div className="h-4 bg-slate-700/30 rounded w-full" />
                            <div className="h-4 bg-slate-700/30 rounded w-full" />
                            <div className="h-4 bg-slate-700/30 rounded w-4/5" />
                        </div>
                        
                        {/* Button skeleton */}
                        <div className="h-10 bg-slate-700/40 rounded w-40" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function BlogGridSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="space-y-6 max-w-7xl mx-auto px-4">
            {Array.from({ length: count }).map((_, i) => (
                <BlogCardSkeleton key={i} />
            ))}
        </div>
    );
}
