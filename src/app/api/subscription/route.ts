import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { success, error, unauthorized, forbidden } from "@/lib/api-response";
import { getSubscriptionStatus, checkPlanLimit, PLAN_LIMITS } from "@/lib/subscription";
import { createAuditLog } from "@/lib/audit";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const org = await prisma.organization.findUnique({
      where: { id: user.organizationId },
      select: { id: true, name: true, plan: true, isActive: true, subscriptionStart: true, subscriptionEnd: true, createdAt: true },
    });
    if (!org) return error("Organization not found", 404);

    const status = await getSubscriptionStatus(user.organizationId);
    const limits = PLAN_LIMITS[org.plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.TRIAL;

    const [studentCount, userCount] = await Promise.all([
      prisma.student.count({ where: { organizationId: user.organizationId, deletedAt: null } }),
      prisma.user.count({ where: { organizationId: user.organizationId, isActive: true } }),
    ]);

    const limitsWithUsage = {
      students: { limit: limits.students, current: studentCount },
      users: { limit: limits.users, current: userCount },
    };

    return success({ ...org, status, limits: limitsWithUsage });
  } catch {
    return error("Failed to fetch subscription info", 500);
  }
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "organizations:manage"); } catch { return forbidden(); }

  try {
    const body = await request.json();
    const { plan, subscriptionStart, subscriptionEnd, isActive } = body;

    const updateData: Record<string, unknown> = {};
    if (plan) updateData.plan = plan;
    if (subscriptionStart !== undefined) updateData.subscriptionStart = subscriptionStart ? new Date(subscriptionStart) : null;
    if (subscriptionEnd !== undefined) updateData.subscriptionEnd = subscriptionEnd ? new Date(subscriptionEnd) : null;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updated = await prisma.organization.update({
      where: { id: user.organizationId },
      data: updateData,
    });

    await createAuditLog({
      organizationId: user.organizationId, userId: user.userId,
      action: "SUBSCRIPTION_UPDATED", entity: "Organization", entityId: updated.id,
      newValue: { plan: updated.plan, subscriptionEnd: updated.subscriptionEnd, isActive: updated.isActive },
    });

    return success(updated);
  } catch {
    return error("Failed to update subscription", 500);
  }
}
