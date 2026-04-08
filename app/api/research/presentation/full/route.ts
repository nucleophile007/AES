import { NextRequest, NextResponse } from "next/server"
import { getSignedPresentationPdfUrl } from "@/lib/supabase-storage"
import {
  getPresentationResearch,
  hasApprovedPresentationAccess,
} from "../_shared"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const researchId = searchParams.get("researchId")
    const email = searchParams.get("email")

    if (!researchId || !email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hasAccess = await hasApprovedPresentationAccess(researchId, email)

    if (!hasAccess) {
      return NextResponse.json({ error: "Access not approved" }, { status: 403 })
    }

    const research = await getPresentationResearch(researchId)

    if (!research?.presentationPdfFilename) {
      return NextResponse.json(
        { error: "Presentation PDF not found" },
        { status: 404 }
      )
    }

    const fullPath = `${researchId}/${research.presentationPdfFilename}`
    const signedUrl = await getSignedPresentationPdfUrl(fullPath, 600)

    return NextResponse.redirect(signedUrl)
  } catch (error) {
    console.error("Presentation full access error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
