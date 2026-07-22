import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized, forbidden } from "@/lib/api-response";
import { createDocumentVersion, getDocumentVersions } from "@/lib/documents/lifecycle";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const { id } = await context.params;
    const document = await prisma.document.findUnique({ where: { id }, include: { student: true } });
    if (!document) return error("Document not found", 404);

    if (user.role === "STUDENT" && document.student.userId !== user.userId) return forbidden();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const notes = formData.get("notes") as string | null;

    if (!file) return error("No file provided", 400);

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await createDocumentVersion({
      documentId: id,
      buffer,
      fileName: file.name,
      mimeType: file.type,
      fileSize: file.size,
      uploadedById: user.userId,
      notes: notes || undefined,
    });

    return success(result);
  } catch (e) {
    return error("Failed to create version: " + (e instanceof Error ? e.message : ""), 500);
  }
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const { id } = await context.params;
    const document = await prisma.document.findUnique({ where: { id }, include: { student: { select: { userId: true } } } });
    if (!document) return error("Document not found", 404);

    if (user.role === "STUDENT" && document.student.userId !== user.userId) return forbidden();

    const versions = await getDocumentVersions(id);
    return success(versions);
  } catch {
    return error("Failed to fetch versions", 500);
  }
}
