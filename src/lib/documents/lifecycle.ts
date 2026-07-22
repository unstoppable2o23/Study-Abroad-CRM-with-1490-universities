import { prisma } from "@/lib/prisma";
import { getStorageDriver } from "@/lib/storage";

export async function createDocumentVersion(options: {
  documentId: string;
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  fileSize: number;
  uploadedById?: string;
  notes?: string;
}): Promise<{ version: number; filePath: string }> {
  const document = await prisma.document.findUnique({ where: { id: options.documentId } });
  if (!document) throw new Error("Document not found");

  const nextVersion = document.version + 1;
  const driver = getStorageDriver();

  const uploadResult = await driver.upload({
    buffer: options.buffer,
    originalName: options.fileName,
    mimeType: options.mimeType,
    documentId: options.documentId,
  });

  // Create version record
  await prisma.documentVersion.create({
    data: {
      documentId: options.documentId,
      version: nextVersion,
      fileName: uploadResult.fileName,
      filePath: uploadResult.storagePath,
      fileSize: options.fileSize,
      mimeType: options.mimeType,
      uploadedById: options.uploadedById,
      notes: options.notes,
    },
  });

  // Update main document
  await prisma.document.update({
    where: { id: options.documentId },
    data: {
      version: nextVersion,
      fileName: uploadResult.fileName,
      filePath: uploadResult.storagePath,
      fileSize: options.fileSize,
      mimeType: options.mimeType,
      status: "PENDING",
      aiChecked: false,
      aiResult: undefined,
      aiScore: undefined,
      reviewedBy: null,
      reviewNotes: null,
    },
  });

  return { version: nextVersion, filePath: uploadResult.storagePath };
}

export async function getDocumentVersions(documentId: string) {
  return prisma.documentVersion.findMany({
    where: { documentId },
    orderBy: { version: "desc" },
    include: { uploadedBy: { select: { id: true, fullName: true } } },
  });
}

export async function addDocumentComment(options: {
  documentId: string;
  userId: string;
  content: string;
  isInternal?: boolean;
}) {
  return prisma.documentComment.create({
    data: {
      documentId: options.documentId,
      userId: options.userId,
      content: options.content,
      isInternal: options.isInternal || false,
    },
    include: { user: { select: { id: true, fullName: true, email: true, role: true } } },
  });
}

export async function getDocumentComments(documentId: string) {
  return prisma.documentComment.findMany({
    where: { documentId },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { id: true, fullName: true, email: true, role: true } } },
  });
}
