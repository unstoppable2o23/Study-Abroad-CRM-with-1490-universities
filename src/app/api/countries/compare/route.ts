import { prisma } from "@/lib/prisma";
import { success, error } from "@/lib/api-response";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length < 2) {
      return error("At least 2 country IDs are required for comparison", 400);
    }
    if (ids.length > 5) {
      return error("Maximum 5 countries can be compared at once", 400);
    }

    const countries = await prisma.country.findMany({
      where: { id: { in: ids } },
      include: {
        _count: { select: { universities: true, scholarships: true } },
        universities: { where: { deletedAt: null }, orderBy: { ranking: { sort: "asc", nulls: "last" } }, take: 5 },
      },
    });

    if (countries.length < 2) return error("At least 2 valid countries required", 400);

    const comparison = countries.map(c => ({
      id: c.id, name: c.name, code: c.code, flagUrl: c.flagUrl, region: c.region,
      currency: c.currency, language: c.language, livingCost: c.livingCost,
      visaInfo: c.visaInfo, workOpportunities: c.workOpportunities, prOpportunities: c.prOpportunities,
      educationSystem: c.educationSystem, popularLevels: c.popularLevels,
      intakePeriods: c.intakePeriods, studentVisaProcess: c.studentVisaProcess,
      universityCount: c._count.universities, scholarshipCount: c._count.scholarships,
      topUniversities: c.universities.map(u => ({ id: u.id, name: u.name, ranking: u.ranking })),
    }));

    const differences: Record<string, any> = {};
    const livingCosts = comparison.filter(c => c.livingCost).map(c => ({ name: c.name, cost: c.livingCost }));
    if (livingCosts.length > 0) differences.livingCosts = livingCosts;
    differences.regions = [...new Set(comparison.map(c => c.region).filter(Boolean))];
    differences.currencies = [...new Set(comparison.map(c => c.currency).filter(Boolean))];
    differences.languages = [...new Set(comparison.map(c => c.language).filter(Boolean))];
    differences.intakePeriods = [...new Set(comparison.flatMap(c => c.intakePeriods || []))];

    return success({ countries: comparison, differences, totalCompared: comparison.length });
  } catch {
    return error("Failed to compare countries", 500);
  }
}
