import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { success, error, unauthorized, forbidden, notFound } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "careers:update"); } catch { return forbidden(); }

  const { id } = await params;
  const body = await request.json();
  const { name, description, skills, eligibility, futureScope, salaryTrends, recruiters, isEmerging, roadmap, isActive } = body;

  const existing = await prisma.career.findUnique({ where: { id } });
  if (!existing) return notFound();

  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name;
  if (description !== undefined) data.description = description;
  if (skills !== undefined) data.skills = skills;
  if (eligibility !== undefined) data.eligibility = eligibility;
  if (futureScope !== undefined) data.futureScope = futureScope;
  if (salaryTrends !== undefined) data.salaryTrends = salaryTrends;
  if (recruiters !== undefined) data.recruiters = recruiters;
  if (isEmerging !== undefined) data.isEmerging = isEmerging;
  if (roadmap !== undefined) data.roadmap = roadmap;
  if (isActive !== undefined) data.isActive = isActive;

  const career = await prisma.career.update({ where: { id }, data });

  await createAuditLog({
    userId: user.userId,
    action: "CAREER_UPDATED",
    entity: "Career",
    entityId: id,
    newValue: { name: career.name },
  });

  return success(career);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "careers:delete"); } catch { return forbidden(); }

  const { id } = await params;
  const existing = await prisma.career.findUnique({ where: { id } });
  if (!existing) return notFound();

  await prisma.career.update({
    where: { id },
    data: { isActive: false, deletedAt: new Date() },
  });

  await createAuditLog({
    userId: user.userId,
    action: "CAREER_DELETED",
    entity: "Career",
    entityId: id,
    newValue: { name: existing.name },
  });

  return success({ message: "Career deleted" });
}
