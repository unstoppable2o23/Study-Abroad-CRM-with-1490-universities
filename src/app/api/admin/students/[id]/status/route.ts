import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { success, error, unauthorized, forbidden } from "@/lib/api-response";
import { createAuditLog, getClientInfo } from "@/lib/audit";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "students:activate"); } catch { return forbidden(); }

  const { id } = await params;

  const student = await prisma.student.findFirst({
    where: { id, organizationId: user.organizationId, deletedAt: null },
  });
  if (!student) return error("Student not found", 404);
  if (!student.userId) return error("Student has no user account", 400);

  try {
    const body = await request.json();
    const { isActive } = body;

    if (typeof isActive !== "boolean") return error("isActive (boolean) is required", 400);

    await prisma.user.update({
      where: { id: student.userId },
      data: { isActive, status: isActive ? "ACTIVE" : "INACTIVE" },
    });

    const { ip, userAgent } = getClientInfo(request);
    await createAuditLog({
      organizationId: user.organizationId,
      userId: user.userId,
      studentId: id,
      action: isActive ? "STUDENT_ACTIVATED" : "STUDENT_DEACTIVATED",
      entity: "Student",
      entityId: id,
      newValue: { isActive },
      ipAddress: ip,
      userAgent,
    });

    return success({ message: isActive ? "Student activated" : "Student deactivated" });
  } catch {
    return error("Failed to update student status", 500);
  }
}
