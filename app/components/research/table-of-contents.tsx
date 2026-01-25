"use client"

import { cn } from "@/lib/utils"
import { List } from "lucide-react"

interface TOCItem {
    id: string
    label: string
}

interface TableOfContentsProps {
    items: TOCItem[]
    activeSection: string
}

export function TableOfContents({ items, activeSection }: TableOfContentsProps) {
    return (
        <nav className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold theme-text-light mb-4">
                <List className="w-4 h-4 text-yellow-400" />
                Table of Contents
            </h3>
            <ul className="space-y-1">
                {items.map((item, index) => (
                    <li key={item.id}>
                        <a
                            href={`#${item.id}`}
                            className={cn(
                                "group flex items-center gap-3 text-sm py-2 px-3 rounded-lg transition-all duration-200",
                                activeSection === item.id
                                    ? "bg-yellow-400/10 text-yellow-400 font-medium"
                                    : "theme-text-muted hover:text-yellow-400 hover:bg-slate-900/50",
                            )}
                        >
                            <span
                                className={cn(
                                    "w-6 h-6 flex items-center justify-center rounded-md text-xs font-mono transition-colors",
                                    activeSection === item.id
                                        ? "bg-yellow-400 text-slate-900"
                                        : "bg-slate-900 theme-text-muted group-hover:bg-slate-700",
                                )}
                            >
                                {String(index + 1).padStart(2, "0")}
                            </span>
                            {item.label}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    )
}
