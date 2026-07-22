import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { success, error, unauthorized, forbidden } from "@/lib/api-response";
import { createAuditLog, getClientInfo } from "@/lib/audit";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "psychometric:assign"); } catch { return forbidden(); }

  try {
    const body = await request.json();
    const { testId, studentId, expiresAt } = body;

    if (!testId || !studentId) return error("Test ID and Student ID are required", 400);

    const student = await prisma.student.findFirst({
      where: { id: studentId, organizationId: user.organizationId, deletedAt: null },
    });
    if (!student) return error("Student not found in your organization", 404);

    const test = await prisma.psychometricTest.findUnique({ where: { id: testId } });
    if (!test) return error("Test not found", 404);

    const assignment = await prisma.psychometricAssignment.create({
      data: {
        testId,
        studentId,
        status: "ASSIGNED",
        expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      include: { test: true, student: { select: { id: true, fullName: true, email: true } } },
    });

    await prisma.notification.create({
      data: {
        userId: student.userId,
        studentId,
        type: "TEST_ASSIGNMENT",
        title: "Psychometric Test Assigned",
        message: `Test "${test.title}" has been assigned to you. Please complete it by ${assignment.expiresAt ? new Date(assignment.expiresAt).toLocaleDateString() : "N/A"}.`,
      },
    });

    if (student.status === "REGISTERED" || student.status === "PROFILE_INCOMPLETE" || student.status === "DOCUMENTS_PENDING" || student.status === "DOCUMENTS_APPROVED") {
      await prisma.student.update({ where: { id: studentId }, data: { status: "PSYCHOMETRIC_ASSIGNED" } });
    }

    const { ip, userAgent } = getClientInfo(request);
    await createAuditLog({
      organizationId: user.organizationId,
      userId: user.userId,
      studentId,
      action: "PSYCHOMETRIC_ASSIGN",
      entity: "PsychometricAssignment",
      entityId: assignment.id,
      newValue: { testId, studentId, expiresAt: assignment.expiresAt },
      ipAddress: ip,
      userAgent,
    });

    return success(assignment, 201);
  } catch {
    return error("Failed to assign test", 500);
  }
}
