import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized } from "@/lib/api-response";
import { getAIProvider } from "@/lib/ai";
import { logAIUsage } from "@/lib/ai/prompt-service";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const body = await request.json();
    const { universityIds } = body;

    if (!universityIds || !Array.isArray(universityIds) || universityIds.length < 2) {
      return error("At least 2 university IDs are required", 400);
    }

    const universities = await prisma.university.findMany({
      where: { id: { in: universityIds }, deletedAt: null },
      include: {
        country: { select: { name: true, currency: true, livingCost: true } },
        rankings: { orderBy: { year: "desc" }, take: 2 },
        scholarships: { where: { isActive: true }, take: 3, select: { name: true, amount: true } },
        universityCourses: { include: { course: { select: { name: true, level: true } } }, take: 5 },
      },
    });

    if (universities.length < 2) return error("At least 2 universities must be found", 400);

    const provider = getAIProvider();
    const start = Date.now();

    const universityData = universities.map(u => {
      const fee = u.feeStructure as Record<string, unknown> || {};
      return {
        name: u.name, city: u.city, country: u.country?.name,
        ranking: u.ranking, feeStructure: fee,
        livingCostMonthly: u.country?.livingCost, currency: u.country?.currency,
        scholarships: u.scholarships.map(s => s.name),
        topCourses: u.universityCourses.map(uc => `${uc.course.name} (${uc.course.level})`),
      };
    });

    const response = await provider.complete({
      messages: [
        { role: "system", content: "You are a study abroad counselor. Provide a concise comparison summary of the given universities. Include: 1) Overall ranking comparison, 2) Cost comparison (tuition + living), 3) Academic strengths, 4) Which is best for different student profiles, 5) Final recommendation. Return JSON with { summary: string, costComparison: string, academicComparison: string, bestForHighAchievers: string, bestForBudget: string, finalRecommendation: string, reasoning: string }." },
        { role: "user", content: `Compare these universities and provide a detailed analysis:\n${JSON.stringify(universityData, null, 2)}` },
      ],
      temperature: 0.3,
    });

    await logAIUsage({
      userId: user.userId,
      feature: "COMPARISON",
      provider: provider.isConfigured() ? process.env.AI_PROVIDER || "openai" : "fallback",
      model: process.env.AI_MODEL,
      durationMs: Date.now() - start,
      metadata: { type: "university-comparison-summary", count: universities.length },
    });

    try {
      const parsed = JSON.parse(response.content.replace(/```json/g, "").replace(/```/g, ""));
      return success(parsed);
    } catch {
      return success({ summary: response.content, costComparison: "", academicComparison: "", bestForHighAchievers: "", bestForBudget: "", finalRecommendation: "", reasoning: "" });
    }
  } catch (e) {
    return error("Failed to generate comparison summary: " + (e instanceof Error ? e.message : ""), 500);
  }
}
