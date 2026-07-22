import { prisma } from "@/lib/prisma";

export async function createCall(data: {
  studentId: string;
  applicationId?: string;
  callerId: string;
  callType?: string;
  duration?: number;
  notes?: string;
  outcome?: string;
  followUpRequired?: boolean;
}) {
  return prisma.call.create({
    data: {
      studentId: data.studentId,
      applicationId: data.applicationId,
      callerId: data.callerId,
      callType: data.callType || "OUTBOUND",
      duration: data.duration,
      notes: data.notes,
      outcome: data.outcome,
      followUpRequired: data.followUpRequired || false,
    },
    include: {
      student: { select: { id: true, fullName: true } },
      caller: { select: { id: true, fullName: true } },
    },
  });
}

export async function getCalls(where: any = {}) {
  return prisma.call.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      student: { select: { id: true, fullName: true } },
      caller: { select: { id: true, fullName: true } },
      application: { select: { id: true, status: true } },
    },
  });
}
