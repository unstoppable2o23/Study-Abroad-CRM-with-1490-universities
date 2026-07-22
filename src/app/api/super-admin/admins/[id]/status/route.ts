import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { success, error, unauthorized, forbidden } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "users:manage"); } catch { return forbidden(); }

  const { id } = await params;
  const body = await request.json();
  const { isActive } = body;

  if (isActive === undefined) return error("isActive field is required", 400);

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return error("User not found", 404);
  if (target.role === "SUPER_ADMIN") return error("Cannot modify Super Admin status", 403);

  const updated = await prisma.user.update({
    where: { id },
    data: {
      isActive,
      status: isActive ? "ACTIVE" : "INACTIVE",
    },
  });

  await createAuditLog({
    organizationId: updated.organizationId,
    userId: user.userId,
    action: isActive ? "ADMIN_ACTIVATED" : "ADMIN_DEACTIVATED",
    entity: "User",
    entityId: id,
    newValue: { email: target.email, role: target.role, isActive },
  });

  return success({ id: updated.id, isActive: updated.isActive, status: updated.status });
}
