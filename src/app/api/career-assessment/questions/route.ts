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

    const questions = await prisma.careerAssessmentQuestion.findMany({
      where: { isActive: true },
      orderBy: [{ category: "asc" }, { order: "asc" }],
    });

    return success({
      questions: questions.map(q => ({
        id: q.id, category: q.category, questionText: q.questionText,
        questionType: q.questionType, options: q.options, order: q.order,
      })),
      total: questions.length,
    });
  } catch {
    return error("Failed to fetch assessment questions", 500);
  }
}
