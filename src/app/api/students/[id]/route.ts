import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { success, error } from "@/lib/api-response";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  try {
    const { id } = await context.params;
    const student = await prisma.student.findFirst({
      where: { id, organizationId: user.organizationId },
      include: {
        entranceExams: true,
        documents: { orderBy: { createdAt: "desc" } },
        applications: { include: { university: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
        psychometricTests: { include: { test: { select: { title: true } } } },
        notes: { include: { author: { select: { fullName: true } } }, orderBy: { createdAt: "desc" }, take: 10 },
      },
    });

    if (!student) return error("Student not found", 404);
    return success(student);
  } catch {
    return error("Failed to fetch student", 500);
  }
}
