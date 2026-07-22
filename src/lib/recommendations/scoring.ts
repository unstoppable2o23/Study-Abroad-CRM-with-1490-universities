import { prisma } from "@/lib/prisma";
import { getAIProvider } from "@/lib/ai";
import { logAIUsage } from "@/lib/ai/prompt-service";

export interface StudentProfile {
  userId: string;
  educationRecords?: Array<{ level: string; percentage?: number; cgpa?: number }>;
  examScores?: Record<string, number>;
  interests?: string[];
  preferredCountries?: string[];
  preferredCourses?: string[];
  budget?: number;
  careerGoals?: string[];
}

export interface ScoredRecommendation {
  id: string;
  name: string;
  matchScore: number;
  ruleScore: number;
  aiScore: number | null;
  reasons: string[];
  breakdown: Record<string, number>;
}

const WEIGHTS = {
  ACADEMIC: 30,
  INTEREST: 25,
  FINANCIAL: 20,
  CAREER: 15,
  LOCATION: 10,
};

export async function scoreUniversities(profile: StudentProfile): Promise<ScoredRecommendation[]> {
  const universities = await prisma.university.findMany({
    where: { status: "PUBLISHED", deletedAt: null },
    include: {
      country: { select: { id: true, name: true, livingCost: true, currency: true } },
      universityCourses: { include: { course: { select: { name: true, category: true } } }, take: 10 },
      scholarships: { where: { isActive: true }, select: { amount: true } },
    },
  });

  const ruleBased = universities.map(u => {
    const breakdown: Record<string, number> = {};
    const reasons: string[] = [];
    const fee = u.feeStructure as Record<string, unknown> || {};
    const tuitionMin = typeof fee === "object" && "min" in fee ? Number(fee.min) : null;
    const livingCostAnnual = u.country?.livingCost ? Number(u.country.livingCost) * 12 : null;
    const totalCost = (tuitionMin || 0) + (livingCostAnnual || 0);

    // Academic match
    let academicScore = 0;
    if (profile.educationRecords) {
      for (const record of profile.educationRecords) {
        const pct = record.percentage || (record.cgpa ? record.cgpa * 9.5 : 0);
        if (pct > 85) academicScore = 25;
        else if (pct > 75) academicScore = 20;
        else if (pct > 60) academicScore = 15;
        else academicScore = 5;
      }
    }
    if (u.ranking && u.ranking <= 50) academicScore += 5;
    else if (u.ranking && u.ranking <= 100) academicScore += 3;
    else if (u.ranking && u.ranking <= 200) academicScore += 1;
    breakdown.academic = Math.min(academicScore, WEIGHTS.ACADEMIC);
    if (academicScore > 0) reasons.push(`Academic profile matches university standards`);

    // Interest match (course alignment)
    let interestScore = 0;
    if (profile.preferredCourses && profile.preferredCourses.length > 0) {
      const uniCourses = u.universityCourses.map(uc => uc.course.name.toLowerCase());
      const matches = profile.preferredCourses.filter(c =>
        uniCourses.some(uc => uc.includes(c.toLowerCase()))
      );
      interestScore = Math.min(matches.length * 8, WEIGHTS.INTEREST);
      if (matches.length > 0) reasons.push(`Offers ${matches.length} of your preferred courses`);
    }
    breakdown.interest = interestScore;

    // Financial match
    let financialScore = 0;
    if (profile.budget && totalCost > 0) {
      if (totalCost <= profile.budget) financialScore = WEIGHTS.FINANCIAL;
      else if (totalCost <= profile.budget * 1.2) financialScore = 15;
      else if (totalCost <= profile.budget * 1.5) financialScore = 8;
      if (u.scholarships.length > 0) financialScore += 5;
    }
    breakdown.financial = Math.min(financialScore, WEIGHTS.FINANCIAL);
    if (financialScore > 10) reasons.push(`Within budget range`);
    if (u.scholarships.length > 0) reasons.push(`${u.scholarships.length} scholarship(s) available`);

    // Career match
    let careerScore = 0;
    if (profile.careerGoals && profile.careerGoals.length > 0 && u.ranking) {
      careerScore = u.ranking <= 100 ? 12 : u.ranking <= 300 ? 8 : 5;
    }
    breakdown.career = careerScore;
    if (careerScore > 0) reasons.push(`Strong career outcomes`);

    // Location match
    let locationScore = 0;
    if (profile.preferredCountries && profile.preferredCountries.length > 0) {
      if (profile.preferredCountries.includes(u.countryId)) {
        locationScore = 10;
        reasons.push(`Located in your preferred country`);
      }
    }
    breakdown.location = locationScore;

    const total = Object.values(breakdown).reduce((a, b) => a + b, 0);

    return {
      id: u.id,
      name: u.name,
      matchScore: Math.min(Math.round(total), 100),
      ruleScore: Math.min(Math.round(total), 100),
      aiScore: null as number | null,
      reasons,
      breakdown,
    };
  });

  const sorted = ruleBased.sort((a, b) => b.matchScore - a.matchScore);

  // AI enhancement (when provider is configured)
  try {
    const provider = getAIProvider();
    if (provider.isConfigured()) {
      const topN = sorted.slice(0, 10);
      const start = Date.now();
      const response = await provider.complete({
        messages: [
          { role: "system", content: `You are a study abroad recommendation engine. Adjust the rule-based scores (0-100) for these universities based on the student profile. Return JSON array: [{id: string, adjustedScore: number, reason: string}]. Be critical and differentiate scores meaningfully.` },
          { role: "user", content: `Student: ${JSON.stringify(profile)}\nUniversities: ${JSON.stringify(topN.map(u => ({ id: u.id, name: u.name, ruleScore: u.ruleScore, breakdown: u.breakdown })))}` },
        ],
        temperature: 0.2,
      });

      await logAIUsage({
        userId: profile.userId,
        feature: "RECOMMENDATION",
        provider: "openai",
        durationMs: Date.now() - start,
        metadata: { type: "hybrid-scoring", count: topN.length },
      });

      try {
        const adjustments = JSON.parse(response.content.replace(/```json/g, "").replace(/```/g, ""));
        const adjustmentMap = new Map(adjustments.map((a: { id: string; adjustedScore: number }) => [a.id, a.adjustedScore]));
        for (const u of sorted) {
          if (adjustmentMap.has(u.id)) {
            u.aiScore = adjustmentMap.get(u.id) as number;
            u.matchScore = Math.round((u.ruleScore + (u.aiScore as number)) / 2);
            u.reasons.push("AI-verified recommendation");
          }
        }
      } catch {
        // AI adjustment failed, keep rule scores
      }
    }
  } catch {
    // AI not available, keep rule scores
  }

  return sorted.sort((a, b) => b.matchScore - a.matchScore);
}

export async function scoreCourses(profile: StudentProfile) {
  const courses = await prisma.course.findMany({
    where: { status: "PUBLISHED", deletedAt: null },
    include: {
      country: { select: { id: true, name: true } },
      university: { select: { id: true, name: true, ranking: true } },
      careers: { take: 5, select: { id: true, name: true } },
    },
  });

  return courses.map(c => {
    let score = 0;
    const reasons: string[] = [];
    const breakdown: Record<string, number> = {};

    if (profile.preferredCourses && profile.preferredCourses.some(p => c.name.toLowerCase().includes(p.toLowerCase()))) {
      score += 25;
      reasons.push("Matches your course preference");
    }
    breakdown.interest = Math.min(score, 25);

    if (c.university?.ranking && c.university.ranking <= 100) {
      score += 15;
      reasons.push("Offered by top-ranked university");
    }
    breakdown.quality = Math.min(15, c.university?.ranking && c.university.ranking <= 100 ? 15 : 0);

    if (profile.educationRecords) {
      const levelMatch = profile.educationRecords.some(e => {
        const level = e.level.toLowerCase();
        return c.level?.toLowerCase().includes("master") && level.includes("bachelor") ||
               c.level?.toLowerCase().includes("phd") && level.includes("master") ||
               c.level?.toLowerCase().includes("bachelor") && level.includes("12");
      });
      if (levelMatch) { score += 10; reasons.push("Appropriate academic level"); }
    }
    breakdown.level = 10;

    if (profile.careerGoals && c.careers.some(cr => profile.careerGoals!.some(g => cr.name.toLowerCase().includes(g.toLowerCase())))) {
      score += 15;
      reasons.push("Aligns with your career goals");
    }
    breakdown.career = 15;

    if (profile.preferredCountries && c.countryId && profile.preferredCountries.includes(c.countryId)) {
      score += 10;
      reasons.push("In your preferred country");
    }
    breakdown.location = 10;

    return {
      id: c.id,
      name: c.name,
      level: c.level,
      universityName: c.university?.name || null,
      matchScore: Math.min(Math.round(score), 100),
      reasons,
      breakdown,
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}
