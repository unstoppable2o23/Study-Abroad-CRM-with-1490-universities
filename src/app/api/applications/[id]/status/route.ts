import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { success, error } from "@/lib/api-response";

const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["SUBMITTED"],
  SUBMITTED: ["UNDER_REVIEW", "REJECTED"],
  UNDER_REVIEW: ["OFFER_RECEIVED", "REJECTED"],
  OFFER_RECEIVED: ["OFFER_ACCEPTED", "OFFER_DECLINED"],
  OFFER_ACCEPTED: ["VISA_PROCESSING"],
  OFFER_DECLINED: [],
  VISA_PROCESSING: ["VISA_APPROVED", "VISA_REJECTED"],
  VISA_APPROVED: ["ENROLLED"],
  VISA_REJECTED: [],
  ENROLLED: [],
  REJECTED: [],
};

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  try {
    const { id } = await context.params;
    const body = await request.json();
    const { status, visaStatus, tuitionPaid, notes } = body;

    if (!status) return error("Status required", 400);

    const application = await prisma.application.findUnique({
      where: { id },
      include: { student: true },
    });

    if (!application) return error("Application not found", 404);

    const allowedTransitions = VALID_TRANSITIONS[application.status] || [];
    if (!allowedTransitions.includes(status)) {
      return error(`Invalid status transition from ${application.status} to ${status}`, 400);
    }

    if (user.role === "STUDENT" && application.student.userId !== user.userId) {
      return error("Forbidden", 403);
    }

    if (["ADMIN", "COUNSELOR"].includes(user.role)) {
      const hasAccess = await prisma.student.findFirst({
        where: { id: application.studentId, organizationId: user.organizationId },
      });
      if (!hasAccess) return error("Forbidden", 403);
    }

    const updateData: any = { status };
    if (status === "SUBMITTED") updateData.submittedAt = new Date();
    if (status === "OFFER_RECEIVED") updateData.offerReceivedAt = new Date();
    if (visaStatus !== undefined) updateData.visaStatus = visaStatus;
    if (tuitionPaid !== undefined) updateData.tuitionPaid = tuitionPaid;
    if (notes !== undefined) updateData.notes = notes;

    const updated = await prisma.application.update({
      where: { id },
      data: updateData,
    });

    await prisma.activity.create({
      data: {
        type: "APPLICATION_STATUS_CHANGE",
        description: `Application status changed from ${application.status} to ${status}`,
        studentId: application.studentId,
        applicationId: id,
        userId: user.userId,
        metadata: { oldStatus: application.status, newStatus: status },
      },
    });

    const { ip, userAgent } = await import("@/lib/audit").then(m => m.getClientInfo(request));
    await createAuditLog({
      organizationId: user.organizationId,
      userId: user.userId,
      studentId: application.studentId,
      action: "APPLICATION_STATUS_CHANGE",
      entity: "Application",
      entityId: id,
      oldValue: { status: application.status },
      newValue: { status, visaStatus, tuitionPaid, notes },
      ipAddress: ip,
      userAgent,
    });

    return success(updated);
  } catch {
    return error("Failed to update application status", 500);
  }
}