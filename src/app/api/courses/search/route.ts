import { prisma } from "@/lib/prisma";
import { success, error } from "@/lib/api-response";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const countryId = url.searchParams.get("countryId") || "";
    const countryIds = countryId ? countryId.split(",") : [];
    const universityId = url.searchParams.get("universityId") || "";
    const level = url.searchParams.get("level") || "";
    const category = url.searchParams.get("category") || "";
    const feeMax = url.searchParams.get("feeMax");
    const sortBy = url.searchParams.get("sortBy") || "name";
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") || "20")));

    const where: Prisma.CourseWhereInput = { isActive: true, deletedAt: null };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ];
    }

    if (countryIds.length > 0) where.countryId = { in: countryIds };
    if (universityId) where.universityId = universityId;
    if (level) where.level = level;
    if (category) where.category = category;
    if (feeMax) {
      where.tuitionFeeMin = { lte: parseFloat(feeMax) };
    }

    const orderBy: Prisma.CourseOrderByWithRelationInput[] = [];
    if (sortBy === "fee") {
      orderBy.push({ tuitionFeeMin: { sort: "asc", nulls: "last" } });
    } else {
      orderBy.push({ name: "asc" });
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          country: { select: { id: true, name: true, code: true } },
          university: { select: { id: true, name: true } },
          careers: { select: { id: true, name: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.course.count({ where }),
    ]);

    return success({
      courses: courses.map((c) => ({
        id: c.id, name: c.name, code: c.code, level: c.level, category: c.category,
        description: c.description, duration: c.duration,
        tuitionFeeMin: c.tuitionFeeMin, tuitionFeeMax: c.tuitionFeeMax, currency: c.currency,
        country: c.country, universityName: c.university?.name, universityId: c.university?.id,
        careers: c.careers,
      })),
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return error("Failed to search courses", 500);
  }
}
