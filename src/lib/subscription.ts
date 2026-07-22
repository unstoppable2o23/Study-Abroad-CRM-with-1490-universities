import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function checkSubscription(request: NextRequest): Promise<NextResponse | null> {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (user.role === "SUPER_ADMIN") return null;

  const org = await prisma.organization.findUnique({
    where: { id: user.organizationId },
    select: { subscriptionEnd: true, isActive: true },
  });

  if (!org || !org.isActive) {
    return NextResponse.json(
      { error: "Organization is inactive", code: "ORG_INACTIVE" },
      { status: 403 }
    );
  }

  if (org.subscriptionEnd && new Date(org.subscriptionEnd) < new Date()) {
    return NextResponse.json(
      {
        error: "Subscription has expired",
        code: "SUBSCRIPTION_EXPIRED",
        expiredAt: org.subscriptionEnd,
      },
      { status: 403 }
    );
  }

  return null;
}

export function subscriptionMiddleware(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const subscriptionCheck = await checkSubscription(request);
    if (subscriptionCheck) return subscriptionCheck;

    return handler(request);
  };
}

export async function requireActiveSubscription(
  organizationId: string
): Promise<{ valid: boolean; error?: string; expiredAt?: Date }> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { subscriptionEnd: true, isActive: true },
  });

  if (!org || !org.isActive) {
    return { valid: false, error: "Organization is inactive" };
  }

  if (org.subscriptionEnd && new Date(org.subscriptionEnd) < new Date()) {
    return { valid: false, error: "Subscription has expired", expiredAt: org.subscriptionEnd };
  }

  return { valid: true };
}

export function getSubscriptionStatus(organizationId: string): Promise<{
  isActive: boolean;
  daysRemaining: number | null;
  expiredAt: Date | null;
}> {
  return prisma.organization
    .findUnique({
      where: { id: organizationId },
      select: { subscriptionEnd: true, isActive: true },
    })
    .then((org) => {
      if (!org || !org.isActive) {
        return { isActive: false, daysRemaining: null, expiredAt: null };
      }

      if (!org.subscriptionEnd) {
        return { isActive: true, daysRemaining: null, expiredAt: null };
      }

      const now = new Date();
      const expiry = new Date(org.subscriptionEnd);
      const diffMs = expiry.getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      return {
        isActive: diffMs > 0,
        daysRemaining: diffMs > 0 ? daysRemaining : 0,
        expiredAt: org.subscriptionEnd,
      };
    });
}

export const PLAN_LIMITS = {
  TRIAL: { students: 50, users: 5, storage: 100 * 1024 * 1024 },
  BASIC: { students: 200, users: 10, storage: 500 * 1024 * 1024 },
  PROFESSIONAL: { students: 1000, users: 25, storage: 2 * 1024 * 1024 * 1024 },
  ENTERPRISE: { students: -1, users: -1, storage: -1 },
} as const;

export async function checkPlanLimit(
  organizationId: string,
  resource: keyof typeof PLAN_LIMITS.TRIAL,
  currentUsage: number
): Promise<{ allowed: boolean; limit: number; usage: number }> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { plan: true },
  });

  if (!org) return { allowed: false, limit: 0, usage: currentUsage };

  const plan = org.plan || "TRIAL";
  const limit = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS]?.[resource] ?? PLAN_LIMITS.TRIAL[resource];

  if (limit === -1) return { allowed: true, limit: -1, usage: currentUsage };

  return {
    allowed: currentUsage < limit,
    limit,
    usage: currentUsage,
  };
}