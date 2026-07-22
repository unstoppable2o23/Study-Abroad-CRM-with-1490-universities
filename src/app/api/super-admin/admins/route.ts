import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { success, unauthorized, forbidden } from "@/lib/api-response";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "users:manage"); } catch { return forbidden(); }

  const admins = await prisma.user.findMany({
    where: {
      role: { in: ["ADMIN", "COUNSELOR", "DOCUMENT_VERIFIER"] },
      deletedAt: null,
    },
    select: {
      id: true,
      email: true,
      username: true,
      fullName: true,
      role: true,
      isActive: true,
      status: true,
      lastLoginAt: true,
      createdAt: true,
      organizationId: true,
      organization: { select: { id: true, name: true, slug: true, isActive: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return success(admins);
}
