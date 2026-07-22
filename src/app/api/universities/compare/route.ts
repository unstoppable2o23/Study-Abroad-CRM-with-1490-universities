import { prisma } from "@/lib/prisma";
import { success, error } from "@/lib/api-response";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length < 2) {
      return error("At least 2 university IDs are required for comparison", 400);
    }
    if (ids.length > 5) {
      return error("Maximum 5 universities can be compared at once", 400);
    }

    const universities = await prisma.university.findMany({
      where: { id: { in: ids }, deletedAt: null },
      include: {
        country: { select: { id: true, name: true, currency: true, livingCost: true, costOfLivingRanking: true } },
        rankings: { orderBy: { year: "desc" }, take: 3 },
        _count: { select: { courses: true, scholarships: true } },
        scholarships: { where: { isActive: true }, select: { name: true, amount: true, currency: true } },
      },
    });

    if (universities.length < 2) {
      return error("At least 2 valid universities required", 400);
    }

    const comparison = universities.map(u => {
      const feeStructure = u.feeStructure as Record<string, unknown> || {};
      const latestRanking = u.rankings[0];
      const tuitionMin = typeof feeStructure === "object" && "min" in feeStructure ? Number(feeStructure.min) : null;
      const tuitionMax = typeof feeStructure === "object" && "max" in feeStructure ? Number(feeStructure.max) : null;
      const avgTuition = tuitionMin && tuitionMax ? (tuitionMin + tuitionMax) / 2 : tuitionMin || tuitionMax;
      const livingCostAnnual = u.country.livingCost ? Number(u.country.livingCost) * 12 : null;
      const totalAnnualCost = avgTuition && livingCostAnnual ? avgTuition + livingCostAnnual : avgTuition || livingCostAnnual;

      // ROI score: ranking-based proxy for earning potential vs cost
      let roiScore: number | null = null;
      if (u.ranking && totalAnnualCost) {
        const rankFactor = Math.max(0, 1 - (u.ranking - 1) / 500);
        roiScore = Math.round((rankFactor * 1000) / (totalAnnualCost / 10000) * 10) / 10;
      }

      return {
        id: u.id,
        name: u.name,
        country: u.country.name,
        countryId: u.country.id,
        city: u.city,
        ranking: latestRanking ? { source: latestRanking.source, rank: latestRanking.rank, year: latestRanking.year } : null,
        overallRanking: u.ranking,
        courseCount: u._count.courses,
        scholarshipCount: u._count.scholarships,
        scholarships: u.scholarships.slice(0, 3).map(s => ({ name: s.name, amount: s.amount, currency: s.currency })),
        tuitionFeeMin: tuitionMin,
        tuitionFeeMax: tuitionMax,
        currency: u.country.currency,
        livingCostMonthly: u.country.livingCost,
        livingCostAnnual: livingCostAnnual ? Math.round(livingCostAnnual) : null,
        totalAnnualCost: totalAnnualCost ? Math.round(totalAnnualCost) : null,
        roiScore,
        intakePeriods: u.intakePeriods,
        applicationFee: u.applicationFee,
        website: u.website,
        logoUrl: u.logoUrl,
      };
    });

    const differences: Record<string, unknown> = {};

    const allIntakes = [...new Set(comparison.flatMap(u => u.intakePeriods))];
    const allCurrencies = [...new Set(comparison.map(u => u.currency).filter(Boolean))];
    const rankings = comparison.filter(u => u.ranking).map(u => ({ name: u.name, rank: u.ranking!.rank, source: u.ranking!.source }));
    const fees = comparison.filter(u => u.tuitionFeeMin).map(u => ({ name: u.name, min: u.tuitionFeeMin, max: u.tuitionFeeMax, currency: u.currency }));
    const livingCosts = comparison.filter(u => u.livingCostMonthly).map(u => ({ name: u.name, monthly: u.livingCostMonthly, annual: u.livingCostAnnual }));
    const appFees = comparison.filter(u => u.applicationFee).map(u => ({ name: u.name, fee: u.applicationFee }));
    const totalCosts = comparison.filter(u => u.totalAnnualCost).map(u => ({ name: u.name, totalAnnualCost: u.totalAnnualCost }));
    const roiScores = comparison.filter(u => u.roiScore).map(u => ({ name: u.name, roiScore: u.roiScore }));

    if (rankings.length > 0) differences.rankings = rankings;
    if (fees.length > 0) differences.fees = fees;
    if (livingCosts.length > 0) differences.livingCosts = livingCosts;
    if (appFees.length > 0) differences.applicationFees = appFees;
    if (totalCosts.length > 0) differences.totalAnnualCosts = totalCosts;
    if (roiScores.length > 0) differences.roiScores = roiScores.sort((a, b) => b.roiScore! - a.roiScore!);
    differences.intakePeriods = allIntakes;
    differences.currencies = allCurrencies;

    return success({ universities: comparison, differences, totalCompared: comparison.length });
  } catch {
    return error("Failed to compare universities", 500);
  }
}
