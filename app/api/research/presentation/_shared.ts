import { prisma } from "@/lib/prisma"

export async function getPresentationResearch(researchId: string) {
  return prisma.research.findUnique({
    where: { id: researchId },
    select: {
      id: true,
      presentationPdfFilename: true,
    },
  })
}

export async function hasApprovedPresentationAccess(researchId: string, email: string) {
  const approvedRequest = await prisma.accessRequest.findFirst({
    where: {
      researchId,
      email,
      approved: true,
    },
    select: { id: true },
  })

  return Boolean(approvedRequest)
}
