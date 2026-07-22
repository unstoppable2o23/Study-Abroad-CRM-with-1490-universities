import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { success, error, unauthorized, forbidden } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "universities:update"); } catch { return forbidden(); }

  const { id } = await context.params;

  try {
    const existing = await prisma.university.findUnique({ where: { id } });
    if (!existing) return error("University not found", 404);

    const body = await request.json();
    const { status } = body;

    const validStatuses = ["DRAFT", "PENDING_REVIEW", "APPROVED", "PUBLISHED", "DISABLED"];
    if (!status || !validStatuses.includes(status)) {
      return error(`Status must be one of: ${validStatuses.join(", ")}`, 400);
    }

    const updated = await prisma.university.update({
      where: { id },
      data: { status },
    });

    await createAuditLog({
      organizationId: user.organizationId,
      userId: user.userId,
      action: "UNIVERSITY_STATUS_CHANGED",
      entity: "University",
      entityId: id,
      oldValue: { status: existing.status },
      newValue: { status },
    });

    return success(updated);
  } catch {
    return error("Failed to update university status", 500);
  }
}
