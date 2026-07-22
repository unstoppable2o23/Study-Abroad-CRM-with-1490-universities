import { prisma } from "@/lib/prisma";

export async function linkDocument(applicationId: string, documentId: string, type: string = "OTHER") {
  const existing = await prisma.applicationDocument.findFirst({
    where: { applicationId, documentId },
  });
  if (existing) return existing;

  return prisma.applicationDocument.create({
    data: { applicationId, documentId, type },
    include: { document: true },
  });
}

export async function unlinkDocument(applicationId: string, documentId: string) {
  return prisma.applicationDocument.deleteMany({
    where: { applicationId, documentId },
  });
}

export async function getApplicationDocuments(applicationId: string) {
  return prisma.applicationDocument.findMany({
    where: { applicationId },
    include: {
      document: {
        include: { student: { select: { id: true, fullName: true } } },
      },
    },
    orderBy: { uploadedAt: "desc" },
  });
}
