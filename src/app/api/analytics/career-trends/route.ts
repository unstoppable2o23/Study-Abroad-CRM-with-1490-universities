import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { success, error, unauthorized, forbidden } from "@/lib/api-response";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "reports:read"); } catch { return forbidden(); }

  try {
    const careerAssessments = await prisma.careerAssessment.findMany({
      select: { careerMatches: true, strengths: true, weaknesses: true, createdAt: true },
    });

    const careerFrequency: Record<string, number> = {};
    for (const ca of careerAssessments) {
      for (const career of ca.careerMatches) {
        careerFrequency[career] = (careerFrequency[career] || 0) + 1;
      }
    }

    const topCareers = Object.entries(careerFrequency)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    const strengthFrequency: Record<string, number> = {};
    for (const ca of careerAssessments) {
      for (const s of ca.strengths) {
        strengthFrequency[s] = (strengthFrequency[s] || 0) + 1;
      }
    }

    const topStrengths = Object.entries(strengthFrequency)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const countryPreferences = await prisma.preferredStudyOption.findMany({
      where: { type: "COUNTRY" },
      select: { label: true },
    });

    const countryFrequency: Record<string, number> = {};
    for (const cp of countryPreferences) {
      countryFrequency[cp.label] = (countryFrequency[cp.label] || 0) + 1;
    }

    const topCountries = Object.entries(countryFrequency)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Career demand growth (career assessments by month)
    const byMonth: Record<string, number> = {};
    for (const ca of careerAssessments) {
      const key = ca.createdAt.toISOString().slice(0, 7);
      byMonth[key] = (byMonth[key] || 0) + 1;
    }

    const monthlyTrend = Object.entries(byMonth)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return success({
      topCareers,
      topStrengths,
      topCountryPreferences: topCountries,
      monthlyTrend,
      totalAssessments: careerAssessments.length,
    });
  } catch {
    return error("Failed to fetch career trends", 500);
  }
}
