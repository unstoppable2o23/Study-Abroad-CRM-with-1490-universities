import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { success, error, unauthorized, forbidden } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        country: true,
        university: { select: { id: true, name: true, city: true, logoUrl: true } },
        categoryRef: { select: { id: true, name: true, slug: true } },
        careers: { select: { id: true, name: true, description: true, skills: true, salaryTrends: true } },
        scholarships: { where: { isActive: true } },
        universityCourses: {
          include: { university: { select: { id: true, name: true, city: true, logoUrl: true, countryId: true } } },
        },
      },
    });
    if (!course || course.deletedAt) return error("Course not found", 404);
    return success(course);
  } catch {
    return error("Failed to fetch course", 500);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "courses:update"); } catch { return forbidden(); }

  const { id } = await context.params;

  try {
    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) return error("Course not found", 404);

    const body = await request.json();
    const allowedFields = [
      "name", "code", "level", "category", "categoryId", "description", "duration",
      "skills", "tuitionFeeMin", "tuitionFeeMax", "currency", "countryId", "universityId",
      "eligibility", "requirements", "careerOutcomes", "popularIn", "entranceExams",
      "languageRequirements", "status",
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === "tuitionFeeMin" || field === "tuitionFeeMax") {
          updateData[field] = body[field] ? parseFloat(body[field]) : null;
        } else if (field === "skills" || field === "popularIn" || field === "entranceExams") {
          updateData[field] = body[field] || [];
        } else {
          updateData[field] = body[field];
        }
      }
    }
    if (body.name) updateData.normalizedName = body.name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");

    const updated = await prisma.course.update({ where: { id }, data: updateData });

    await createAuditLog({
      organizationId: user.organizationId, userId: user.userId,
      action: "COURSE_UPDATED", entity: "Course", entityId: id,
      oldValue: { name: existing.name }, newValue: updateData,
    });

    return success(updated);
  } catch {
    return error("Failed to update course", 500);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "courses:delete"); } catch { return forbidden(); }

  const { id } = await context.params;

  try {
    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) return error("Course not found", 404);

    await prisma.course.update({ where: { id }, data: { status: "DISABLED", deletedAt: new Date() } });

    await createAuditLog({
      organizationId: user.organizationId, userId: user.userId,
      action: "COURSE_DELETED", entity: "Course", entityId: id,
      oldValue: { name: existing.name },
    });

    return success({ message: "Course disabled" });
  } catch {
    return error("Failed to delete course", 500);
  }
}
