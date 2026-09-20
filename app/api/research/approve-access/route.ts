import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApplicationUrl, sendAcademicNotification } from "@/lib/academic-notifications";
import { getUserFromRequest, hasRole } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    // Only teachers/mentors can approve
    if (user && !hasRole(user, "teacher")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { requestId, researchId, email } = body;

    let accessRequest = null;

    if (requestId) {
      accessRequest = await prisma.accessRequest.findUnique({
        where: { id: requestId },
        include: { research: true },
      });
    } else if (researchId && email) {
      accessRequest = await prisma.accessRequest.findFirst({
        where: { researchId, email },
        include: { research: true },
      });
    }

    if (!accessRequest) {
      return NextResponse.json({ error: "Access request not found" }, { status: 404 });
    }

    // Update to approved
    const updated = await prisma.accessRequest.update({
      where: { id: accessRequest.id },
      data: { approved: true },
      include: { research: true },
    });

    const researchTitle = updated.research.title;
    const researchUrl = getApplicationUrl(`/research/${updated.research.slug}`);

    // Send access granted email
    const notification = await sendAcademicNotification({
      recipients: [{ email: updated.email, name: updated.name }],
      subject: `Access Granted: ${researchTitle}`,
      heading: "Your Research Access Has Been Approved",
      message: `Great news! Your access request for the research publication "${researchTitle}"${updated.research.author ? ` by ${updated.research.author}` : ""} has been approved. You can now view and download the full research presentation and paper.`,
      details: [
        { label: "Paper Title", value: researchTitle },
        ...(updated.research.author ? [{ label: "Author", value: updated.research.author }] : []),
        ...(updated.research.domain ? [{ label: "Field", value: updated.research.domain }] : []),
      ],
      actionLabel: "View Full Research Paper",
      actionUrl: researchUrl,
    });

    return NextResponse.json({
      success: true,
      message: "Access granted and notification email sent.",
      request: updated,
      notification,
    });
  } catch (error) {
    console.error("Error approving research access:", error);
    return NextResponse.json({ error: "Failed to approve research access" }, { status: 500 });
  }
}
