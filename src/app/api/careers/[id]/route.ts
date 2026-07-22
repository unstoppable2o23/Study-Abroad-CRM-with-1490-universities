import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { success, error, unauthorized, forbidden } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const career = await prisma.career.findUnique({
      where: { id },
      include: {
        categoryRef: true,
        courses: {
          select: { id: true, name: true, level: true, category: true, duration: true, universityId: true },
          take: 20,
        },
        psychometricMatches: { include: { test: { select: { id: true, title: true } } } },
      },
    });
    if (!career || career.deletedAt) return error("Career not found", 404);
    return success(career);
  } catch {
    return error("Failed to fetch career", 500);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "careers:update"); } catch { return forbidden(); }

  const { id } = await context.params;

  try {
    const existing = await prisma.career.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) return error("Career not found", 404);

    const body = await request.json();
    const allowedFields = [
      "name", "description", "skills", "eligibility", "futureScope",
      "salaryTrends", "recruiters", "roadmap", "isEmerging", "categoryId",
      "industry", "minEducation", "recommendedDegrees", "status",
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === "skills" || field === "recruiters" || field === "recommendedDegrees") {
          updateData[field] = body[field] || [];
        } else if (field === "isEmerging") {
          updateData[field] = Boolean(body[field]);
        } else {
          updateData[field] = body[field];
        }
      }
    }
    if (body.name) updateData.normalizedName = body.name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");

    const updated = await prisma.career.update({ where: { id }, data: updateData });

    await createAuditLog({
      organizationId: user.organizationId, userId: user.userId,
      action: "CAREER_UPDATED", entity: "Career", entityId: id,
      oldValue: { name: existing.name }, newValue: updateData,
    });

    return success(updated);
  } catch {
    return error("Failed to update career", 500);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "careers:delete"); } catch { return forbidden(); }

  const { id } = await context.params;

  try {
    const existing = await prisma.career.findUnique({ where: { id } });
    if (!existing) return error("Career not found", 404);

    await prisma.career.update({ where: { id }, data: { status: "DISABLED", deletedAt: new Date() } });

    await createAuditLog({
      organizationId: user.organizationId, userId: user.userId,
      action: "CAREER_DELETED", entity: "Career", entityId: id,
      oldValue: { name: existing.name },
    });

    return success({ message: "Career disabled" });
  } catch {
    return error("Failed to delete career", 500);
  }
}
