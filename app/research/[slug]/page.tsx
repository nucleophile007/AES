import { prisma } from "@/lib/prisma"
import { getSignedSlideUrl } from "@/lib/supabase-storage"
import ResearchClient from "./research-client"

export default async function ResearchPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const research = await prisma.research.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      description: true,
      pdfFilename: true,
      author: true,
      grade: true,
      school: true,
      createdAt: true,
      extractedContent: true,
      abstract: true,
      keywords: true,
      slides: {
        select: {
          id: true,
          imageFilename: true,
          order: true,
        },
        orderBy: { order: "asc" },
      },
    },
  })

  if (!research) {
    return <div>Research not found</div>
  }

  // Generate signed URLs for all slides (server-side for security)
  const slidesWithUrls = await Promise.all(
    research.slides.map(async (slide) => {
      try {
        // Construct full path: {researchId}/{filename}
        const fullPath = `${research.id}/${slide.imageFilename}`
        const signedUrl = await getSignedSlideUrl(fullPath, 3600)
        return {
          id: slide.id,
          imagePath: signedUrl,
          order: slide.order,
        }
      } catch (error) {
        console.error(`Failed to generate URL for slide ${slide.id}:`, error)
        return null
      }
    })
  )

  // Filter out any failed URLs
  const validSlides = slidesWithUrls.filter((slide) => slide !== null)

  return (
    <ResearchClient
      research={{
        ...research,
        slides: validSlides,
      }}
    />
  )
}



// "use client"

// import { useState } from "react"
// import Header from "@/components/home/Header"
// import Footer from "@/components/home/Footer"
// import Chatbot from "@/components/home/Chatbot"
// import { Breadcrumb } from "@/app/components/research/breadcrumb"
// import { AuthorSection } from "@/app/components/research/author-section"
// import { TableOfContents } from "@/app/components/research/table-of-contents"
// import { ArticleContent } from "@/app/components/research/article-content"
// import { AccessModal } from "@/app/components/research/access-modal"
// import { RelatedTopics } from "@/app/components/research/related-topics"
// import { Sparkles } from "lucide-react"

// const tableOfContentsItems = [
//   { id: "introduction", label: "Introduction" },
//   { id: "nanosensor-detection", label: "Nanosensor Detection" },
//   { id: "car-t-therapy", label: "CAR-T Cell Therapy" },
//   { id: "research-slides", label: "Research Slides" },
//   { id: "presentation", label: "Presentation" },
//   { id: "future-implications", label: "Future Implications" },
//   { id: "sources", label: "Sources" },
// ]

// export default function ResearchPostPage() {
//   const [showModal, setShowModal] = useState(false)
//   const [activeSection, setActiveSection] = useState("introduction")
//   const [loading, setLoading] = useState(false)
//   const [hasAccess, setHasAccess] = useState(false)

//   // 🔒 Triggered when user clicks locked slide
//   const handleSlideView = (index: number) => {
//     if (!hasAccess && index >= 2) {
//       setShowModal(true)
//     }
//   }

//   // 📩 Send request to backend
//   const handleAccessRequest = async (formData: {
//     name: string
//     email: string
//     phone?: string
//     reason?: string
//   }) => {
//     try {
//       setLoading(true)

//       const res = await fetch("/api/research/request-access", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(formData),
//       })

//       if (!res.ok) throw new Error()

//       alert("Request sent successfully! Admin will review it.")
//       setShowModal(false)
//     } catch {
//       alert("Something went wrong. Please try again.")
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <main className="min-h-screen theme-bg-dark flex flex-col">
//       <Header />

//       {/* HERO */}
//       <div className="relative overflow-hidden border-b border-slate-700/50">
//         <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-transparent to-yellow-400/10" />
//         <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

//         <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="py-4 pt-20 sm:pt-24">
//             <Breadcrumb />
//           </div>

//           <div className="py-12 lg:py-16">
//             <div className="flex items-center gap-2 mb-4">
//               <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-400/10 border border-yellow-400/20 rounded-full text-xs font-medium text-yellow-400">
//                 <Sparkles className="w-3 h-3" />
//                 Featured Research
//               </span>
//               <span className="text-xs theme-text-muted">
//                 Published Dec 2024
//               </span>
//             </div>

//             <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-semibold theme-text-light leading-tight mb-6 max-w-4xl">
//               Cancer: CAR-T Cell Therapy & Nanosensor Detection
//             </h1>

//             <p className="text-lg md:text-xl theme-text-muted max-w-3xl leading-relaxed mb-8">
//               Exploring revolutionary approaches to cancer treatment through nanosensors and CAR-T therapy.
//             </p>

//             <AuthorSection />
//           </div>
//         </div>
//       </div>

//       {/* CONTENT */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//         <div className="flex flex-col lg:flex-row gap-12">
//           <article className="flex-1">
//             <ArticleContent
//               onSectionChange={setActiveSection}
//               hasAccess={hasAccess}
//               onSlideView={handleSlideView}
//               onRequestAccess={() => setShowModal(true)}
//             />
//           </article>

//           <aside className="hidden lg:block w-80 shrink-0">
//             <div className="sticky top-28 space-y-8 max-h-[calc(100vh-8rem)] overflow-y-auto">
//               <TableOfContents
//                 items={tableOfContentsItems}
//                 activeSection={activeSection}
//               />
//               <RelatedTopics />
//             </div>
//           </aside>
//         </div>
//       </div>

//       <AccessModal
//         isOpen={showModal}
//         onClose={() => setShowModal(false)}
//         onSubmit={handleAccessRequest}
//         loading={loading}
//       />

//       <Footer />
//       <Chatbot />
//     </main>
//   )
// }

