import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { success, unauthorized } from "@/lib/api-response";
import { rolePermissions, type Permission } from "@/lib/rbac";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const dbPermissions = await prisma.permission.findMany({
      orderBy: [{ module: "asc" }, { name: "asc" }],
    });

    const matrix = Object.entries(rolePermissions).map(([role, perms]) => ({
      role,
      permissions: perms,
      count: perms.length,
    }));

    return success({
      allPermissions: dbPermissions.length > 0 ? dbPermissions : getDefaultPermissions(),
      permissionMatrix: matrix,
    });
  } catch {
    return success({ allPermissions: getDefaultPermissions(), permissionMatrix: [] });
  }
}

function getDefaultPermissions() {
  const seen = new Set<string>();
  const perms: Array<{ name: string; module: string; description: string }> = [];

  for (const [, permsList] of Object.entries(rolePermissions)) {
    for (const p of permsList) {
      if (!seen.has(p)) {
        seen.add(p);
        const [module] = p.split(":");
        perms.push({ name: p, module, description: `Can ${p.replace(":", " ")}` });
      }
    }
  }

  return perms;
}
