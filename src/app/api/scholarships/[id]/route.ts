import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { success, error, unauthorized, forbidden } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const scholarship = await prisma.scholarship.findUnique({
      where: { id },
      include: {
        country: { select: { id: true, name: true, code: true, flagUrl: true } },
        university: { select: { id: true, name: true, ranking: true } },
        course: { select: { id: true, name: true } },
      },
    });

    if (!scholarship || scholarship.deletedAt) return error("Scholarship not found", 404);
    return success(scholarship);
  } catch {
    return error("Failed to fetch scholarship", 500);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "universities:update"); } catch { return forbidden(); }

  const { id } = await context.params;

  try {
    const existing = await prisma.scholarship.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) return error("Scholarship not found", 404);

    const body = await request.json();
    const allowedFields = [
      "name", "description", "type", "amount", "amountMax", "currency", "eligibility",
      "coverage", "applicationUrl", "deadline", "intakeSeasons", "academicLevels",
      "gpaRequirement", "englishTest", "documentsRequired", "nationalities",
      "isFeatured", "isActive", "countryId", "universityId", "courseId",
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === "amount" || field === "amountMax" || field === "gpaRequirement") {
          updateData[field] = body[field] ? parseFloat(body[field]) : null;
        } else if (field === "deadline") {
          updateData[field] = body[field] ? new Date(body[field]) : null;
        } else {
          updateData[field] = body[field];
        }
      }
    }

    if (body.name) updateData.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const updated = await prisma.scholarship.update({
      where: { id },
      data: updateData,
    });

    await createAuditLog({
      organizationId: user.organizationId, userId: user.userId,
      action: "SCHOLARSHIP_UPDATED", entity: "Scholarship", entityId: id,
      oldValue: { name: existing.name }, newValue: { ...updateData },
    });

    return success(updated);
  } catch {
    return error("Failed to update scholarship", 500);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "universities:delete"); } catch { return forbidden(); }

  const { id } = await context.params;

  try {
    const existing = await prisma.scholarship.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) return error("Scholarship not found", 404);

    await prisma.scholarship.update({ where: { id }, data: { deletedAt: new Date() } });

    await createAuditLog({
      organizationId: user.organizationId, userId: user.userId,
      action: "SCHOLARSHIP_DELETED", entity: "Scholarship", entityId: id,
      oldValue: { name: existing.name },
    });

    return success({ message: "Scholarship deleted" });
  } catch {
    return error("Failed to delete scholarship", 500);
  }
}
