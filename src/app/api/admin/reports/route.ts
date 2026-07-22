import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { unauthorized, forbidden, success } from "@/lib/api-response";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "reports:read"); } catch { return forbidden(); }

  const url = new URL(request.url);
  const type = url.searchParams.get("type") || "students";
  const orgId = user.organizationId;

  const exportData = await prisma.student.findMany({
    where: { organizationId: orgId, deletedAt: null },
    include: {
      documents: { select: { type: true, status: true, createdAt: true } },
      applications: { select: { status: true, universityId: true, createdAt: true } },
      _count: { select: { applications: true, documents: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const rows = exportData.map(s => ({
    fullName: s.fullName,
    email: s.email,
    mobile: s.mobile,
    gender: s.gender,
    country: s.country,
    status: s.status,
    preferredCountry: s.preferredCountry,
    preferredCourse: s.preferredCourse,
    applications: s._count.applications,
    documents: s._count.documents,
    createdAt: s.createdAt.toISOString(),
  }));

  return success({ type, total: rows.length, data: rows, generatedAt: new Date().toISOString() });
}
