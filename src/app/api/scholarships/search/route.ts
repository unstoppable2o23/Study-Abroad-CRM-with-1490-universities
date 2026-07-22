import { prisma } from "@/lib/prisma";
import { success, error } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const q = url.searchParams.get("q") || "";
    const type = url.searchParams.get("type");
    const countryId = url.searchParams.get("countryId");
    const universityId = url.searchParams.get("universityId");
    const academicLevel = url.searchParams.get("academicLevel");
    const minAmount = url.searchParams.get("minAmount");
    const maxAmount = url.searchParams.get("maxAmount");
    const deadlineBefore = url.searchParams.get("deadlineBefore");
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null, isActive: true };

    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { eligibility: { contains: q, mode: "insensitive" } },
      ];
    }

    if (type) where.type = type;
    if (countryId) where.countryId = countryId;
    if (universityId) where.universityId = universityId;
    if (academicLevel) where.academicLevels = { has: academicLevel };
    if (minAmount) where.amountMax = { gte: parseFloat(minAmount) };
    if (maxAmount) where.amount = { lte: parseFloat(maxAmount) };
    if (deadlineBefore) where.deadline = { lte: new Date(deadlineBefore) };

    const [scholarships, total] = await Promise.all([
      prisma.scholarship.findMany({
        where,
        include: {
          country: { select: { id: true, name: true, code: true, flagUrl: true } },
          university: { select: { id: true, name: true } },
        },
        orderBy: [{ isFeatured: "desc" }, { deadline: "asc" }],
        skip,
        take: limit,
      }),
      prisma.scholarship.count({ where }),
    ]);

    return success({
      scholarships,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return error("Failed to search scholarships", 500);
  }
}
