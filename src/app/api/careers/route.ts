import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { success, error, unauthorized, forbidden } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("search");
    const emerging = url.searchParams.get("emerging");
    const categoryId = url.searchParams.get("categoryId");
    const status = url.searchParams.get("status");

    const where: any = { deletedAt: null };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { industry: { contains: search, mode: "insensitive" } },
      ];
    }
    if (emerging === "true") where.isEmerging = true;
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;
    else where.status = { not: "DISABLED" };

    const careers = await prisma.career.findMany({
      where,
      include: {
        categoryRef: { select: { id: true, name: true, slug: true } },
        _count: { select: { courses: true, psychometricMatches: true } },
      },
      orderBy: { name: "asc" },
    });

    return success(careers);
  } catch {
    return error("Failed to fetch careers", 500);
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "careers:create"); } catch { return forbidden(); }

  try {
    const body = await request.json();
    const { name, description, skills, eligibility, futureScope, salaryTrends, recruiters, roadmap, isEmerging, categoryId, industry, minEducation, recommendedDegrees, status } = body;

    if (!name) return error("Name is required", 400);

    const normalizedName = slugify(name);

    const career = await prisma.career.create({
      data: {
        name, description, skills: skills || [], eligibility, futureScope,
        salaryTrends: salaryTrends || undefined,
        recruiters: recruiters || [],
        roadmap: roadmap || undefined,
        isEmerging: isEmerging || false,
        categoryId: categoryId || null,
        industry, minEducation,
        recommendedDegrees: recommendedDegrees || [],
        status: status || "PUBLISHED",
        normalizedName,
      },
    });

    await createAuditLog({
      organizationId: user.organizationId, userId: user.userId,
      action: "CAREER_CREATED", entity: "Career", entityId: career.id,
      newValue: { name },
    });

    return success(career, 201);
  } catch (e: any) {
    if (e?.code === "P2002") return error("Career with this name already exists", 409);
    return error("Failed to create career", 500);
  }
}
