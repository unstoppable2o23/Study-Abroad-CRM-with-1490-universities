import { prisma } from "@/lib/prisma";
import { auditLogger, logSecurityEvent, logAuditEvent } from "@/lib/logger";

interface AuditLogInput {
  organizationId?: string;
  userId?: string;
  studentId?: string;
  action: string;
  entity: string;
  entityId?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export async function createAuditLog(input: AuditLogInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        organizationId: input.organizationId,
        userId: input.userId,
        studentId: input.studentId,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        oldValue: input.oldValue as any,
        newValue: input.newValue as any,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
    });

    logAuditEvent(
      input.action,
      input.entity,
      input.entityId || "",
      input.oldValue,
      input.newValue,
      input.userId,
      input.organizationId
    );
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
}

export async function getAuditLogs(params: {
  organizationId?: string;
  userId?: string;
  entity?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}) {
  const where: any = {};

  if (params.organizationId) where.organizationId = params.organizationId;
  if (params.userId) where.userId = params.userId;
  if (params.entity) where.entity = params.entity;
  if (params.action) where.action = params.action;
  if (params.startDate || params.endDate) {
    where.createdAt = {};
    if (params.startDate) where.createdAt.gte = params.startDate;
    if (params.endDate) where.createdAt.lte = params.endDate;
  }

  const page = params.page || 1;
  const limit = params.limit || 50;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    data: logs,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export function getClientInfo(request: Request): { ip: string; userAgent: string } {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";
  return { ip, userAgent };
}

export async function logFailedLogin(
  email: string,
  ip: string,
  userAgent: string,
  reason: string
): Promise<void> {
  logSecurityEvent(
    "failed_login",
    "medium",
    { email, reason },
    undefined,
    ip
  );

  await createAuditLog({
    action: "LOGIN_FAILED",
    entity: "User",
    entityId: email,
    newValue: { email, reason },
    ipAddress: ip,
    userAgent,
  });
}

export async function logSuccessfulLogin(
  userId: string,
  email: string,
  organizationId: string,
  ip: string,
  userAgent: string
): Promise<void> {
  await createAuditLog({
    organizationId,
    userId,
    action: "LOGIN_SUCCESS",
    entity: "User",
    entityId: userId,
    newValue: { email },
    ipAddress: ip,
    userAgent,
  });
}

export async function logDataAccess(
  userId: string,
  organizationId: string,
  entity: string,
  entityId: string,
  action: "READ" | "EXPORT",
  ip: string,
  userAgent: string
): Promise<void> {
  await createAuditLog({
    organizationId,
    userId,
    action: `DATA_${action}`,
    entity,
    entityId,
    ipAddress: ip,
    userAgent,
  });
}