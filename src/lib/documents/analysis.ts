import { prisma } from "@/lib/prisma";
import { getAIProvider } from "@/lib/ai";
import { logAIUsage } from "@/lib/ai/prompt-service";
import { indexForSearch } from "@/lib/ai/search";
import { chunkText } from "@/lib/ai/rag";

const DOCUMENT_TYPES = ["SOP", "RESUME", "LOR", "PASSPORT", "TRANSCRIPTS", "CLASS_10", "CLASS_12", "GRADUATION"] as const;

type AnalyzableDocType = typeof DOCUMENT_TYPES[number];

export async function analyzeDocumentAI(documentId: string): Promise<{
  summary: string;
  missingInfo: string[];
  errors: string[];
  suggestions: string[];
  score: number;
}> {
  const document = await prisma.document.findUnique({ where: { id: documentId } });
  if (!document) throw new Error("Document not found");

  const text = document.extractedText || "";
  if (!text) {
    return { summary: "No text content to analyze", missingInfo: [], errors: ["Document has no extractable text"], suggestions: ["Upload a text-searchable PDF"], score: 0 };
  }

  const provider = getAIProvider();
  const start = Date.now();

  const docTypeLabel = document.type as string;

  const response = await provider.complete({
    messages: [
      { role: "system", content: `You are a document verification expert for study abroad applications.
Analyze the following ${docTypeLabel} document.

Return a JSON object with:
- summary: brief overview of document quality
- missingInfo: array of missing critical items
- errors: array of errors or issues found
- suggestions: array of improvement suggestions
- score: overall quality score (0-100)` },
      { role: "user", content: `Document type: ${docTypeLabel}
Content:
${text.slice(0, 10000)}

Analyze this document.` },
    ],
    temperature: 0.2,
  });

  const durationMs = Date.now() - start;

  await logAIUsage({
    feature: "DOCUMENT",
    provider: provider.isConfigured() ? process.env.AI_PROVIDER || "openai" : "fallback",
    model: process.env.AI_MODEL,
    durationMs,
    metadata: { documentId, documentType: docTypeLabel },
  });

  let result: { summary: string; missingInfo: string[]; errors: string[]; suggestions: string[]; score: number };
  try {
    result = JSON.parse(response.content.replace(/```json/g, "").replace(/```/g, ""));
  } catch {
    result = { summary: response.content, missingInfo: [], errors: [], suggestions: [], score: 50 };
  }

  // Store analysis
  await prisma.documentAnalysis.create({
    data: {
      documentId,
      engine: "ai",
      result: result as any,
      score: result.score,
      summary: result.summary,
      suggestions: result.suggestions,
      errors: result.errors,
      missingInfo: result.missingInfo,
    },
  });

  // Update document with AI results
  await prisma.document.update({
    where: { id: documentId },
    data: { aiChecked: true, aiResult: result as any, aiScore: result.score },
  });

  return result;
}

export async function indexApprovedDocument(documentId: string): Promise<void> {
  const document = await prisma.document.findUnique({
    where: { id: documentId, status: "APPROVED" },
    include: { student: { select: { id: true } } },
  });

  if (!document) throw new Error("Approved document not found");

  const text = document.extractedText || "";
  if (!text) return;

  await indexForSearch({
    sourceType: "DOCUMENT",
    sourceId: document.id,
    content: text,
    metadata: {
      studentId: document.studentId,
      documentType: document.type,
      fileName: document.fileName,
    },
  });
}

export async function getDocumentAnalysisHistory(documentId: string) {
  return prisma.documentAnalysis.findMany({
    where: { documentId },
    orderBy: { processedAt: "desc" },
  });
}
