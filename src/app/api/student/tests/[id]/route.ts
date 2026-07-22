import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized } from "@/lib/api-response";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const { id } = await context.params;

    const assignment = await prisma.psychometricAssignment.findFirst({
      where: {
        id,
        student: { userId: user.userId },
        status: { in: ["ASSIGNED", "IN_PROGRESS"] },
      },
      include: {
        test: {
          include: {
            sections: {
              where: { isActive: true },
              orderBy: { order: "asc" },
              include: {
                questions: {
                  orderBy: { order: "asc" },
                  select: { id: true, question: true, options: true, category: true, order: true, scoringRule: true },
                },
              },
            },
            questions: {
              orderBy: { order: "asc" },
              select: { id: true, question: true, options: true, category: true, order: true, scoringRule: true, sectionId: true },
            },
          },
        },
      },
    });

    if (!assignment) return error("Assignment not found or not available", 404);

    return success(assignment);
  } catch {
    return error("Failed to fetch test", 500);
  }
}
