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
    const status = url.searchParams.get("status");
    const region = url.searchParams.get("region");
    const search = url.searchParams.get("search");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (region) where.region = region;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const countries = await prisma.country.findMany({
      where,
      include: { _count: { select: { universities: true, courses: true, faqs: true } } },
      orderBy: { name: "asc" },
    });

    return success(countries);
  } catch {
    return error("Failed to fetch countries", 500);
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "universities:create"); } catch { return forbidden(); }

  try {
    const body = await request.json();
    const { name, code, flagUrl, description, overview, region, educationSystem, popularLevels, popularCourses, intakePeriods, visaInfo, studentVisaProcess, visaDocuments, visaTimeline, workOpportunities, prOpportunities, culture, livingCost, currency, language, roadmap, status } = body;

    if (!name || !code) return error("Name and code are required", 400);

    const existingName = await prisma.country.findUnique({ where: { name } });
    if (existingName) return error("Country name already exists", 409);

    const existingCode = await prisma.country.findUnique({ where: { code: code.toUpperCase() } });
    if (existingCode) return error("Country code already exists", 409);

    const country = await prisma.country.create({
      data: {
        name, code: code.toUpperCase(), flagUrl, description, overview, region, educationSystem,
        popularLevels: popularLevels || [], popularCourses: popularCourses || [], intakePeriods: intakePeriods || [],
        visaInfo, studentVisaProcess, visaDocuments: visaDocuments || null, visaTimeline,
        workOpportunities, prOpportunities, culture,
        livingCost: livingCost ? parseFloat(livingCost) : null,
        currency, language, roadmap: roadmap || null,
        status: status || "PUBLISHED",
        normalizedName: slugify(name),
      },
    });

    await createAuditLog({
      organizationId: user.organizationId, userId: user.userId,
      action: "COUNTRY_CREATED", entity: "Country", entityId: country.id,
      newValue: { name, code: code.toUpperCase() },
    });

    return success(country, 201);
  } catch {
    return error("Failed to create country", 500);
  }
}
