import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApplicationUrl, sendAcademicNotification } from "@/lib/academic-notifications";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { researchId, name, email, phone, reason } = body;

    if (!researchId || !name || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Fetch research paper details
    const research = await prisma.research.findUnique({
      where: { id: researchId },
      select: {
        id: true,
        title: true,
        slug: true,
        author: true,
        domain: true,
        category: true,
      },
    });

    const researchTitle = research?.title || "Student Research Publication";

    // Prevent duplicate requests for same research + email
    const existing = await prisma.accessRequest.findFirst({
      where: {
        researchId,
        email,
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Request already submitted." },
        { status: 200 }
      );
    }

    const accessRequest = await prisma.accessRequest.create({
      data: {
        researchId,
        name,
        email,
        phone: phone || null,
        reason: reason || null,
      },
    });

    // 1. Send confirmation email to requester
    const requesterNotification = await sendAcademicNotification({
      recipients: [{ email, name }],
      subject: `Access Request Received: ${researchTitle}`,
      heading: "We Received Your Research Access Request",
      message: `Thank you for your interest in ACHARYA Student Research. We have received your request to access the complete publication "${researchTitle}"${research?.author ? ` by ${research.author}` : ""}. Our academic review team will verify your request and grant access shortly.`,
      details: [
        { label: "Paper Title", value: researchTitle },
        ...(research?.author ? [{ label: "Author", value: research.author }] : []),
        ...(research?.domain || research?.category ? [{ label: "Field", value: research?.domain || research?.category }] : []),
        ...(reason ? [{ label: "Area of Interest", value: reason }] : []),
      ],
      actionLabel: "Explore All Research",
      actionUrl: getApplicationUrl("/research"),
    });

    // 2. Send notification to Admin
    const adminEmail = process.env.ADMIN_EMAIL || process.env.CONTACT_NOTIFICATION_TO || "acharya.folsom@gmail.com";
    const adminNotification = await sendAcademicNotification({
      recipients: [{ email: adminEmail, name: "ACHARYA Research Team" }],
      subject: `New Research Access Request: ${researchTitle} — ${name}`,
      heading: "New Research Paper Access Request",
      message: `${name} has requested access to view the full student research paper.`,
      details: [
        { label: "Paper Title", value: researchTitle },
        { label: "Requester", value: `${name} (${email})` },
        ...(phone ? [{ label: "Phone", value: phone }] : []),
        ...(reason ? [{ label: "Reason / Note", value: reason }] : []),
        { label: "Request ID", value: accessRequest.id },
      ],
      replyTo: email,
      actionLabel: "View Research Papers",
      actionUrl: getApplicationUrl(`/research/${research?.slug || ""}`),
    });

    return NextResponse.json(
      {
        message: "Access request submitted successfully.",
        requestId: accessRequest.id,
        notification: {
          attempted: requesterNotification.attempted + adminNotification.attempted,
          sent: requesterNotification.sent + adminNotification.sent,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Research request access error:", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
