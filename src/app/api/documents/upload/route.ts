import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getStorageDriver, validateFile, UploadInput } from "@/lib/storage";
import { prisma } from "@/lib/prisma";
import { success, error, unauthorized, forbidden } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const documentId = formData.get("documentId") as string | null;
    const type = formData.get("type") as string | null;
    const description = formData.get("description") as string | null;
    const tagsRaw = formData.get("tags") as string | null;

    if (!file) return error("No file provided", 400);
    if (!type) return error("Document type is required", 400);

    const buffer = Buffer.from(await file.arrayBuffer());
    const studentId = user.role === "STUDENT"
      ? (await prisma.student.findUnique({ where: { userId: user.userId }, select: { id: true } }))?.id
      : undefined;

    if (!studentId && user.role === "STUDENT") return error("Student profile not found", 404);

    const input: UploadInput = {
      buffer,
      originalName: file.name,
      mimeType: file.type,
      studentId,
      documentId: documentId || undefined,
    };

    const validation = validateFile({ mimeType: file.type, size: file.size });
    if (!validation.valid) return error(validation.error!, 400);

    const driver = getStorageDriver();
    const result = await driver.upload(input);

    const tags = tagsRaw ? tagsRaw.split(",").map(t => t.trim()).filter(Boolean) : [];

    if (documentId) {
      // Update existing document: new version
      const existing = await prisma.document.findUnique({ where: { id: documentId } });
      if (!existing) return error("Document not found", 404);
      if (user.role === "STUDENT" && existing.studentId !== studentId) return forbidden();

      await prisma.document.update({
        where: { id: documentId },
        data: {
          fileName: result.fileName,
          filePath: result.storagePath,
          fileSize: result.size,
          mimeType: result.mimeType,
          version: { increment: 1 },
          status: "PENDING",
          aiChecked: false,
          aiResult: undefined,
          reviewedBy: null,
          reviewNotes: null,
          description: description || existing.description,
          tags: tags.length > 0 ? tags : existing.tags,
          uploadedById: user.userId,
        },
      });

      // Create version record
      await prisma.documentVersion.create({
        data: {
          documentId,
          version: existing.version + 1,
          fileName: result.fileName,
          filePath: result.storagePath,
          fileSize: result.size,
          mimeType: result.mimeType,
          uploadedById: user.userId,
        },
      });
    } else {
      // Create new document
      await prisma.document.create({
        data: {
          studentId: studentId!,
          type: type as any,
          fileName: result.fileName,
          filePath: result.storagePath,
          fileSize: result.size,
          mimeType: result.mimeType,
          description: description || undefined,
          tags,
          uploadedById: user.userId,
        },
      });
    }

    return success({
      fileId: result.fileId,
      fileName: result.fileName,
      originalName: result.originalName,
      mimeType: result.mimeType,
      size: result.size,
      url: result.publicUrl,
      thumbnailUrl: result.thumbnailUrl,
    });
  } catch (err) {
    return error("Upload failed: " + (err instanceof Error ? err.message : ""), 500);
  }
}
