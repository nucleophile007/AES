import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { researchId, name, email, phone, reason } = body

    if (!researchId || !name || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Prevent duplicate requests for same research + email
    const existing = await prisma.accessRequest.findFirst({
      where: {
        researchId,
        email,
      },
    })

    if (existing) {
      return NextResponse.json(
        { message: "Request already submitted." },
        { status: 200 }
      )
    }

    await prisma.accessRequest.create({
      data: {
        researchId,
        name,
        email,
        phone,
        reason,
      },
    })

    return NextResponse.json(
      { message: "Access request submitted successfully." },
      { status: 200 }
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    )
  }
}
