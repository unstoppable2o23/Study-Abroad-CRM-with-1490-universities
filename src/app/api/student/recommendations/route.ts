import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { success, unauthorized } from "@/lib/api-response";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const student = await prisma.student.findUnique({ where: { userId: user.userId } });
  if (!student) return success({ universities: [], careers: [] });

  const universities = await prisma.university.findMany({
    where: { isActive: true, deletedAt: null },
    include: { country: { select: { id: true, name: true } }, _count: { select: { courses: true } } },
    take: 10,
    orderBy: { ranking: { sort: "asc", nulls: "last" } },
  });

  const careers = await prisma.career.findMany({
    where: { isActive: true, deletedAt: null },
    include: { _count: { select: { psychometricMatches: true } } },
    take: 10,
    orderBy: { name: "asc" },
  });

  const saved = await prisma.preferredStudyOption.findMany({
    where: { studentId: student.id, type: "UNIVERSITY" },
    select: { referenceId: true },
  });
  const savedIds = new Set(saved.map(s => s.referenceId));

  return success({
    universities: universities.map(u => ({ ...u, isSaved: savedIds.has(u.id) })),
    careers,
    savedCount: savedIds.size,
  });
}
