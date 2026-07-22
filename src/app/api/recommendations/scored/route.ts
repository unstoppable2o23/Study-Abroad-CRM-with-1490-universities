import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized } from "@/lib/api-response";
import { scoreUniversities, scoreCourses } from "@/lib/recommendations/scoring";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const url = new URL(request.url);
    const type = url.searchParams.get("type") || "university";

    const student = await prisma.student.findUnique({ where: { userId: user.userId } });
    if (!student) return error("Student profile not found", 404);

    const educationRecords = await prisma.educationRecord.findMany({ where: { studentId: student.id } });
    const examScores = await prisma.studentExamScore.findMany({
      where: { studentId: student.id },
      include: { examType: { select: { name: true } } },
    });
    const interests = await prisma.studentInterest.findMany({ where: { studentId: student.id } });
    const careerAssessments = await prisma.careerAssessment.findMany({ where: { studentId: student.id } });
    const preferences = await prisma.preferredStudyOption.findMany({ where: { studentId: student.id } });

    const profile = {
      userId: user.userId,
      educationRecords: educationRecords.map(e => ({
        level: e.level, percentage: e.percentage || undefined, cgpa: e.cgpa || undefined,
      })),
      examScores: Object.fromEntries(examScores.map(e => [e.examType.name, e.bandScore || parseFloat(e.score || "0")])),
      interests: interests.map(i => i.interest),
      preferredCountries: preferences.filter(p => p.type === "COUNTRY").map(p => p.referenceId || p.label),
      preferredCourses: preferences.filter(p => p.type === "COURSE").map(p => p.referenceId || p.label),
      careerGoals: careerAssessments.flatMap(c => c.careerMatches),
    };

    if (type === "course") {
      const scored = await scoreCourses(profile);
      return success({ recommendations: scored.slice(0, 20), total: scored.length, profile });
    }

    const scored = await scoreUniversities(profile);
    return success({ recommendations: scored.slice(0, 20), total: scored.length, profile });
  } catch {
    return error("Failed to generate recommendations", 500);
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const body = await request.json();
    const { type, recommendations } = body;

    if (!type || !recommendations || !Array.isArray(recommendations)) {
      return error("type and recommendations array are required", 400);
    }

    const student = await prisma.student.findUnique({ where: { userId: user.userId } });
    if (!student) return error("Student profile not found", 404);

    const saved = [];
    for (const rec of recommendations) {
      if (type === "university") {
        const existing = await prisma.universityRecommendation.findFirst({
          where: { studentId: student.id, universityId: rec.id, category: rec.category || "BEST_FIT" },
        });
        if (existing) continue;

        const created = await prisma.universityRecommendation.create({
          data: {
            studentId: student.id,
            universityId: rec.id,
            category: rec.category || "BEST_FIT",
            confidenceScore: rec.score || null,
            reason: rec.reason || null,
            matchDetails: rec.breakdown || null,
            isAccepted: rec.isAccepted || false,
          },
        });
        saved.push(created);
      } else {
        const created = await prisma.recommendation.create({
          data: {
            studentId: student.id,
            type: type.toUpperCase(),
            title: rec.name,
            description: rec.reason || null,
            score: rec.score || null,
            metadata: rec.breakdown || null,
          },
        });
        saved.push(created);
      }
    }

    return success({ saved: saved.length, total: recommendations.length });
  } catch {
    return error("Failed to save recommendations", 500);
  }
}
