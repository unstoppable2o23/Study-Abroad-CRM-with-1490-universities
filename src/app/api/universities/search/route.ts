import { prisma } from "@/lib/prisma";
import { success, error } from "@/lib/api-response";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const countryId = url.searchParams.get("countryId") || "";
    const state = url.searchParams.get("state") || "";
    const countryIds = countryId ? countryId.split(",") : [];
    const rankingMax = url.searchParams.get("rankingMax");
    const intake = url.searchParams.get("intake") || "";
    const feeMax = url.searchParams.get("feeMax");
    const courseLevel = url.searchParams.get("courseLevel") || "";
    const sortBy = url.searchParams.get("sortBy") || "ranking";
    const sortOrder = url.searchParams.get("sortOrder") || "asc";
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") || "20")));

    const where: Prisma.UniversityWhereInput = { isActive: true, deletedAt: null };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (countryIds.length > 0) {
      where.countryId = { in: countryIds };
    }

    if (rankingMax) {
      where.ranking = { lte: parseInt(rankingMax) };
    }

    if (intake) {
      if (state) where.state = state;
      where.intakePeriods = { has: intake };
    }

    if (feeMax) {
      where.courses = { some: { tuitionFeeMin: { lte: parseFloat(feeMax) } } };
    }

    if (courseLevel) {
      where.courses = { ...(where.courses as any), some: { ...(where.courses as any)?.some, level: courseLevel } };
    }

    const orderBy: Prisma.UniversityOrderByWithRelationInput[] = [];
    if (sortBy === "name") {
      orderBy.push({ name: sortOrder as "asc" | "desc" });
    } else if (sortBy === "fee") {
      orderBy.push({ courses: { _count: sortOrder as "asc" | "desc" } });
    } else {
      orderBy.push({ ranking: { sort: sortOrder as "asc" | "desc", nulls: "last" } });
    }

    const [universities, total, countries] = await Promise.all([
      prisma.university.findMany({
        where,
        include: {
          country: { select: { id: true, name: true, code: true, flagUrl: true } },
          _count: { select: { courses: true, scholarships: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.university.count({ where }),
      prisma.country.findMany({ select: { id: true, name: true, code: true }, orderBy: { name: "asc" } }),
    ]);

    return success({
      universities: universities.map((u) => ({
        id: u.id, name: u.name, city: u.city, ranking: u.ranking, rankingSource: u.rankingSource,
        intakePeriods: u.intakePeriods, applicationFee: u.applicationFee, logoUrl: u.logoUrl,
        website: u.website, universityType: u.universityType,
        country: u.country, coursesCount: u._count.courses, scholarshipsCount: u._count.scholarships,
      })),
      countries,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(err);
    return error("Failed to search universities", 500);
  }
}
