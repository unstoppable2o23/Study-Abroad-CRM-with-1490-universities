import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { success, error, unauthorized, forbidden } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  try {
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: { include: { permission: true } },
        _count: { select: { users: true } },
      },
    });
    if (!role) return error("Role not found", 404);
    return success(role);
  } catch {
    return error("Failed to fetch role", 500);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "users:manage"); } catch { return forbidden(); }

  const { id } = await context.params;

  try {
    const existing = await prisma.role.findUnique({ where: { id } });
    if (!existing) return error("Role not found", 404);
    if (existing.isSystem) return error("System roles cannot be modified", 403);

    const body = await request.json();
    const { name, description, permissionIds } = body;

    if (name) {
      const nameExists = await prisma.role.findFirst({ where: { name, NOT: { id } } });
      if (nameExists) return error("Role name already exists", 409);
    }

    const role = await prisma.$transaction(async (tx) => {
      if (permissionIds) {
        await tx.rolePermission.deleteMany({ where: { roleId: id } });
        await tx.rolePermission.createMany({
          data: permissionIds.map((permissionId: string) => ({ roleId: id, permissionId })),
        });
      }

      return tx.role.update({
        where: { id },
        data: { ...(name && { name }), ...(description !== undefined && { description }) },
        include: { rolePermissions: { include: { permission: true } } },
      });
    });

    await createAuditLog({
      organizationId: user.organizationId, userId: user.userId,
      action: "ROLE_UPDATED", entity: "Role", entityId: id,
      oldValue: { name: existing.name }, newValue: { name: role.name },
    });

    return success(role);
  } catch {
    return error("Failed to update role", 500);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "users:manage"); } catch { return forbidden(); }

  const { id } = await context.params;

  try {
    const existing = await prisma.role.findUnique({ where: { id }, include: { _count: { select: { users: true } } } });
    if (!existing) return error("Role not found", 404);
    if (existing.isSystem) return error("System roles cannot be deleted", 403);
    if (existing._count.users > 0) return error("Cannot delete role with assigned users", 400);

    await prisma.role.delete({ where: { id } });

    await createAuditLog({
      organizationId: user.organizationId, userId: user.userId,
      action: "ROLE_DELETED", entity: "Role", entityId: id,
      oldValue: { name: existing.name },
    });

    return success({ message: "Role deleted" });
  } catch {
    return error("Failed to delete role", 500);
  }
}
