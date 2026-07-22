import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized, forbidden } from "@/lib/api-response";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "STUDENT") return forbidden();

  try {
    const { id } = await context.params;

    const assignment = await prisma.psychometricAssignment.findFirst({
      where: {
        id,
        student: { userId: user.userId },
        status: "ASSIGNED",
      },
      include: {
        test: {
          include: {
            sections: {
              where: { isActive: true },
              orderBy: { order: "asc" },
              include: { questions: { orderBy: { order: "asc" } } },
            },
            questions: { orderBy: { order: "asc" } },
          },
        },
      },
    });

    if (!assignment) return error("Assignment not found or not available", 404);
    if (assignment.expiresAt && new Date(assignment.expiresAt) < new Date()) {
      return error("Test has expired", 400);
    }

    const updated = await prisma.psychometricAssignment.update({
      where: { id },
      data: { status: "IN_PROGRESS", startedAt: new Date() },
      include: {
        test: {
          include: {
            sections: { where: { isActive: true }, orderBy: { order: "asc" }, include: { questions: { orderBy: { order: "asc" } } } },
          },
        },
      },
    });

    return success({
      id: updated.id,
      status: updated.status,
      startedAt: updated.startedAt,
      expiresAt: updated.expiresAt,
      test: {
        id: updated.test.id,
        title: updated.test.title,
        description: updated.test.description,
        type: updated.test.type,
        timeLimit: updated.test.timeLimit,
        instructions: updated.test.instructions,
        sections: updated.test.sections.map(s => ({
          id: s.id,
          title: s.title,
          description: s.description,
          order: s.order,
          timeLimit: s.timeLimit,
          questions: s.questions.map(q => ({
            id: q.id,
            question: q.question,
            options: q.options,
            type: q.scoringRule === "RATING_SCALE" ? "RATING" : "MCQ",
            category: q.category,
            order: q.order,
          })),
        })),
      },
    });
  } catch {
    return error("Failed to start test", 500);
  }
}
