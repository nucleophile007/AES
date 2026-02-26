import { Calendar } from "lucide-react"

interface AuthorSectionProps {
  author?: string | null
  grade?: string | null
  school?: string | null
  createdAt: Date
}

export function AuthorSection({ author, grade, school, createdAt }: AuthorSectionProps) {
  return (
    <div className="mt-10 pt-6 border-t border-slate-700/40">
      <div className="flex flex-col sm:flex-row sm:items-center gap-6">

        {/* Left Accent */}
        <div className="hidden sm:block w-px self-stretch bg-slate-700/40" />

        {/* Author Block */}
        {/* Signature Block */}
<div className="flex items-center gap-4">

  {/* Avatar - simpler and darker */}
  <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
    <span className="text-sm font-semibold text-slate-200">
      {author ? author.charAt(0).toUpperCase() : "A"}
    </span>
  </div>

  {/* Text Content */}
  <div className="leading-tight">
    
    {/* Name */}
    <p className="text-sm font-semibold text-slate-100 tracking-wide">
      {author || "Acharya Research Team"}
    </p>

    {/* Grade */}
    {grade && (
      <p className="text-xs text-slate-400 mt-1">
        Grade {grade}
      </p>
    )}

    {/* School */}
    {school && (
      <p className="text-xs text-slate-400 mt-0.5">
        {school}
      </p>
    )}

  </div>
</div>

        {/* Date */}
        <div className="sm:ml-auto text-xs theme-text-muted flex items-center gap-1.5">
          <Calendar className="w-4 h-4 opacity-70" />
          <span className="tracking-wide">
            {createdAt.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </div>
    </div>
  )
}
// import { Calendar } from "lucide-react"
// import Image from "next/image"

// interface AuthorSectionProps {
//   author?: string | null
//   grade?: string | null
//   school?: string | null
//   createdAt: Date
// }

// // School logo mapping based on testimonials pattern
// const getSchoolLogo = (schoolName: string | null): string => {
//   if (!schoolName) return "/testimonial-logos/default.png"
  
//   // Normalize input: trim whitespace and convert to lowercase
//   const normalized = schoolName.trim().toLowerCase()
  
//   // School logo mapping with keywords for flexible matching
//   const schoolLogos: Array<{ keywords: string[]; logo: string }> = [
//     {
//       keywords: ["raleigh charter", "raleigh"],
//       logo: "/testimonial-logos/Raleigh_Charter__NC__Phoenix_logo.png.webp",
//     },
//     {
//       keywords: ["west park"],
//       logo: "/testimonial-logos/WestParkHighSchool.png",
//     },
//     {
//       keywords: ["folsom"],
//       logo: "/testimonial-logos/folsom.png",
//     },
//     {
//       keywords: ["granite bay", "granite"],
//       logo: "/testimonial-logos/GraniteBayHighSchool.png",
//     },
//     {
//       keywords: ["vista del lago", "vista"],
//       logo: "/testimonial-logos/VistaDelLagoHS-GraphicsTransparent.png",
//     },
//     {
//       keywords: ["rocklin"],
//       logo: "/testimonial-logos/rocklin.jpg",
//     },
//     {
//       keywords: ["sutter"],
//       logo: "/testimonial-logos/folsom.png",
//     },
//   ]
  
//   // Find matching school by checking if any keyword is in the normalized name
//   for (const school of schoolLogos) {
//     if (school.keywords.some(keyword => normalized.includes(keyword))) {
//       return school.logo
//     }
//   }
  
//   // Default fallback
//   return "/testimonial-logos/default.png"
// }

// export function AuthorSection({ author, grade, school, createdAt }: AuthorSectionProps) {
//   return (
//     <div className="flex flex-col sm:flex-row sm:items-center gap-6 pt-6 border-t border-slate-700/50">
//       {/* Author Info */}
//       <div className="flex items-center gap-4">
//         <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400/20 to-yellow-400/5 flex items-center justify-center border border-yellow-400/20">
//           <span className="text-lg font-semibold text-yellow-400">
//             {author ? author.charAt(0).toUpperCase() : "A"}
//           </span>
//         </div>

//         <div className="flex-1">
//           <p className="font-semibold theme-text-light">
//             {author || "Acharya Research Team"}
//           </p>
//           {grade && (
//             <p className="text-sm theme-text-muted mt-0.5">
//               Grade {grade}
//             </p>
//           )}
//           {school && (
//             <div className="flex items-center gap-2 mt-1">
//               <div className="relative w-5 h-5 flex-shrink-0">
//                 <Image
//                   src={getSchoolLogo(school)}
//                   alt={school}
//                   fill
//                   className="object-contain"
//                 />
//               </div>
//               <p className="text-xs theme-text-muted">
//                 {school}
//               </p>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Metadata */}
//       <div className="flex items-center gap-4 text-sm theme-text-muted sm:ml-auto">
//         <span className="flex items-center gap-1.5">
//           <Calendar className="w-4 h-4" />
//           {createdAt.toLocaleDateString("en-US", {
//             year: "numeric",
//             month: "short",
//             day: "numeric",
//           })}
//         </span>
//       </div>
//     </div>
//   )
// }
