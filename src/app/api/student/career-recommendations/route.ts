import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized } from "@/lib/api-response";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const student = await prisma.student.findUnique({
      where: { userId: user.userId },
      include: {
        educationRecords: true,
        studentInterests: true,
        examScores: { include: { examType: true } },
        careerAssessments: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    if (!student) return error("Student not found", 404);

    const interests = student.studentInterests.map(si => si.interest.toLowerCase());
    const recentAssessment = student.careerAssessments[0];
    const assessmentCareerMatches = recentAssessment?.careerMatches || [];

    const careers = await prisma.career.findMany({
      where: { deletedAt: null, isActive: true, status: "PUBLISHED" },
      include: {
        categoryRef: { select: { id: true, name: true } },
        courses: { select: { id: true, name: true, level: true } },
        _count: { select: { courses: true } },
      },
    });

    const scored = careers.map(career => {
      let score = 0;
      const reasons: string[] = [];

      const keywords = [career.name, career.description || "", career.industry || "", ...career.skills].join(" ").toLowerCase();

      // Match interests
      for (const interest of interests) {
        if (keywords.includes(interest)) {
          score += 20;
          reasons.push(`Matches your interest in "${interest}"`);
        }
      }

      // Match assessment results
      if (assessmentCareerMatches.includes(career.name)) {
        score += 30;
        reasons.push("Identified by your career assessment");
      }

      // Match skills overlap
      const eduRecords = student.educationRecords;
      if (eduRecords.length > 0) {
        const fields = eduRecords.map(e => e.field?.toLowerCase()).filter(Boolean);
        for (const field of fields) {
          if (keywords.includes(field!)) {
            score += 10;
            reasons.push(`Related to your "${field}" studies`);
          }
        }
      }

      // Emerging careers bonus
      if (career.isEmerging) {
        score += 5;
        reasons.push("Emerging career with high growth potential");
      }

      // Career with course pathways
      if (career._count.courses > 0) {
        score += 5;
      }

      return {
        id: career.id, name: career.name, description: career.description,
        skills: career.skills, eligibility: career.eligibility,
        futureScope: career.futureScope, salaryTrends: career.salaryTrends,
        recruiters: career.recruiters, isEmerging: career.isEmerging,
        industry: career.industry, category: career.categoryRef,
        courses: career.courses,
        matchScore: Math.min(score, 100),
        reasons: reasons.slice(0, 4),
      };
    });

    const topMatches = scored
      .filter(c => c.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);
    const otherCareers = scored
      .filter(c => c.matchScore === 0)
      .sort((a, b) => (b.isEmerging ? 1 : 0) - (a.isEmerging ? 1 : 0))
      .slice(0, 5);

    const strengths = interests.slice(0, 5);
    const skillGaps: string[] = [];
    for (const career of topMatches.slice(0, 3)) {
      for (const skill of (career.skills || [])) {
        const skillLower = skill.toLowerCase();
        const hasSkill = interests.some(i => skillLower.includes(i) || i.includes(skillLower));
        if (!hasSkill && !skillGaps.includes(skill)) skillGaps.push(skill);
      }
    }

    return success({
      recommendations: topMatches,
      otherCareers,
      profileSummary: {
        interests,
        educationLevel: student.educationRecords.length > 0 ? student.educationRecords[0].level : null,
        hasAssessment: !!recentAssessment,
      },
      strengths: strengths.map(s => ({ area: s, description: `Strong interest in ${s}` })),
      skillGaps: skillGaps.slice(0, 8),
    });
  } catch {
    return error("Failed to get career recommendations", 500);
  }
}
