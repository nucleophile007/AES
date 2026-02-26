// "use client"

// import { cn } from "@/lib/utils"
// import { List } from "lucide-react"

// interface TOCItem {
//     id: string
//     label: string
// }

// interface TableOfContentsProps {
//     items: TOCItem[]
//     activeSection: string
// }

// export function TableOfContents({ items, activeSection }: TableOfContentsProps) {
//     return (
//         <nav className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-5">
//             <h3 className="flex items-center gap-2 text-sm font-semibold theme-text-light mb-4">
//                 <List className="w-4 h-4 text-yellow-400" />
//                 Table of Contents
//             </h3>
//             <ul className="space-y-1">
//                 {items.map((item, index) => (
//                     <li key={item.id}>
//                         <a
//                             href={`#${item.id}`}
//                             className={cn(
//                                 "group flex items-center gap-3 text-sm py-2 px-3 rounded-lg transition-all duration-200",
//                                 activeSection === item.id
//                                     ? "bg-yellow-400/10 text-yellow-400 font-medium"
//                                     : "theme-text-muted hover:text-yellow-400 hover:bg-slate-900/50",
//                             )}
//                         >
//                             <span
//                                 className={cn(
//                                     "w-6 h-6 flex items-center justify-center rounded-md text-xs font-mono transition-colors",
//                                     activeSection === item.id
//                                         ? "bg-yellow-400 text-slate-900"
//                                         : "bg-slate-900 theme-text-muted group-hover:bg-slate-700",
//                                 )}
//                             >
//                                 {String(index + 1).padStart(2, "0")}
//                             </span>
//                             {item.label}
//                         </a>
//                     </li>
//                 ))}
//             </ul>
//         </nav>
//     )
// }
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
    <nav className="relative bg-slate-800/60 backdrop-blur-md border border-slate-700/70 rounded-2xl p-5 shadow-lg shadow-black/20">
      {/* Header */}
      <h3 className="flex items-center gap-2 text-sm font-semibold theme-text-light mb-5">
        <List className="w-4 h-4 text-yellow-400" />
        Table of Contents
      </h3>

      {/* Items */}
      <ul className="space-y-1">
        {items.map((item, index) => {
          const isActive = activeSection === item.id

          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={cn(
                  "relative group flex items-center gap-3 text-sm px-3 py-2.5 rounded-lg transition-all duration-200",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/40",
                  isActive
                    ? "bg-yellow-400/10 text-yellow-400"
                    : "theme-text-muted hover:text-yellow-400 hover:bg-slate-900/50",
                )}
              >
                {/* Active indicator */}
                <span
                  className={cn(
                    "absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-full transition-all",
                    isActive ? "bg-yellow-400" : "bg-transparent group-hover:bg-slate-700",
                  )}
                />

                {/* Index */}
                <span
                  className={cn(
                    "w-6 h-6 flex items-center justify-center rounded-md text-[11px] font-mono transition-colors shrink-0",
                    isActive
                      ? "bg-yellow-400 text-slate-900"
                      : "bg-slate-900 theme-text-muted group-hover:bg-slate-700",
                  )}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                {/* Label */}
                <span className="leading-snug">
                  {item.label}
                </span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}