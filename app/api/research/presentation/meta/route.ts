import { NextRequest, NextResponse } from "next/server"
import { PDFDocument } from "pdf-lib"
import { downloadPresentationPdf } from "@/lib/supabase-storage"
import {
  getPresentationResearch,
  hasApprovedPresentationAccess,
} from "../_shared"

const PREVIEW_PAGES = 2

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const researchId = searchParams.get("researchId")
    const email = searchParams.get("email")

    if (!researchId) {
      return NextResponse.json({ error: "researchId is required" }, { status: 400 })
    }

    const research = await getPresentationResearch(researchId)

    if (!research?.presentationPdfFilename) {
      return NextResponse.json(
        { error: "Presentation PDF not found" },
        { status: 404 }
      )
    }

    const fullPath = `${researchId}/${research.presentationPdfFilename}`
    const pdfBytes = await downloadPresentationPdf(fullPath)
    const sourceDoc = await PDFDocument.load(pdfBytes)
    const totalPages = sourceDoc.getPageCount()

    const hasAccess =
      email && email.trim().length > 0
        ? await hasApprovedPresentationAccess(researchId, email)
        : false

    const response = NextResponse.json({
      researchId,
      totalPages,
      previewPages: Math.min(PREVIEW_PAGES, totalPages),
      hasAccess,
    })

    response.headers.set("Cache-Control", "private, max-age=30")

    return response
  } catch (error) {
    console.error("Presentation meta error:", error)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    )
  }
}
