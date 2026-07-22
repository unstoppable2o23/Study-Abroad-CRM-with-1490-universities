import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized } from "@/lib/api-response";
import { semanticSearch } from "@/lib/ai/rag";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const url = new URL(request.url);
    const query = url.searchParams.get("q") || "";
    const sourceType = url.searchParams.get("sourceType");
    const limit = Math.min(20, Math.max(1, parseInt(url.searchParams.get("limit") || "5", 10)));

    if (!query) return error("Search query is required", 400);

    // Keyword search in knowledge documents (always available)
    const kwWhere: Record<string, unknown> = { deletedAt: null, status: "APPROVED" };
    if (sourceType) kwWhere.sourceType = sourceType;
    kwWhere.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { content: { contains: query, mode: "insensitive" } },
      { tags: { has: query } },
    ];

    const [keywordResults, semanticResults] = await Promise.all([
      prisma.knowledgeDocument.findMany({
        where: kwWhere,
        orderBy: { updatedAt: "desc" },
        take: limit,
      }),
      semanticSearch({ query, limit, minScore: 0.3 }).catch(() => []),
    ]);

    // Score keyword results by title match priority
    const scored = keywordResults.map(doc => {
      let score = 0.5;
      if (doc.title.toLowerCase().includes(query.toLowerCase())) score += 0.3;
      if (doc.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))) score += 0.2;
      return { document: doc, score: Math.min(score, 1.0), matchType: "keyword" as const };
    });

    const semanticMapped = semanticResults.map(r => ({
      document: r.chunk,
      score: r.score,
      matchType: "semantic" as const,
    }));

    // Merge and sort by score descending
    const merged = [...scored, ...semanticMapped]
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return success({
      results: merged,
      total: merged.length,
      query,
      hasSemanticResults: semanticResults.length > 0,
    });
  } catch {
    return error("Failed to search knowledge base", 500);
  }
}
