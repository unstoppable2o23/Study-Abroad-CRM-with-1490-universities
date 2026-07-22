import { getCurrentUser, type JwtPayload } from "@/lib/auth";
import { hasPermission, type Permission } from "@/lib/rbac";
import { unauthorized, forbidden } from "@/lib/api-response";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog, getClientInfo } from "@/lib/audit";

export type GuardResult =
  | { allowed: true; user: JwtPayload }
  | { allowed: false; response: NextResponse };

export async function requireAuth(request?: Request): Promise<GuardResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { allowed: false, response: unauthorized("Authentication required") };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.userId },
    select: { isActive: true, status: true },
  });

  if (!dbUser || !dbUser.isActive || dbUser.status !== "ACTIVE") {
    return { allowed: false, response: unauthorized("Account is not active") };
  }

  return { allowed: true, user };
}

export function requirePermission(
  user: JwtPayload,
  permission: Permission
): GuardResult {
  if (!hasPermission(user.role, permission)) {
    if (typeof globalThis !== "undefined") {
      createAuditLog({
        organizationId: user.organizationId,
        userId: user.userId,
        action: "PERMISSION_DENIED",
        entity: "Permission",
        entityId: permission,
        oldValue: { role: user.role, requiredPermission: permission },
        ipAddress: "internal",
        userAgent: "internal",
      });
    }
    return { allowed: false, response: forbidden("Insufficient permissions") };
  }
  return { allowed: true, user };
}

export async function requireTenant(
  user: JwtPayload,
  targetOrganizationId?: string | null
): Promise<GuardResult> {
  if (user.role === "SUPER_ADMIN") {
    return { allowed: true, user };
  }

  if (targetOrganizationId && user.organizationId !== targetOrganizationId) {
    return { allowed: false, response: forbidden("Cross-organization access denied") };
  }

  return { allowed: true, user };
}

export async function requireResourceOwnership(
  user: JwtPayload,
  resourceUserId?: string | null,
  resourceStudentId?: string | null
): Promise<GuardResult> {
  if (user.role === "SUPER_ADMIN") {
    return { allowed: true, user };
  }

  if (user.role === "STUDENT") {
    if (resourceUserId && resourceUserId !== user.userId) {
      return { allowed: false, response: forbidden("Cannot access other user's resources") };
    }
  }

  if (resourceStudentId) {
    const student = await prisma.student.findUnique({
      where: { id: resourceStudentId },
      select: { organizationId: true, userId: true },
    });

    if (!student) {
      return { allowed: false, response: forbidden("Resource not found") };
    }

    if (user.role === "COUNSELOR") {
      const assignment = await prisma.student.findFirst({
        where: { id: resourceStudentId, counselorId: user.userId },
      });
      if (!assignment) {
        return { allowed: false, response: forbidden("Student not assigned to you") };
      }
    }

    if (student.organizationId !== user.organizationId) {
      return { allowed: false, response: forbidden("Cross-organization resource access denied") };
    }

    if (user.role === "STUDENT" && student.userId !== user.userId) {
      return { allowed: false, response: forbidden("Cannot access other student's resources") };
    }
  }

  return { allowed: true, user };
}
