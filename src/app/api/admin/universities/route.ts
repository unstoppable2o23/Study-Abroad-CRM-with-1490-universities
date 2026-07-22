import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { unauthorized, forbidden, success } from "@/lib/api-response";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "universities:read"); } catch { return forbidden(); }

  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const state = url.searchParams.get("state") || "";
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "50");

  const where: Record<string, unknown> = { deletedAt: null, isActive: true };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { city: { contains: search, mode: "insensitive" } },
      { country: { name: { contains: search, mode: "insensitive" } } },
    ];
  }
  if (state) where.state = state;

  const [universities, total] = await Promise.all([
    prisma.university.findMany({
      where,
      include: {
        country: { select: { id: true, name: true, code: true } },
        _count: { select: { courses: true } },
      },
      orderBy: { name: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.university.count({ where }),
  ]);

  return success({ data: universities, total, page, limit, totalPages: Math.ceil(total / limit) });
}
