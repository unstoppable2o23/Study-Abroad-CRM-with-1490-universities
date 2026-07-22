import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { success, error, unauthorized, forbidden, notFound } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "organizations:manage"); } catch { return forbidden(); }

  const { id } = await params;
  const org = await prisma.organization.findUnique({
    where: { id },
    include: {
      _count: { select: { users: true, students: true } },
      users: { select: { id: true, email: true, fullName: true, role: true, isActive: true, status: true, createdAt: true } },
    },
  });
  if (!org) return notFound();
  return success(org);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "organizations:manage"); } catch { return forbidden(); }

  const { id } = await params;
  const body = await request.json();
  const { name, logo, brandColor, subscriptionStart, subscriptionEnd, plan, isActive } = body;

  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name;
  if (logo !== undefined) data.logo = logo;
  if (brandColor !== undefined) data.brandColor = brandColor;
  if (subscriptionStart !== undefined) data.subscriptionStart = new Date(subscriptionStart);
  if (subscriptionEnd !== undefined) data.subscriptionEnd = new Date(subscriptionEnd);
  if (plan !== undefined) data.plan = plan;
  if (isActive !== undefined) data.isActive = isActive;

  const org = await prisma.organization.update({
    where: { id },
    data,
  });

  await createAuditLog({
    organizationId: id,
    userId: user.userId,
    action: "ORGANIZATION_UPDATED",
    entity: "Organization",
    entityId: id,
    newValue: data,
  });

  return success(org);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "organizations:manage"); } catch { return forbidden(); }

  const { id } = await params;
  await prisma.organization.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  });

  await createAuditLog({
    organizationId: id,
    userId: user.userId,
    action: "ORGANIZATION_DELETED",
    entity: "Organization",
    entityId: id,
  });

  return success({ message: "Organization deactivated" });
}
