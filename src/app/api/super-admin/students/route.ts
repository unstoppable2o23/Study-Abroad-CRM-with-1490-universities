import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { success, unauthorized, forbidden } from "@/lib/api-response";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "students:read"); } catch { return forbidden(); }

  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const status = url.searchParams.get("status") || "";
  const orgId = url.searchParams.get("organizationId") || "";
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "50");

  const where: Record<string, unknown> = { deletedAt: null };
  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }
  if (status) where.status = status;
  if (orgId) where.organizationId = orgId;

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      include: {
        organization: { select: { id: true, name: true } },
        counselor: { select: { id: true, fullName: true } },
        _count: { select: { applications: true, documents: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.student.count({ where }),
  ]);

  return success({ data: students, total, page, limit, totalPages: Math.ceil(total / limit) });
}
