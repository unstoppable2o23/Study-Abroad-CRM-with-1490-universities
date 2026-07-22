import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized, forbidden } from "@/lib/api-response";
import { getApplicationDocuments, linkDocument, unlinkDocument } from "@/lib/applications/documents";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const { id } = await context.params;
    const app = await prisma.application.findUnique({ where: { id }, include: { student: { select: { userId: true, organizationId: true } } } });
    if (!app) return error("Application not found", 404);
    if (user.role === "STUDENT" && app.student.userId !== user.userId) return forbidden();

    const docs = await getApplicationDocuments(id);
    return success(docs);
  } catch { return error("Failed to fetch documents", 500); }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role === "STUDENT") return forbidden();

  try {
    const { id } = await context.params;
    const body = await request.json();
    const { documentId, type } = body;
    if (!documentId) return error("documentId is required", 400);

    const doc = await linkDocument(id, documentId, type || "OTHER");
    return success(doc, 201);
  } catch { return error("Failed to link document", 500); }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role === "STUDENT") return forbidden();

  try {
    const { id } = await context.params;
    const url = new URL(request.url);
    const documentId = url.searchParams.get("documentId");
    if (!documentId) return error("documentId query param is required", 400);

    await unlinkDocument(id, documentId);
    return success({ deleted: true });
  } catch { return error("Failed to unlink document", 500); }
}
