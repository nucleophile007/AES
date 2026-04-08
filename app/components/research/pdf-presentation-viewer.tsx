"use client"

import { useEffect, useMemo, useState } from "react"
import { FileText } from "lucide-react"

interface PdfPresentationViewerProps {
  researchId: string
  totalPages: number
  hasAccess: boolean
  accessEmail: string | null
  maxFreePages?: number
  onLockedPageClick: (pageNumber: number) => void
}

export function PdfPresentationViewer({
  researchId,
  totalPages,
  hasAccess,
  accessEmail,
  maxFreePages = 2,
  onLockedPageClick,
}: PdfPresentationViewerProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [viewerBlobUrl, setViewerBlobUrl] = useState<string | null>(null)

  const safeTotalPages = Math.max(0, totalPages)
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), Math.max(safeTotalPages, 1))

  const viewerBaseUrl = useMemo(() => {
    if (hasAccess && accessEmail) {
      return `/api/research/presentation/full?researchId=${researchId}&email=${encodeURIComponent(accessEmail)}`
    }

    return `/api/research/presentation/preview?researchId=${researchId}`
  }, [accessEmail, hasAccess, researchId])

  useEffect(() => {
    let isMounted = true
    let objectUrl: string | null = null

    const loadPdf = async () => {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const response = await fetch(viewerBaseUrl)
        const contentType = response.headers.get("content-type") || ""

        if (!response.ok || !contentType.includes("application/pdf")) {
          let message = "Presentation could not be loaded"

          if (!response.ok) {
            try {
              const errorData = await response.json()
              message = errorData?.error || message
            } catch {
              message = response.statusText || message
            }
          }

          throw new Error(message)
        }

        const blob = await response.blob()
        objectUrl = URL.createObjectURL(blob)

        if (isMounted) {
          setViewerBlobUrl(objectUrl)
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error ? error.message : "Presentation could not be loaded"
          )
          setViewerBlobUrl(null)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadPdf()

    return () => {
      isMounted = false
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [viewerBaseUrl])

  if (safeTotalPages === 0) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 text-slate-400">
        Presentation PDF has no pages to preview.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/70">
        <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
          <div className="flex items-center gap-2 text-sm theme-text-light">
            <FileText className="h-4 w-4 text-yellow-400" />
            <span>Presentation Viewer</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs theme-text-muted">
              Page {safeCurrentPage} of {safeTotalPages}
            </span>
            {!hasAccess && (
              <button
                onClick={() => onLockedPageClick(safeCurrentPage)}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Request Access
              </button>
            )}
          </div>
        </div>

        <div className="bg-black">
          {isLoading ? (
            <div className="flex h-[72vh] min-h-[420px] w-full animate-pulse items-center justify-center bg-slate-950 px-6">
              <div className="w-full max-w-3xl space-y-4">
                <div className="h-8 w-40 rounded-full bg-slate-800" />
                <div className="h-[55vh] rounded-2xl bg-slate-800/70" />
                <div className="grid grid-cols-4 gap-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="h-14 rounded-xl bg-slate-800/80" />
                  ))}
                </div>
              </div>
            </div>
          ) : errorMessage ? (
            <div className="flex h-[72vh] min-h-[420px] w-full items-center justify-center bg-slate-950 px-6">
              <div className="max-w-md rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
                <p className="text-sm font-medium text-red-200">{errorMessage}</p>
              </div>
            </div>
          ) : (
            <iframe
              key={viewerBlobUrl}
              title="Research presentation"
              src={viewerBlobUrl ? `${viewerBlobUrl}#page=${safeCurrentPage}&zoom=page-width` : undefined}
              className="h-[72vh] min-h-[420px] w-full"
            />
          )}
        </div>
      </div>

    </div>
  )
}
