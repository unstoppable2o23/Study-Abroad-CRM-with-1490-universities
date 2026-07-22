import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { success, error, unauthorized, forbidden } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "50");

    const where: any = {};
    if (search) where.name = { contains: search, mode: "insensitive" };

    const [examTypes, total] = await Promise.all([
      prisma.examType.findMany({
        where,
        orderBy: { name: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.examType.count({ where }),
    ]);

    return success({ data: examTypes, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch {
    return error("Failed to fetch exam types", 500);
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "settings:update"); } catch { return forbidden(); }

  try {
    const body = await request.json();
    const { name, code, description, minScore, maxScore, scoreUnit } = body;

    if (!name || !code) return error("Name and code are required", 400);

    const existing = await prisma.examType.findFirst({
      where: { OR: [{ name }, { code }] },
    });
    if (existing) return error("An exam type with this name or code already exists", 409);

    const examType = await prisma.examType.create({
      data: { name, code, description, minScore: minScore ? parseFloat(minScore) : null, maxScore: maxScore ? parseFloat(maxScore) : null, scoreUnit },
    });

    return success(examType, 201);
  } catch {
    return error("Failed to create exam type", 500);
  }
}
