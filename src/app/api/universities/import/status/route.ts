import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { success, unauthorized, forbidden } from "@/lib/api-response";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "universities:read"); } catch { return forbidden(); }

  const total = await prisma.university.count({ where: { deletedAt: null } });
  const byStatus = await prisma.university.groupBy({
    by: ["status"],
    where: { deletedAt: null },
    _count: true,
  });

  const byVisibility = await prisma.university.groupBy({
    by: ["visibility"],
    where: { deletedAt: null },
    _count: true,
  });

  const pendingReview = await prisma.university.count({ where: { status: "PENDING_REVIEW", deletedAt: null } });

  return success({
    total,
    pendingReview,
    byStatus: byStatus.map(s => ({ status: s.status, count: s._count })),
    byVisibility: byVisibility.map(v => ({ visibility: v.visibility, count: v._count })),
  });
}
