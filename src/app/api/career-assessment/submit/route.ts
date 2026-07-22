import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized } from "@/lib/api-response";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const student = await prisma.student.findUnique({ where: { userId: user.userId } });
    if (!student) return error("Student not found", 404);

    const body = await request.json();
    const { sessionId, responses } = body;

    if (!responses || !Array.isArray(responses) || responses.length === 0) {
      return error("Assessment responses are required", 400);
    }

    const questions = await prisma.careerAssessmentQuestion.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });

    const questionMap = new Map(questions.map(q => [q.id, q]));

    // Score by category
    const categoryScores: Record<string, { total: number; count: number }> = {};
    for (const response of responses) {
      const question = questionMap.get(response.questionId);
      if (!question) continue;

      const cat = question.category || "GENERAL";
      if (!categoryScores[cat]) categoryScores[cat] = { total: 0, count: 0 };

      let score = 0;
      if (question.questionType === "MCQ" && typeof response.answer === "number") {
        score = response.answer;
      } else if (question.questionType === "RATING") {
        score = typeof response.answer === "number" ? response.answer : 0;
      }

      categoryScores[cat].total += score * (question.weight || 1);
      categoryScores[cat].count++;
    }

    const scores: Record<string, number> = {};
    for (const [cat, data] of Object.entries(categoryScores)) {
      scores[cat] = Math.round((data.total / (data.count * 5)) * 100);
    }

    // Find career matches based on scores
    const allCareers = await prisma.career.findMany({
      where: { isActive: true, deletedAt: null },
      include: { _count: { select: { courses: true } } },
    });

    const careerMatches = allCareers.map(career => {
      let matchScore = 0;

      // Interest score
      if (scores.INTEREST) matchScore += scores.INTEREST * 0.3;

      // Skills match (based on skills[] overlap with assessment categories)
      if (scores.SKILLS && career.skills.length > 0) {
        matchScore += scores.SKILLS * 0.25;
      }

      // Personality fit
      if (scores.PERSONALITY) matchScore += scores.PERSONALITY * 0.2;

      // Aptitude
      if (scores.APTITUDE) matchScore += scores.APTITUDE * 0.15;

      // Course pathways bonus
      if (career._count.courses > 0) matchScore += 10;

      return {
        careerId: career.id,
        careerName: career.name,
        score: Math.min(Math.round(matchScore), 100),
        skills: career.skills,
        eligibility: career.eligibility,
      };
    });

    const sortedMatches = careerMatches.sort((a, b) => b.score - a.score);
    const topMatches = sortedMatches.slice(0, 5);

    const strengths: string[] = [];
    const weaknesses: string[] = [];

    for (const [cat, score] of Object.entries(scores)) {
      if (score >= 70) strengths.push(`Strong ${cat.toLowerCase()} abilities`);
      else if (score < 40) weaknesses.push(`Consider developing ${cat.toLowerCase()} skills`);
    }

    const recommendedCareers = topMatches.map(m => m.careerName);

    // Save session and assessment
    if (sessionId) {
      await prisma.careerAssessmentSession.update({
        where: { id: sessionId },
        data: {
          status: "COMPLETED",
          responses,
          scores,
          result: { matches: topMatches, strengths, weaknesses, recommendedCareers },
          completedAt: new Date(),
        },
      });
    }

    const assessment = await prisma.careerAssessment.create({
      data: {
        studentId: student.id,
        type: "CAREER_ASSESSMENT",
        scores,
        result: { matches: topMatches, strengths, weaknesses },
        careerMatches: topMatches.map(m => m.careerName),
        strengths,
        weaknesses,
        sessionId: sessionId || undefined,
      },
    });

    return success({
      assessmentId: assessment.id,
      sessionId,
      scores,
      matches: topMatches,
      strengths,
      weaknesses,
      recommendedCareers,
    });
  } catch {
    return error("Failed to submit assessment", 500);
  }
}
