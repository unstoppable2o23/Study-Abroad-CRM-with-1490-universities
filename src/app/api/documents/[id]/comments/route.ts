import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized, forbidden } from "@/lib/api-response";
import { addDocumentComment, getDocumentComments } from "@/lib/documents/lifecycle";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const { id } = await context.params;
    const document = await prisma.document.findUnique({ where: { id }, include: { student: { select: { userId: true } } } });
    if (!document) return error("Document not found", 404);

    if (user.role === "STUDENT" && document.student.userId !== user.userId) return forbidden();

    const body = await request.json();
    const { content, isInternal } = body;
    if (!content) return error("Comment content is required", 400);

    // Students cannot create internal comments
    const internal = user.role === "STUDENT" ? false : (isInternal || false);

    const comment = await addDocumentComment({
      documentId: id,
      userId: user.userId,
      content,
      isInternal: internal,
    });

    return success(comment);
  } catch (e) {
    return error("Failed to add comment: " + (e instanceof Error ? e.message : ""), 500);
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

    const comments = await getDocumentComments(id);

    // Filter internal comments for students
    if (user.role === "STUDENT") {
      return success(comments.filter(c => !c.isInternal));
    }

    return success(comments);
  } catch {
    return error("Failed to fetch comments", 500);
  }
}
