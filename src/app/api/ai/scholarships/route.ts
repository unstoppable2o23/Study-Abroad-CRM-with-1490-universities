import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized } from "@/lib/api-response";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const body = await request.json();
    const { nationality, academicLevel, fieldOfStudy, gpa, targetCountry, preferredIntake } = body;

    const where: Record<string, unknown> = { deletedAt: null, isActive: true };

    if (academicLevel) where.academicLevels = { has: academicLevel };
    if (targetCountry) where.countryId = targetCountry;

    const scholarships = await prisma.scholarship.findMany({
      where,
      include: {
        country: { select: { id: true, name: true, code: true, flagUrl: true } },
        university: { select: { id: true, name: true } },
      },
      orderBy: [{ isFeatured: "desc" }, { deadline: "asc" }],
    });

    const scored = scholarships.map((s) => {
      let score = 0;
      const reasons: string[] = [];

      if (gpa && s.gpaRequirement && parseFloat(gpa) >= s.gpaRequirement) {
        score += 30;
        reasons.push(`GPA ${gpa} meets requirement of ${s.gpaRequirement}`);
      } else if (gpa && s.gpaRequirement && parseFloat(gpa) < s.gpaRequirement) {
        score -= 20;
        reasons.push(`GPA ${gpa} below requirement of ${s.gpaRequirement}`);
      }

      if (nationality && s.nationalities.length > 0) {
        const anyNationality = s.nationalities.some((n) =>
          n === "All" || n.toLowerCase() === nationality.toLowerCase()
        );
        if (anyNationality) {
          score += 25;
          reasons.push("Nationality eligible");
        } else {
          score -= 15;
          reasons.push("Nationality may not be eligible");
        }
      }

      if (academicLevel && s.academicLevels.includes(academicLevel)) {
        score += 20;
        reasons.push(`Open to ${academicLevel} students`);
      }

      if (preferredIntake && s.intakeSeasons.includes(preferredIntake)) {
        score += 15;
        reasons.push(`Available for ${preferredIntake} intake`);
      }

      if (s.deadline && new Date(s.deadline) > new Date()) {
        score += 10;
        reasons.push("Deadline has not passed");
      }

      if (s.isFeatured) {
        score += 5;
        reasons.push("Featured scholarship");
      }

      return {
        ...s,
        matchScore: Math.round(Math.max(0, Math.min(100, score))),
        matchReasons: reasons,
      };
    });

    const sorted = scored.sort((a, b) => b.matchScore - a.matchScore);

    return success({
      recommendations: sorted.slice(0, 20),
      total: sorted.length,
    });
  } catch {
    return error("Failed to generate scholarship recommendations", 500);
  }
}
