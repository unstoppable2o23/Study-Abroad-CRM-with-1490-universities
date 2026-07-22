import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { success, unauthorized, forbidden } from "@/lib/api-response";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "audit:read"); } catch { return forbidden(); }

  const url = new URL(request.url);
  const action = url.searchParams.get("action") || "";
  const entity = url.searchParams.get("entity") || "";
  const orgId = url.searchParams.get("organizationId") || "";
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "50");

  const where: Record<string, unknown> = {};
  if (action) where.action = action;
  if (entity) where.entity = entity;
  if (orgId) where.organizationId = orgId;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: { select: { id: true, email: true, fullName: true } },
        organization: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return success({
    data: logs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}
