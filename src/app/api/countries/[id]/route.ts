import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { success, error, unauthorized, forbidden } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const country = await prisma.country.findUnique({
      where: { id },
      include: {
        universities: { where: { deletedAt: null }, take: 20, orderBy: { ranking: { sort: "asc", nulls: "last" } } },
        scholarships: { where: { isActive: true } },
        faqs: { where: { isActive: true }, orderBy: { order: "asc" } },
        countryScholarships: { where: { isActive: true } },
        _count: { select: { universities: true, courses: true } },
      },
    });
    if (!country) return error("Country not found", 404);
    return success(country);
  } catch {
    return error("Failed to fetch country", 500);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "universities:update"); } catch { return forbidden(); }

  const { id } = await context.params;

  try {
    const existing = await prisma.country.findUnique({ where: { id } });
    if (!existing) return error("Country not found", 404);

    const body = await request.json();
    const allowedFields = [
      "name", "code", "flagUrl", "description", "overview", "region", "educationSystem",
      "popularLevels", "popularCourses", "intakePeriods", "visaInfo", "studentVisaProcess",
      "visaDocuments", "visaTimeline", "workOpportunities", "prOpportunities", "culture",
      "livingCost", "currency", "language", "roadmap", "status",
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === "livingCost") updateData[field] = body[field] ? parseFloat(body[field]) : null;
        else updateData[field] = body[field];
      }
    }

    if (body.name) updateData.normalizedName = slugify(body.name);
    if (body.code) updateData.code = body.code.toUpperCase();

    const updated = await prisma.country.update({
      where: { id },
      data: updateData,
    });

    await createAuditLog({
      organizationId: user.organizationId, userId: user.userId,
      action: "COUNTRY_UPDATED", entity: "Country", entityId: id,
      oldValue: { name: existing.name }, newValue: { ...updateData },
    });

    return success(updated);
  } catch {
    return error("Failed to update country", 500);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "universities:delete"); } catch { return forbidden(); }

  const { id } = await context.params;

  try {
    const existing = await prisma.country.findUnique({ where: { id } });
    if (!existing) return error("Country not found", 404);

    await prisma.country.update({ where: { id }, data: { status: "DISABLED" } });

    await createAuditLog({
      organizationId: user.organizationId, userId: user.userId,
      action: "COUNTRY_DISABLED", entity: "Country", entityId: id,
      oldValue: { name: existing.name },
    });

    return success({ message: "Country disabled" });
  } catch {
    return error("Failed to disable country", 500);
  }
}
