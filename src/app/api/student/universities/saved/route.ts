import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { success, unauthorized, error } from "@/lib/api-response";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const student = await prisma.student.findUnique({ where: { userId: user.userId } });
  if (!student) return success({ data: [], total: 0 });

  const saved = await prisma.preferredStudyOption.findMany({
    where: { studentId: student.id, type: "UNIVERSITY" },
    orderBy: { createdAt: "desc" },
  });

  const universityIds = saved.map(s => s.referenceId).filter(Boolean) as string[];
  const universities = universityIds.length > 0
    ? await prisma.university.findMany({
        where: { id: { in: universityIds }, deletedAt: null },
        include: { country: { select: { id: true, name: true } }, _count: { select: { courses: true } } },
      })
    : [];

  return success({ data: universities, total: universities.length });
}
