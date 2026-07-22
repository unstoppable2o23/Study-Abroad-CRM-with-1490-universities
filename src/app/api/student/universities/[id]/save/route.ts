import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { success, unauthorized, error } from "@/lib/api-response";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { id } = await params;

  const student = await prisma.student.findUnique({ where: { userId: user.userId } });
  if (!student) return error("Student profile not found", 404);

  const university = await prisma.university.findUnique({ where: { id } });
  if (!university) return error("University not found", 404);

  const existing = await prisma.preferredStudyOption.findFirst({
    where: { studentId: student.id, type: "UNIVERSITY", referenceId: id },
  });

  if (existing) {
    await prisma.preferredStudyOption.delete({ where: { id: existing.id } });
    return success({ saved: false, message: "University removed from saved" });
  }

  await prisma.preferredStudyOption.create({
    data: { studentId: student.id, type: "UNIVERSITY", referenceId: id, label: university.name, priority: 0 },
  });

  return success({ saved: true, message: "University saved" });
}
