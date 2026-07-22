import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized } from "@/lib/api-response";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const student = await prisma.student.findUnique({
      where: { userId: user.userId },
    });
    if (!student) return error("Student not found", 404);

    const latestAssessment = await prisma.careerAssessment.findFirst({
      where: { studentId: student.id, type: "CAREER_ASSESSMENT" },
      orderBy: { createdAt: "desc" },
    });

    if (!latestAssessment) return error("No assessment found. Complete an assessment first.", 404);

    const matchCareers = latestAssessment.careerMatches || [];
    const careerDetails = await prisma.career.findMany({
      where: { name: { in: matchCareers }, isActive: true },
      include: {
        courses: { select: { id: true, name: true, level: true } },
        categoryRef: { select: { id: true, name: true } },
      },
    });

    const matches = (latestAssessment.result as any)?.matches || [];

    return success({
      assessment: {
        id: latestAssessment.id,
        type: latestAssessment.type,
        scores: latestAssessment.scores,
        completedAt: latestAssessment.createdAt,
      },
      strengths: latestAssessment.strengths,
      weaknesses: latestAssessment.weaknesses,
      careerMatches: matches.map((m: any) => {
        const detail = careerDetails.find(c => c.id === m.careerId || c.name === m.careerName);
        return {
          ...m,
          description: detail?.description || null,
          skills: detail?.skills || [],
          eligibility: detail?.eligibility || null,
          futureScope: detail?.futureScope || null,
          salaryTrends: detail?.salaryTrends || null,
          courses: detail?.courses || [],
          category: detail?.categoryRef || null,
          roadmap: detail?.roadmap || null,
        };
      }),
      recommendedCourses: careerDetails.flatMap(c => c.courses).slice(0, 10),
    });
  } catch {
    return error("Failed to fetch assessment report", 500);
  }
}
