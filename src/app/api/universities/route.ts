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
    const countryId = url.searchParams.get("countryId");
    const search = url.searchParams.get("search");
    const status = url.searchParams.get("status");
    const visibility = url.searchParams.get("visibility");
    const state = url.searchParams.get("state");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");

    const where: any = { deletedAt: null };
    where.isActive = true;
    if (countryId) where.countryId = countryId;
    if (search) where.name = { contains: search, mode: "insensitive" };
    if (status) where.status = status;
    if (visibility) where.visibility = visibility;
    if (state) where.state = state;

    const [universities, total] = await Promise.all([
      prisma.university.findMany({
        where,
        include: { country: { select: { name: true, code: true } }, _count: { select: { courses: true } } },
        orderBy: { ranking: { sort: "asc", nulls: "last" } },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.university.count({ where }),
    ]);

    return success({
      data: universities.map((u) => ({ ...u, countryName: u.country.name, coursesCount: u._count.courses })),
      total, page, limit, totalPages: Math.ceil(total / limit),
    });
  } catch {
    return error("Failed to fetch universities", 500);
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "universities:create"); } catch { return forbidden(); }

  try {
    const body = await request.json();
    const { name, countryId, city, description, website, ranking, rankingSource, intakePeriods, applicationFee, logoUrl, accreditation, eligibility, admissionRequirements, feeStructure, applicationProcess, deadlines, status, visibility } = body;

    if (!name || !countryId) return error("Name and country are required", 400);

    const normalizedName = slugify(name);

    const duplicate = await prisma.university.findFirst({
      where: { normalizedName, countryId, deletedAt: null },
    });
    if (duplicate) return error("A university with this name already exists in this country", 409);

    const university = await prisma.university.create({
      data: {
        name, countryId, city, description, website,
        ranking: ranking ? parseInt(ranking) : null,
        rankingSource, intakePeriods: intakePeriods || [],
        applicationFee: applicationFee ? parseFloat(applicationFee) : null,
        logoUrl, accreditation, eligibility, admissionRequirements,
        feeStructure, applicationProcess, deadlines,
        status: status || "PUBLISHED",
        visibility: visibility || "GLOBAL",
        normalizedName,
      },
      include: { country: { select: { id: true, name: true } } },
    });

    await createAuditLog({
      organizationId: user.organizationId,
      userId: user.userId,
      action: "UNIVERSITY_CREATED",
      entity: "University",
      entityId: university.id,
      newValue: { name, countryId },
    });

    return success(university, 201);
  } catch {
    return error("Failed to create university", 500);
  }
}
