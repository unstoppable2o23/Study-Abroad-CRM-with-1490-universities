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
    const university = await prisma.university.findUnique({
      where: { id },
      include: {
        country: true,
        courses: { where: { isActive: true, deletedAt: null }, take: 50 },
        scholarships: { where: { isActive: true } },
        images: { where: { type: "GALLERY" } },
        documents: { where: { isPublic: true } },
        rankings: { orderBy: { year: "desc" } },
      },
    });
    if (!university) return error("University not found", 404);
    return success(university);
  } catch {
    return error("Failed to fetch university", 500);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "universities:update"); } catch { return forbidden(); }

  const { id } = await context.params;

  try {
    const existing = await prisma.university.findUnique({ where: { id } });
    if (!existing) return error("University not found", 404);

    const body = await request.json();
    const allowedFields = [
      "name", "countryId", "city", "description", "website", "ranking", "rankingSource",
      "intakePeriods", "applicationFee", "logoUrl", "accreditation", "eligibility",
      "admissionRequirements", "feeStructure", "applicationProcess", "deadlines",
      "status", "visibility", "isActive",
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === "ranking") updateData[field] = body[field] ? parseInt(body[field]) : null;
        else if (field === "applicationFee") updateData[field] = body[field] ? parseFloat(body[field]) : null;
        else updateData[field] = body[field];
      }
    }

    if (body.name) {
      updateData.normalizedName = slugify(body.name);
    }

    const updated = await prisma.university.update({
      where: { id },
      data: updateData,
      include: { country: { select: { id: true, name: true } } },
    });

    await createAuditLog({
      organizationId: user.organizationId,
      userId: user.userId,
      action: "UNIVERSITY_UPDATED",
      entity: "University",
      entityId: id,
      oldValue: { name: existing.name },
      newValue: { ...updateData },
    });

    return success(updated);
  } catch {
    return error("Failed to update university", 500);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "universities:delete"); } catch { return forbidden(); }

  const { id } = await context.params;

  try {
    const existing = await prisma.university.findUnique({ where: { id } });
    if (!existing) return error("University not found", 404);

    await prisma.university.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

    await createAuditLog({
      organizationId: user.organizationId,
      userId: user.userId,
      action: "UNIVERSITY_DELETED",
      entity: "University",
      entityId: id,
      oldValue: { name: existing.name },
    });

    return success({ message: "University deleted" });
  } catch {
    return error("Failed to delete university", 500);
  }
}
