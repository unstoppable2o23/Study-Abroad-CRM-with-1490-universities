import { prisma } from "@/lib/prisma";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { validatePassword } from "@/lib/password";
import { success, error, unauthorized, forbidden, validationError } from "@/lib/api-response";
import { createAuditLog, getClientInfo } from "@/lib/audit";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "students:update"); } catch { return forbidden(); }

  const { id } = await params;

  const student = await prisma.student.findFirst({
    where: { id, organizationId: user.organizationId, deletedAt: null },
  });
  if (!student) return error("Student not found", 404);
  if (!student.userId) return error("Student has no user account", 400);

  try {
    const body = await request.json();
    const { newPassword } = body;

    if (!newPassword) return error("New password is required", 400);

    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.valid) return validationError({ password: passwordCheck.errors });

    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: student.userId },
      data: { passwordHash, status: "ACTIVE" },
    });

    await prisma.refreshToken.deleteMany({ where: { userId: student.userId } });

    await prisma.notification.create({
      data: {
        userId: student.userId,
        studentId: student.id,
        type: "GENERAL",
        title: "Password Reset",
        message: "Your password has been reset by an administrator.",
      },
    });

    const { ip, userAgent } = getClientInfo(request);
    await createAuditLog({
      organizationId: user.organizationId,
      userId: user.userId,
      studentId: id,
      action: "STUDENT_PASSWORD_RESET",
      entity: "Student",
      entityId: id,
      newValue: { email: student.email },
      ipAddress: ip,
      userAgent,
    });

    return success({ message: "Password reset successfully" });
  } catch {
    return error("Failed to reset password", 500);
  }
}
