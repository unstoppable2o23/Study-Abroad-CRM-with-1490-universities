import { prisma } from "@/lib/prisma";

export async function logActivity(options: {
  type: string;
  description: string;
  studentId: string;
  applicationId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}) {
  return prisma.activity.create({
    data: {
      type: options.type,
      description: options.description,
      studentId: options.studentId,
      applicationId: options.applicationId,
      userId: options.userId,
      metadata: options.metadata as any || undefined,
    },
  });
}

export async function getRecentActivities(options: {
  studentId?: string;
  applicationId?: string;
  limit?: number;
}) {
  const where: any = {};
  if (options.studentId) where.studentId = options.studentId;
  if (options.applicationId) where.applicationId = options.applicationId;

  return prisma.activity.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: options.limit || 20,
    include: { student: { select: { id: true, fullName: true } } },
  });
}
