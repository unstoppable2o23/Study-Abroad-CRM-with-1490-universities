import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { unauthorized, forbidden, success } from "@/lib/api-response";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "careers:read"); } catch { return forbidden(); }

  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "50");

  const where: Record<string, unknown> = { deletedAt: null, isActive: true };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const [careers, total] = await Promise.all([
    prisma.career.findMany({
      where,
      include: { _count: { select: { psychometricMatches: true } } },
      orderBy: { name: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.career.count({ where }),
  ]);

  return success({ data: careers, total, page, limit, totalPages: Math.ceil(total / limit) });
}
