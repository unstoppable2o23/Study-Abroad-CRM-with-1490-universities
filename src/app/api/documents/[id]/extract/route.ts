import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized, forbidden } from "@/lib/api-response";
import { extractText } from "@/lib/documents/ocr";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const { id } = await context.params;
    const document = await prisma.document.findUnique({ where: { id }, include: { student: { select: { userId: true } } } });
    if (!document) return error("Document not found", 404);

    if (user.role === "STUDENT" && document.student.userId !== user.userId) return forbidden();

    const result = await extractText(id);

    return success({
      text: result.text.slice(0, 2000),
      confidence: result.confidence,
      pageCount: result.pageCount,
      engine: result.engine,
      fullLength: result.text.length,
    });
  } catch (e) {
    return error("Failed to extract text: " + (e instanceof Error ? e.message : ""), 500);
  }
}
