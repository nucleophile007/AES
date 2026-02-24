import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSignedPdfUrl } from "@/lib/supabase-storage"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const researchId = searchParams.get("researchId")
    const email = searchParams.get("email")

    if (!researchId || !email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if user has approved access
    const approved = await prisma.accessRequest.findFirst({
      where: {
        researchId,
        email,
        approved: true,
      },
    })

    if (!approved) {
      return NextResponse.json(
        { error: "Access not approved" },
        { status: 403 }
      )
    }

    // Get research with PDF filename
    const research = await prisma.research.findUnique({
      where: { id: researchId },
      select: {
        pdfFilename: true,
      },
    })

    if (!research?.pdfFilename) {
      return NextResponse.json(
        { error: "PDF not found" },
        { status: 404 }
      )
    }

    // Construct full path: {researchId}/{filename}
    const fullPath = `${researchId}/${research.pdfFilename}`
    
    // Generate time-limited signed URL (1 hour)
    const signedUrl = await getSignedPdfUrl(fullPath, 3600)

    // Redirect to the signed URL
    return NextResponse.redirect(signedUrl)
  } catch (err) {
    console.error("PDF access error:", err)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}
