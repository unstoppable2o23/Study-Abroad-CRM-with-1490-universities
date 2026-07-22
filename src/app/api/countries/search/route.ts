import { prisma } from "@/lib/prisma";
import { success, error } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const q = url.searchParams.get("q") || "";
    const region = url.searchParams.get("region") || "";
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");

    const where: Record<string, unknown> = { status: "PUBLISHED" };
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { educationSystem: { contains: q, mode: "insensitive" } },
        { popularCourses: { has: q } },
        { region: { contains: q, mode: "insensitive" } },
      ];
    }
    if (region) where.region = region;

    const [countries, total] = await Promise.all([
      prisma.country.findMany({
        where,
        include: { _count: { select: { universities: true } } },
        orderBy: { name: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.country.count({ where }),
    ]);

    return success({ data: countries, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch {
    return error("Failed to search countries", 500);
  }
}
