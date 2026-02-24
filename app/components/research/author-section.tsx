// import Link from "next/link"
// import { Clock, Calendar, Share2, Bookmark } from "lucide-react"
// import { Button } from "@/components/ui/button"

// export function AuthorSection() {
//     return (
//         <div className="flex flex-col sm:flex-row sm:items-center gap-6 pt-6 border-t border-slate-700/50">
//             {/* Author Info */}
//             <Link href="#" className="flex items-center gap-4 group">
//                 <div className="relative">
//                     <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400/20 to-yellow-400/5 p-0.5">
//                         <div className="w-full h-full rounded-full overflow-hidden bg-slate-800">
//                             <img
//                                 src="/professional-researcher-portrait-avatar.jpg"
//                                 alt="Arshia Sompura"
//                                 className="w-full h-full object-cover"
//                             />
//                         </div>
//                     </div>
//                     <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-yellow-400 rounded-full border-2 border-slate-900" />
//                 </div>
//                 <div>
//                     <p className="font-semibold theme-text-light group-hover:text-yellow-400 transition-colors">Arshia Sompura</p>
//                     <p className="text-sm theme-text-muted">Student</p>
//                 </div>
//             </Link>

//             {/* Metadata */}
//             <div className="flex flex-wrap items-center gap-4 text-sm theme-text-muted sm:ml-auto">
//                 <span className="flex items-center gap-1.5">
//                     <Calendar className="w-4 h-4" />
//                     Dec 15, 2024
//                 </span>
//                 <span className="flex items-center gap-1.5">
//                     <Clock className="w-4 h-4" />
//                     8 min read
//                 </span>
//             </div>

//             {/* Actions */}
//             <div className="flex items-center gap-2">
//                 <Button variant="ghost" size="icon" className="theme-text-muted hover:text-yellow-400 hover:bg-slate-800">
//                     <Bookmark className="w-4 h-4" />
//                 </Button>
//                 <Button variant="ghost" size="icon" className="theme-text-muted hover:text-yellow-400 hover:bg-slate-800">
//                     <Share2 className="w-4 h-4" />
//                 </Button>
//             </div>
//         </div>
//     )
// }
import { Calendar } from "lucide-react"

interface AuthorSectionProps {
  author?: string | null
  createdAt: Date
}

export function AuthorSection({ author, createdAt }: AuthorSectionProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-6 pt-6 border-t border-slate-700/50">
      {/* Author Info */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400/20 to-yellow-400/5 flex items-center justify-center border border-yellow-400/20">
          <span className="text-lg font-semibold text-yellow-400">
            {author ? author.charAt(0).toUpperCase() : "A"}
          </span>
        </div>

        <div>
          <p className="font-semibold theme-text-light">
            {author || "Acharya Research Team"}
          </p>
          <p className="text-sm theme-text-muted">Student</p>
        </div>
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-4 text-sm theme-text-muted sm:ml-auto">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4" />
          {createdAt.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
    </div>
  )
}
