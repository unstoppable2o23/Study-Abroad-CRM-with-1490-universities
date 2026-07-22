import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { success, error, unauthorized, forbidden } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get("type");
    const countryId = url.searchParams.get("countryId");
    const universityId = url.searchParams.get("universityId");
    const search = url.searchParams.get("search");
    const featured = url.searchParams.get("featured");
    const academicLevel = url.searchParams.get("academicLevel");
    const intakeSeason = url.searchParams.get("intakeSeason");

    const where: Record<string, unknown> = { deletedAt: null };
    if (type) where.type = type;
    if (countryId) where.countryId = countryId;
    if (universityId) where.universityId = universityId;
    if (featured === "true") where.isFeatured = true;
    if (academicLevel) where.academicLevels = { has: academicLevel };
    if (intakeSeason) where.intakeSeasons = { has: intakeSeason };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { eligibility: { contains: search, mode: "insensitive" } },
      ];
    }

    const [scholarships, total] = await Promise.all([
      prisma.scholarship.findMany({
        where,
        include: {
          country: { select: { id: true, name: true, code: true, flagUrl: true } },
          university: { select: { id: true, name: true } },
        },
        orderBy: [{ isFeatured: "desc" }, { deadline: "asc" }],
      }),
      prisma.scholarship.count({ where }),
    ]);

    return success({ scholarships, total });
  } catch {
    return error("Failed to fetch scholarships", 500);
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "universities:create"); } catch { return forbidden(); }

  try {
    const body = await request.json();
    const { name, description, type, amount, amountMax, currency, eligibility, coverage, applicationUrl, deadline, intakeSeasons, academicLevels, gpaRequirement, englishTest, documentsRequired, nationalities, isFeatured, countryId, universityId, courseId } = body;

    if (!name) return error("Name is required", 400);

    const slug = slugify(name);

    const existing = await prisma.scholarship.findUnique({ where: { slug } });
    if (existing) return error("Scholarship with this name already exists", 409);

    const scholarship = await prisma.scholarship.create({
      data: {
        name, slug, description, type,
        amount: amount ? parseFloat(amount) : null,
        amountMax: amountMax ? parseFloat(amountMax) : null,
        currency, eligibility,
        coverage: coverage || [], applicationUrl,
        deadline: deadline ? new Date(deadline) : null,
        intakeSeasons: intakeSeasons || [],
        academicLevels: academicLevels || [],
        gpaRequirement: gpaRequirement ? parseFloat(gpaRequirement) : null,
        englishTest, documentsRequired: documentsRequired || [],
        nationalities: nationalities || [],
        isFeatured: isFeatured || false,
        countryId, universityId, courseId,
      },
    });

    await createAuditLog({
      organizationId: user.organizationId, userId: user.userId,
      action: "SCHOLARSHIP_CREATED", entity: "Scholarship", entityId: scholarship.id,
      newValue: { name },
    });

    return success(scholarship, 201);
  } catch {
    return error("Failed to create scholarship", 500);
  }
}
