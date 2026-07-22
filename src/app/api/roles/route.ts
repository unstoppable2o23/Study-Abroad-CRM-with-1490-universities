import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { success, error, unauthorized, forbidden } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const roles = await prisma.role.findMany({
      include: {
        rolePermissions: {
          include: { permission: { select: { id: true, name: true, module: true, description: true } } },
        },
        _count: { select: { users: true } },
      },
      orderBy: { name: "asc" },
    });
    return success(roles);
  } catch {
    return error("Failed to fetch roles", 500);
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "users:manage"); } catch { return forbidden(); }

  try {
    const body = await request.json();
    const { name, description, permissionIds } = body;

    if (!name) return error("Name is required", 400);

    const existing = await prisma.role.findUnique({ where: { name } });
    if (existing) return error("Role already exists", 409);

    const role = await prisma.role.create({
      data: {
        name,
        description,
        rolePermissions: permissionIds ? {
          create: permissionIds.map((permissionId: string) => ({ permissionId })),
        } : undefined,
      },
      include: {
        rolePermissions: { include: { permission: { select: { id: true, name: true } } } },
      },
    });

    await createAuditLog({
      organizationId: user.organizationId, userId: user.userId,
      action: "ROLE_CREATED", entity: "Role", entityId: role.id,
      newValue: { name, permissions: permissionIds?.length || 0 },
    });

    return success(role, 201);
  } catch {
    return error("Failed to create role", 500);
  }
}
