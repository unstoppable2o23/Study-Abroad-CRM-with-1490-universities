import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { unauthorized, forbidden, success } from "@/lib/api-response";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "documents:read"); } catch { return forbidden(); }

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");

  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where: { status: "PENDING", student: { organizationId: user.organizationId }, deletedAt: null },
      include: {
        student: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.document.count({ where: { status: "PENDING", student: { organizationId: user.organizationId }, deletedAt: null } }),
  ]);

  return success({ data: documents, total, page, limit, totalPages: Math.ceil(total / limit) });
}
