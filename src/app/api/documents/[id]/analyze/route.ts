import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized, forbidden } from "@/lib/api-response";
import { analyzeDocumentAI, indexApprovedDocument, getDocumentAnalysisHistory } from "@/lib/documents/analysis";
import { extractText } from "@/lib/documents/ocr";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const { id } = await context.params;
    const document = await prisma.document.findUnique({ where: { id }, include: { student: true } });
    if (!document) return error("Document not found", 404);

    if (user.role === "STUDENT" && document.student.userId !== user.userId) return forbidden();

    // Ensure text is extracted
    if (!document.extractedText) {
      await extractText(id);
    }

    const result = await analyzeDocumentAI(id);

    // If document is approved, index for RAG
    if (document.status === "APPROVED") {
      try {
        await indexApprovedDocument(id);
      } catch {
        // RAG indexing is optional
      }
    }

    return success(result);
  } catch (e) {
    return error("Failed to analyze document: " + (e instanceof Error ? e.message : ""), 500);
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

    const analyses = await getDocumentAnalysisHistory(id);
    return success(analyses);
  } catch {
    return error("Failed to fetch analysis history", 500);
  }
}
