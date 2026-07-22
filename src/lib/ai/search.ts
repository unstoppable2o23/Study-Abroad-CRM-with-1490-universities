import { prisma } from "@/lib/prisma";
import { chunkText } from "./rag";
import { getAIProvider } from "./index";
import { logAIUsage } from "./prompt-service";

type SearchSource = "UNIVERSITY" | "COURSE" | "CAREER" | "COUNTRY" | "SCHOLARSHIP" | "VISA" | "DOCUMENT";

export async function indexForSearch(options: {
  sourceType: SearchSource;
  sourceId: string;
  content: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const chunks = chunkText(options.content, 500, 100);
  const provider = getAIProvider();
  let embeddings: number[][] = [];

  try {
    const response = await provider.embed({ input: chunks });
    embeddings = response.embeddings;
  } catch {
    // Store without embeddings
  }

  for (let i = 0; i < chunks.length; i++) {
    await prisma.aIEmbedding.create({
      data: {
        sourceType: options.sourceType,
        sourceId: options.sourceId,
        content: chunks[i],
        embedding: embeddings[i] ? { vector: embeddings[i] } : undefined,
        metadata: options.metadata as any || undefined,
      },
    });
  }
}

export async function hybridSearch(options: {
  query: string;
  sourceType?: SearchSource;
  limit?: number;
}): Promise<Array<{ content: string; sourceType: string; sourceId: string | null; score: number }>> {
  const provider = getAIProvider();
  let queryEmbedding: number[] | null = null;

  try {
    const response = await provider.embed({ input: options.query });
    queryEmbedding = response.embeddings[0];
  } catch {
    // Fall back to keyword-only search
  }

  const where: any = {};
  if (options.sourceType) where.sourceType = options.sourceType;

  const allResults = await prisma.aIEmbedding.findMany({ where, select: { id: true, content: true, sourceType: true, sourceId: true, embedding: true } });

  let scored = allResults.map(r => {
    let score = 0;
    if (queryEmbedding && r.embedding) {
      const emb = (r.embedding as { vector: number[] })?.vector;
      if (emb) {
        score = cosineSimilarity(queryEmbedding, emb);
      }
    }
    // Boost keyword match
    const ql = options.query.toLowerCase();
    const cl = r.content.toLowerCase();
    if (cl.includes(ql)) score += 0.3;
    const keywords = ql.split(/\s+/).filter(w => w.length > 2);
    const keywordMatches = keywords.filter(k => cl.includes(k)).length;
    score += (keywordMatches / Math.max(keywords.length, 1)) * 0.2;

    return { ...r, score, originalScore: score };
  })
    .filter(r => r.score > 0.1)
    .sort((a, b) => b.score - a.score)
    .slice(0, options.limit || 10);

  return scored.map(r => ({ content: r.content.slice(0, 500), sourceType: r.sourceType, sourceId: r.sourceId, score: r.score }));
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}
