import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { unauthorized, forbidden, success } from "@/lib/api-response";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "psychometric:read"); } catch { return forbidden(); }

  const url = new URL(request.url);
  const studentId = url.searchParams.get("studentId");

  const tests = await prisma.psychometricTest.findMany({
    where: { isActive: true },
    include: { _count: { select: { questions: true, assignments: true } } },
    orderBy: { createdAt: "desc" },
  });

  if (studentId) {
    const student = await prisma.student.findFirst({
      where: { id: studentId, organizationId: user.organizationId, deletedAt: null },
    });
    if (!student) return forbidden();

    const assignments = await prisma.psychometricAssignment.findMany({
      where: { studentId },
      select: { testId: true, status: true, score: true, completedAt: true },
    });

    return success({ tests, assignments });
  }

  return success(tests);
}
