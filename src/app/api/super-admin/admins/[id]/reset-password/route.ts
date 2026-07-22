import { prisma } from "@/lib/prisma";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { validatePassword } from "@/lib/password";
import { success, error, unauthorized, forbidden, validationError } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "users:manage"); } catch { return forbidden(); }

  const { id } = await params;
  const body = await request.json();
  const { newPassword } = body;

  if (!newPassword) return error("New password is required", 400);

  const passwordCheck = validatePassword(newPassword);
  if (!passwordCheck.valid) return validationError({ password: passwordCheck.errors });

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return error("User not found", 404);
  if (target.role === "SUPER_ADMIN") return error("Cannot reset Super Admin password", 403);

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id },
    data: { passwordHash, status: "ACTIVE" },
  });

  await prisma.refreshToken.deleteMany({ where: { userId: id } });

  await createAuditLog({
    organizationId: target.organizationId,
    userId: user.userId,
    action: "ADMIN_PASSWORD_RESET",
    entity: "User",
    entityId: id,
    newValue: { email: target.email },
  });

  return success({ message: "Password reset successfully" });
}
