"use client"

import { useState, useEffect } from "react"
import Header from "@/components/home/Header"
import Footer from "@/components/home/Footer"
import Chatbot from "@/components/home/Chatbot"
import { Breadcrumb } from "@/app/components/research/breadcrumb"
import { AuthorSection } from "@/app/components/research/author-section"
import { TableOfContents } from "@/app/components/research/table-of-contents"
import { ArticleContent } from "@/app/components/research/article-content"
import { AccessModal } from "@/app/components/research/access-modal"
import { Sparkles } from "lucide-react"
import { toast } from "sonner"

interface ResearchClientProps {
  research: {
    id: string
    title: string
    description: string | null
    pdfFilename: string | null
    presentationPdfFilename: string | null
    author: string | null
    grade: string | null
    school: string | null
    createdAt: Date
    extractedContent: any
    abstract: string | null
    keywords: string[]
  }
}

export default function ResearchClient({ research }: ResearchClientProps) {
  const [showModal, setShowModal] = useState(false)
  const [hasAccess, setHasAccess] = useState(false)
  const [accessEmail, setAccessEmail] = useState<string | null>(null)
  const [presentationTotalPages, setPresentationTotalPages] = useState(0)
  
  // Generate dynamic Table of Contents from extractedContent
  const extractedContent = research.extractedContent as {
    sections?: Array<{
      id: string
      order: number
      title: string
      summary: string
      keyPoints: string[]
    }>
  } | null
  
  const dynamicSections = extractedContent?.sections || []
  const tableOfContentsItems = [
    ...dynamicSections.map(section => ({
      id: section.id,
      label: section.title
    })),
    { id: "research-slides", label: "Research Presentation" },
    { id: "technical-report", label: "Technical Report" },
  ]
  
  const [activeSection, setActiveSection] = useState(tableOfContentsItems[0]?.id || "research-slides")
  
  const fetchPresentationMeta = async (email: string | null) => {
    const searchParams = new URLSearchParams({ researchId: research.id })

    if (email) {
      searchParams.set("email", email)
    }

    const res = await fetch(`/api/research/presentation/meta?${searchParams.toString()}`)

    if (!res.ok) {
      return
    }

    const data = await res.json()
    setPresentationTotalPages(data.totalPages ?? 0)

    if (Boolean(data.hasAccess)) {
      setHasAccess(true)
    }
  }

  useEffect(() => {
    const savedEmail = localStorage.getItem(`research-access-${research.id}`)
    const normalizedEmail = savedEmail?.trim() ? savedEmail : null

    setAccessEmail(normalizedEmail)

    fetchPresentationMeta(normalizedEmail)
  }, [research.id])

  const handleLockedPageClick = () => {
    setShowModal(true)
  }

  // ✅ CORRECT PDF HANDLER (GET + redirect)
  const handleViewPDF = () => {
    const email = localStorage.getItem(
      `research-access-${research.id}`
    )

    if (!email) {
      setShowModal(true)
      return
    }

    const url = `/api/research/pdf?researchId=${research.id}&email=${encodeURIComponent(
      email
    )}`

    window.open(url, "_blank")
  }

  // ✅ PDF DOWNLOAD HANDLER (force download)
  const handleDownloadPDF = async () => {
    const email = localStorage.getItem(
      `research-access-${research.id}`
    )

    if (!email) {
      setShowModal(true)
      return
    }

    try {
      const url = `/api/research/pdf?researchId=${research.id}&email=${encodeURIComponent(
        email
      )}`
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Failed to download PDF')
      }

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = `${research.title || 'research'}.pdf`
      document.body.appendChild(a)
      a.click()
      
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)
      
      toast.success('PDF downloaded successfully!')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download PDF')
    }
  }

  return (
    <main className="min-h-screen theme-bg-dark flex flex-col">
      <Header />

      {/* Hero */}
      <div className="relative overflow-hidden border-b border-slate-700/50">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-transparent to-yellow-400/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 pt-20 sm:pt-24">
            <Breadcrumb title={research.title} />
          </div>

          <div className="py-12 lg:py-16">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-400/10 border border-yellow-400/20 rounded-full text-xs font-medium text-yellow-400">
                <Sparkles className="w-3 h-3" />
                Featured Research
              </span>
              <span className="text-xs theme-text-muted">Published</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-semibold theme-text-light mb-6">
              {research.title}
            </h1>

            {research.description && (
              <p className="text-lg theme-text-muted max-w-3xl mb-8">
                {research.description}
              </p>
            )}

            <AuthorSection
              author={research.author}
              grade={research.grade}
              school={research.school}
              createdAt={research.createdAt}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          <article className="flex-1">
            <ArticleContent
              researchId={research.id}
              presentationTotalPages={presentationTotalPages}
              accessEmail={accessEmail}
              onSectionChange={setActiveSection}
              hasAccess={hasAccess}
              onLockedPageClick={handleLockedPageClick}
              onRequestAccess={() => setShowModal(true)}
              onViewPDF={handleViewPDF}
              onDownloadPDF={handleDownloadPDF}
              extractedContent={extractedContent}
            />
          </article>

          <aside className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-28 space-y-8 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-hide">
              <TableOfContents
                items={tableOfContentsItems}
                activeSection={activeSection}
              />
            </div>
          </aside>
        </div>
      </div>

      <AccessModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={async (formData) => {
          await fetch("/api/research/request-access", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...formData,
              researchId: research.id,
            }),
          })

          localStorage.setItem(
            `research-access-${research.id}`,
            formData.email
          )

          setAccessEmail(formData.email)

          await fetchPresentationMeta(formData.email)

          toast.success("Request Submitted! Admin will review it soon.")
          setShowModal(false)
        }}
      />

      <Footer />
      <Chatbot />
    </main>
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
// import { useEffect } from "react"

// interface ResearchClientProps {
//   research: {
//     id: string
//     title: string
//     description: string | null
//     pdfPath: string | null
//     author: string | null
//     createdAt: Date
//     slides: {
//       id: string
//       imagePath: string
//       order: number
//     }[]
//   }
// }

// const tableOfContentsItems = [
//   { id: "introduction", label: "Introduction" },
//   { id: "nanosensor-detection", label: "Nanosensor Detection" },
//   { id: "car-t-therapy", label: "CAR-T Cell Therapy" },
//   { id: "research-slides", label: "Research Slides" },
//   { id: "technical-report", label: "Technical Report" },
//   { id: "future-implications", label: "Future Implications" },
// ]

// export default function ResearchClient({ research }: ResearchClientProps) {
//   const [showModal, setShowModal] = useState(false)
//   const [hasAccess, setHasAccess] = useState(false)
//   const [activeSection, setActiveSection] = useState("introduction")

//   const handleSlideView = (slideIndex: number) => {
//     if (slideIndex >= 2 && !hasAccess) {
//       setShowModal(true)
//     }
//   }

//   useEffect(() => {
//   const savedEmail = localStorage.getItem(
//     `research-access-${research.id}`
//   )

//   if (!savedEmail) return

//   const checkAccess = async () => {
//     const res = await fetch("/api/research/check-access", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         researchId: research.id,
//         email: savedEmail,
//       }),
//     })

//     const data = await res.json()

//     if (data.hasAccess) {
//       setHasAccess(true)
//     }
//   }

//   checkAccess()
//   }, [research.id])

//   const handleViewPDF = async () => {
//   const email = localStorage.getItem(
//     `research-access-${research.id}`
//   )

//   if (!email) {
//     setShowModal(true)
//     return
//   }

//   const res = await fetch("/api/research/pdf", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       researchId: research.id,
//       email,
//     }),
//   })

//   if (!res.ok) {
//     alert("Access not approved yet.")
//     return
//   }

//   const blob = await res.blob()
//   const url = window.URL.createObjectURL(blob)

//   window.open(url, "_blank")
// }

//   return (
//     <main className="min-h-screen theme-bg-dark flex flex-col">
//       <Header />

//       {/* Hero Header with gradient */}
//       <div className="relative overflow-hidden border-b border-slate-700/50">
//         {/* Background gradient effect */}
//         <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-transparent to-yellow-400/10" />
//         <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

//         <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="py-4 pt-20 sm:pt-24">
//             <Breadcrumb />
//           </div>

//           {/* Title Section */}
//           <div className="py-12 lg:py-16">
//             <div className="flex items-center gap-2 mb-4">
//               <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-400/10 border border-yellow-400/20 rounded-full text-xs font-medium text-yellow-400">
//                 <Sparkles className="w-3 h-3" />
//                 Featured Research
//               </span>
//               <span className="text-xs theme-text-muted">Published</span>
//             </div>

//             <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-semibold theme-text-light leading-tight mb-6 max-w-4xl text-balance">
//               {research.title}
//             </h1>

//             {research.description && (
//               <p className="text-lg md:text-xl theme-text-muted max-w-3xl leading-relaxed mb-8">
//                 {research.description}
//               </p>
//             )}

//             <AuthorSection
//               author={research.author}
//               createdAt={research.createdAt}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//         <div className="flex flex-col lg:flex-row gap-12">
          
//           {/* Article Content */}
//           <article className="flex-1 w-full lg:max-w-none">
//             <ArticleContent
//             slides={research.slides}
//             onSectionChange={setActiveSection}
//             hasAccess={hasAccess}
//             onSlideView={handleSlideView}
//             onRequestAccess={() => setShowModal(true)}
//             onViewPDF={handleViewPDF}
//           />
//           </article>

//           {/* Sidebar - Sticky */}
//           <aside className="hidden lg:block w-80 shrink-0">
//             <div className="sticky top-28 space-y-8 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-hide">
//               <TableOfContents
//                 items={tableOfContentsItems}
//                 activeSection={activeSection}
//               />
//             </div>
//           </aside>
//         </div>
//       </div>

//       <AccessModal
//       isOpen={showModal}
//       onClose={() => setShowModal(false)}
//       onSubmit={async (formData) => {
//         await fetch("/api/research/request-access", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             ...formData,
//             researchId: research.id,
//           }),
//         })

//         // Store email locally
//         localStorage.setItem(
//           `research-access-${research.id}`,
//           formData.email
//         )

//         setShowModal(false)
//         alert("Request submitted. Admin will review it.")
//       }}
//     />


//       <Footer />
//       <Chatbot />
//     </main>
//   )
// }
