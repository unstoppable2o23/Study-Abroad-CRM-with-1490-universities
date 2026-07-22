import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAIProvider } from "./index";

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

export function chunkText(text: string, size = CHUNK_SIZE, overlap = CHUNK_OVERLAP): string[] {
  if (!text || text.length <= size) return [text];

  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + size, text.length);
    let chunkEnd = end;

    if (end < text.length) {
      const lastPeriod = text.lastIndexOf(".", end);
      const lastNewline = text.lastIndexOf("\n", end);
      const breakPoint = Math.max(lastPeriod, lastNewline);
      if (breakPoint > start + size / 2) chunkEnd = breakPoint + 1;
    }

    chunks.push(text.slice(start, chunkEnd).trim());
    start = chunkEnd - overlap;
    if (start >= end) break;
  }

  return chunks.filter((c) => c.length > 0);
}

export async function embedChunks(chunks: string[]): Promise<number[][]> {
  const provider = getAIProvider();
  const response = await provider.embed({ input: chunks });
  return response.embeddings;
}

export async function indexDocument(options: {
  studentId: string;
  content: string;
  documentId?: string;
  metadata?: Record<string, unknown>;
}): Promise<number> {
  const chunks = chunkText(options.content);

  let embeddings: number[][] = [];
  try {
    embeddings = await embedChunks(chunks);
  } catch {
    // Embedding failed; store chunks without embeddings
  }

  for (let i = 0; i < chunks.length; i++) {
    await prisma.documentChunk.create({
      data: {
        studentId: options.studentId,
        documentId: options.documentId,
        content: chunks[i],
        embedding: embeddings[i] ? { vector: embeddings[i] } : undefined,
        chunkIndex: i,
        metadata: (options.metadata ?? undefined) as any,
      },
    });
  }

  return chunks.length;
}

export async function deleteDocumentChunks(documentId: string): Promise<void> {
  await prisma.documentChunk.deleteMany({ where: { documentId } });
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dotProduct / denom;
}

export async function semanticSearch(options: {
  query: string;
  studentId?: string;
  limit?: number;
  minScore?: number;
}): Promise<Array<{ chunk: { id: string; content: string; documentId: string | null; studentId: string; chunkIndex: number; metadata: Prisma.JsonValue; createdAt: Date }; score: number }>> {
  const provider = getAIProvider();
  let queryEmbedding: number[];

  try {
    const response = await provider.embed({ input: options.query });
    queryEmbedding = response.embeddings[0];
  } catch {
    throw new Error("Failed to generate embedding for query. Check AI provider configuration.");
  }

  const where: any = {};
  if (options.studentId) where.studentId = options.studentId;

  const chunks = await prisma.documentChunk.findMany({ where, orderBy: { chunkIndex: "asc" } });

  const scored = chunks
    .map((chunk) => {
      const emb = (chunk.embedding as { vector: number[] } | null)?.vector;
      if (!emb) return null;
      return { chunk, score: cosineSimilarity(queryEmbedding, emb) };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null && (options.minScore ? item.score >= options.minScore : true))
    .sort((a, b) => b.score - a.score)
    .slice(0, options.limit || 5);

  return scored;
}

export async function queryWithRAG(options: {
  query: string;
  studentId?: string;
  systemPrompt?: string;
  topK?: number;
  minScore?: number;
}): Promise<{ answer: string; sources: Array<{ content: string; score: number }> }> {
  const results = await semanticSearch({
    query: options.query,
    studentId: options.studentId,
    limit: options.topK || 5,
    minScore: options.minScore || 0.3,
  });

  const context = results.map((r) => r.chunk.content).join("\n\n");

  const provider = getAIProvider();
  const response = await provider.complete({
    messages: [
      { role: "system", content: options.systemPrompt || "You are a helpful assistant. Answer the user's question based on the provided context. If the context does not contain enough information, say so." },
      { role: "user", content: `Context:\n${context}\n\nQuestion: ${options.query}` },
    ],
    temperature: 0.3,
  });

  return {
    answer: response.content,
    sources: results.map((r) => ({ content: r.chunk.content.slice(0, 500), score: r.score })),
  };
}
