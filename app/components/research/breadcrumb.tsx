import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

interface BreadcrumbProps {
    title?: string
}

export function Breadcrumb({ title }: BreadcrumbProps) {
    return (
        <nav className="flex items-center gap-1.5 text-sm">
            <Link
                href="/"
                className="flex items-center gap-1.5 theme-text-muted hover:text-yellow-400 transition-colors"
            >
                <Home className="w-4 h-4" />
                <span className="sr-only sm:not-sr-only">Blog</span>
            </Link>
            <ChevronRight className="w-4 h-4 text-slate-600" />
            <Link href="/research" className="theme-text-muted hover:text-yellow-400 transition-colors">
                Research Showcase
            </Link>
            {title && (
                <>
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                    <span className="text-yellow-400 font-medium truncate max-w-[300px] sm:max-w-none">
                        {title}
                    </span>
                </>
            )}
        </nav>
    )
}
