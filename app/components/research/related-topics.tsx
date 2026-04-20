import Link from "next/link"
import { Tag, ArrowUpRight } from "lucide-react"

const topics = [
    { label: "Immunotherapy", href: "#", count: 12 },
    { label: "Nanotechnology", href: "#", count: 8 },
    { label: "Oncology", href: "#", count: 24 },
    { label: "Biomedical Engineering", href: "#", count: 15 },
]

export function RelatedTopics() {
    return (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold theme-text-light mb-4">
                <Tag className="w-4 h-4 text-yellow-400" />
                Related Topics
            </h3>
            <div className="space-y-2">
                {topics.map((topic) => (
                    <Link
                        key={topic.label}
                        href={topic.href}
                        className="group flex items-center justify-between px-3 py-2.5 bg-slate-900/30 border border-slate-700/50 rounded-lg hover:border-yellow-400/50 hover:bg-yellow-400/5 transition-all duration-200"
                    >
                        <span className="text-sm theme-text-muted group-hover:text-yellow-400 transition-colors">
                            {topic.label}
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-600">{topic.count}</span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-yellow-400 transition-colors" />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
