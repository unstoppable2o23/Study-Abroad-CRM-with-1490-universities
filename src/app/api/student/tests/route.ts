import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized } from "@/lib/api-response";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const student = await prisma.student.findUnique({ where: { userId: user.userId } });
    if (!student) return error("Student profile not found", 404);

    const assignments = await prisma.psychometricAssignment.findMany({
      where: { studentId: student.id },
      include: {
        test: {
          include: {
            sections: { where: { isActive: true }, orderBy: { order: "asc" }, select: { id: true, title: true, order: true } },
            _count: { select: { questions: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return success(assignments);
  } catch {
    return error("Failed to fetch tests", 500);
  }
}
