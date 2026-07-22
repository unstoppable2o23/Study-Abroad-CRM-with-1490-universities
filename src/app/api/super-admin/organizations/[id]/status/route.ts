import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { success, error, unauthorized, forbidden } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "organizations:manage"); } catch { return forbidden(); }

  const { id } = await params;
  const body = await request.json();
  const { isActive } = body;

  if (isActive === undefined) return error("isActive field is required", 400);

  const org = await prisma.organization.update({
    where: { id },
    data: { isActive },
  });

  await createAuditLog({
    organizationId: id,
    userId: user.userId,
    action: isActive ? "ORGANIZATION_ACTIVATED" : "ORGANIZATION_DEACTIVATED",
    entity: "Organization",
    entityId: id,
  });

  return success({ id: org.id, isActive: org.isActive });
}
