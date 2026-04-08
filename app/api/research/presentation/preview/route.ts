// import { NextRequest, NextResponse } from "next/server"
// import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
// import { readFile } from "fs/promises"
// import path from "path"
// import { downloadPresentationPdf } from "@/lib/supabase-storage"
// import { getPresentationResearch } from "../_shared"

// const PREVIEW_PAGES = 2

// export async function GET(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url)
//     const researchId = searchParams.get("researchId")

//     if (!researchId) {
//       return NextResponse.json({ error: "researchId is required" }, { status: 400 })
//     }

//     const research = await getPresentationResearch(researchId)

//     if (!research?.presentationPdfFilename) {
//       return NextResponse.json(
//         { error: "Presentation PDF not found" },
//         { status: 404 }
//       )
//     }

//     const fullPath = `${researchId}/${research.presentationPdfFilename}`
//     const originalBytes = await downloadPresentationPdf(fullPath)

//     const sourceDoc = await PDFDocument.load(originalBytes)
//     const sourcePageCount = sourceDoc.getPageCount()

//     if (sourcePageCount === 0) {
//       return NextResponse.json(
//         { error: "Presentation has no pages" },
//         { status: 422 }
//       )
//     }

//     const previewDoc = await PDFDocument.create()
//     const copyCount = Math.min(PREVIEW_PAGES, sourcePageCount)
//     const previewPageIndexes = Array.from({ length: copyCount }, (_, i) => i)
//     const copiedPages = await previewDoc.copyPages(sourceDoc, previewPageIndexes)
//     const font = await previewDoc.embedFont(StandardFonts.HelveticaBold)
//     const lockPngBytes = await readFile(path.join(process.cwd(), "public", "lock.png"))
//     const lockPngImage = await previewDoc.embedPng(lockPngBytes)

//     copiedPages.forEach((page) => previewDoc.addPage(page))

//     for (let pageIndex = copyCount; pageIndex < sourcePageCount; pageIndex += 1) {
//       const [lockedPage] = await previewDoc.copyPages(sourceDoc, [pageIndex])
//       previewDoc.addPage(lockedPage)
//       const { width, height } = lockedPage.getSize()

//       // Dark veil over real content to prevent readable details.
//       lockedPage.drawRectangle({
//         x: 0,
//         y: 0,
//         width,
//         height,
//         color: rgb(0.03, 0.04, 0.07),
//         opacity: 0.55,
//       })

//       // Blur-like scanlines to create a frosted preview feel.
//       const bandHeight = Math.max(8, Math.floor(height * 0.012))
//       for (let y = 0; y < height; y += bandHeight * 2) {
//         lockedPage.drawRectangle({
//           x: 0,
//           y,
//           width,
//           height: bandHeight,
//           color: rgb(0.85, 0.88, 0.92),
//           opacity: 0.08,
//         })
//       }

//       lockedPage.drawRectangle({
//         x: 0,
//         y: 0,
//         width,
//         height,
//         color: rgb(0.09, 0.11, 0.15),
//         opacity: 0.28,
//       })

//       lockedPage.drawRectangle({
//         x: width * 0.14,
//         y: height * 0.16,
//         width: width * 0.72,
//         height: height * 0.68,
//         color: rgb(0.15, 0.18, 0.23),
//         opacity: 0.82,
//         borderColor: rgb(0.29, 0.33, 0.4),
//         borderWidth: 1,
//       })

//       const lockSize = Math.min(width, height) * 0.12
//       lockedPage.drawImage(lockPngImage, {
//         x: width * 0.5 - lockSize / 2,
//         y: height * 0.62,
//         width: lockSize,
//         height: lockSize,
//         opacity: 0.95,
//       })

//       lockedPage.drawText("LOCKED", {
//         x: width * 0.5 - 36,
//         y: height * 0.42,
//         size: 18,
//         font,
//         color: rgb(0.95, 0.73, 0.2),
//       })

//       lockedPage.drawText("Unlock to view the full presentation", {
//         x: width * 0.5 - 120,
//         y: height * 0.37,
//         size: 10,
//         font,
//         color: rgb(0.78, 0.82, 0.86),
//       })
//     }

//     const previewBytes = await previewDoc.save()

//     return new NextResponse(Buffer.from(previewBytes), {
//       status: 200,
//       headers: {
//         "Content-Type": "application/pdf",
//         "Cache-Control": "private, max-age=300",
//         "X-Preview-Pages": String(copyCount),
//         "X-Total-Pages": String(sourcePageCount),
//       },
//     })
//   } catch (error) {
//     console.error("Presentation preview error:", error)
//     return NextResponse.json({ error: "Server error" }, { status: 500 })
//   }
// }


import { NextRequest, NextResponse } from "next/server"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import { readFile } from "fs/promises"
import path from "path"
import { downloadPresentationPdf } from "@/lib/supabase-storage"
import { getPresentationResearch } from "../_shared"

const PREVIEW_PAGES = 2

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const researchId = searchParams.get("researchId")

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
    const originalBytes = await downloadPresentationPdf(fullPath)

    const sourceDoc = await PDFDocument.load(originalBytes)
    const sourcePageCount = sourceDoc.getPageCount()

    if (sourcePageCount === 0) {
      return NextResponse.json(
        { error: "Presentation has no pages" },
        { status: 422 }
      )
    }

    const previewDoc = await PDFDocument.create()
    const font = await previewDoc.embedFont(StandardFonts.HelveticaBold)

    // Load lock icon
    const lockPngBytes = await readFile(
      path.join(process.cwd(), "public", "lock.png")
    )
    const lockPngImage = await previewDoc.embedPng(lockPngBytes)

    const copyCount = Math.min(PREVIEW_PAGES, sourcePageCount)

    // ✅ Add preview pages (original)
    const previewPages = await previewDoc.copyPages(
      sourceDoc,
      Array.from({ length: copyCount }, (_, i) => i)
    )
    previewPages.forEach((p) => previewDoc.addPage(p))

    // // 🔒 Add locked pages (blurred + overlay)
    // for (let pageIndex = copyCount; pageIndex < sourcePageCount; pageIndex++) {
    //   const [lockedPage] = await previewDoc.copyPages(sourceDoc, [pageIndex])
    //   previewDoc.addPage(lockedPage)

    //   const { width, height } = lockedPage.getSize()

    //   // 🌫️ Soft blur overlay (keep content slightly visible)
    //   lockedPage.drawRectangle({
    //     x: 0,
    //     y: 0,
    //     width,
    //     height,
    //     color: rgb(0, 0, 0),
    //     opacity: 0.35,
    //   })

    //   // 🌫️ subtle bottom gradient (focus center)
    //   lockedPage.drawRectangle({
    //     x: 0,
    //     y: height * 0.4,
    //     width,
    //     height: height * 0.6,
    //     color: rgb(0, 0, 0),
    //     opacity: 0.25,
    //   })

    //   // 💎 Center glass card
    //   const cardWidth = width * 0.42
    //   const cardHeight = height * 0.22

    //   const cardX = width / 2 - cardWidth / 2
    //   const cardY = height / 2 - cardHeight / 2

    //   lockedPage.drawRectangle({
    //     x: cardX,
    //     y: cardY,
    //     width: cardWidth,
    //     height: cardHeight,
    //     color: rgb(0.12, 0.14, 0.18),
    //     opacity: 0.9,
    //     borderColor: rgb(0.3, 0.35, 0.4),
    //     borderWidth: 1,
    //   })

    //   // 🔒 Lock icon
    //   const lockSize = Math.min(width, height) * 0.08

    //   lockedPage.drawImage(lockPngImage, {
    //     x: width / 2 - lockSize / 2,
    //     y: cardY + cardHeight * 0.65,
    //     width: lockSize,
    //     height: lockSize,
    //   })

    //   const remaining = sourcePageCount - PREVIEW_PAGES

    //   // 🟡 Title
    //   lockedPage.drawText("Content Locked", {
    //     x: width / 2 - 60,
    //     y: cardY + cardHeight * 0.45,
    //     size: 14,
    //     font,
    //     color: rgb(1, 1, 1),
    //   })

    //   // ⚪ Subtitle
    //   lockedPage.drawText(`Unlock ${remaining} more slides`, {
    //     x: width / 2 - 90,
    //     y: cardY + cardHeight * 0.30,
    //     size: 10,
    //     font,
    //     color: rgb(0.75, 0.8, 0.85),
    //   })
    // }
    for (let pageIndex = copyCount; pageIndex < sourcePageCount; pageIndex++) {
  const [lockedPage] = await previewDoc.copyPages(sourceDoc, [pageIndex])
  previewDoc.addPage(lockedPage)

  const { width, height } = lockedPage.getSize()

  // 🔒 Strong dark overlay (hide content properly)
  lockedPage.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(0, 0, 0),
    opacity: 0.95, // 🔥 increase this for stronger hide
  })

  // 🔒 Optional second layer (extra protection)
  lockedPage.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(0.05, 0.05, 0.08),
    opacity: 0.4,
  })

  // 🔒 Lock icon (only element)
  const lockSize = Math.min(width, height) * 0.50

  lockedPage.drawImage(lockPngImage, {
    x: width / 2 - lockSize / 2,
    y: height / 2 - lockSize / 2,
    width: lockSize,
    height: lockSize,
    opacity: 1,
  })
}

    const previewBytes = await previewDoc.save()

    return new NextResponse(Buffer.from(previewBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Cache-Control": "private, max-age=300",
        "X-Preview-Pages": String(copyCount),
        "X-Total-Pages": String(sourcePageCount),
      },
    })
  } catch (error) {
    console.error("Presentation preview error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}