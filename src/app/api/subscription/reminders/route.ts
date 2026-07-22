import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { success, error, unauthorized, forbidden } from "@/lib/api-response";
import { createNotification } from "@/lib/notifications/service";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "organizations:manage"); } catch { return forbidden(); }

  try {
    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const expiringOrgs = await prisma.organization.findMany({
      where: {
        isActive: true,
        subscriptionEnd: { gte: now, lte: in30Days },
      },
      select: { id: true, name: true, subscriptionEnd: true },
    });

    const created = [];
    for (const org of expiringOrgs) {
      const daysLeft = Math.ceil((org.subscriptionEnd!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Notify all active admins in the org
      const admins = await prisma.user.findMany({
        where: { organizationId: org.id, role: "ADMIN", isActive: true },
        select: { id: true },
      });

      for (const admin of admins) {
        if (daysLeft <= 7) {
          const n = await createNotification({
            userId: admin.id, type: "SUBSCRIPTION_EXPIRY",
            title: "Subscription Expiring Soon",
            message: `Your ${org.name} subscription expires in ${daysLeft} days (${org.subscriptionEnd?.toLocaleDateString()}). Please renew to avoid service interruption.`,
            metadata: { organizationId: org.id, daysLeft, expiryDate: org.subscriptionEnd?.toISOString() },
          });
          if (n) created.push(n);
        }
      }
    }

    return success({ organizations: expiringOrgs.length, notificationsCreated: created.length });
  } catch {
    return error("Failed to process subscription reminders", 500);
  }
}
