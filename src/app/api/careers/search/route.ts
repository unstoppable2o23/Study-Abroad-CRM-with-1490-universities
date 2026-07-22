import { prisma } from "@/lib/prisma";
import { success, error } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const q = url.searchParams.get("q") || "";
    const categoryId = url.searchParams.get("categoryId") || "";
    const emerging = url.searchParams.get("emerging");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");

    const where: any = { deletedAt: null, status: { not: "DISABLED" } };
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { industry: { contains: q, mode: "insensitive" } },
        { skills: { has: q } },
      ];
    }
    if (categoryId) where.categoryId = categoryId;
    if (emerging === "true") where.isEmerging = true;

    const [careers, total] = await Promise.all([
      prisma.career.findMany({
        where,
        include: {
          categoryRef: { select: { id: true, name: true } },
          _count: { select: { courses: true } },
        },
        orderBy: { name: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.career.count({ where }),
    ]);

    return success({ data: careers, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch {
    return error("Failed to search careers", 500);
  }
}
