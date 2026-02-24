import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { researchId, email } = await req.json()

    if (!researchId || !email) {
      return NextResponse.json({ hasAccess: false })
    }

    const approvedRequest = await prisma.accessRequest.findFirst({
      where: {
        researchId,
        email,
        approved: true,
      },
    })

    return NextResponse.json({
      hasAccess: !!approvedRequest,
    })
  } catch (error) {
    return NextResponse.json({ hasAccess: false })
  }
}
