import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog, getClientInfo } from "@/lib/audit";
import { getRedisClient, CACHE_KEYS, deleteCache } from "@/lib/redis";
import { error, success } from "@/lib/api-response";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  try {
    const { id } = await context.params;
    const document = await prisma.document.findUnique({
      where: { id, deletedAt: null },
      include: { student: true },
    });

    if (!document) return error("Document not found", 404);

    if (user.role === "STUDENT") {
      const student = await prisma.student.findUnique({ where: { userId: user.userId } });
      if (!student || document.studentId !== student.id) return error("Forbidden", 403);
    }

    return success(document);
  } catch {
    return error("Failed to fetch document", 500);
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  if (!["ADMIN", "DOCUMENT_VERIFIER"].includes(user.role)) return error("Forbidden", 403);

  try {
    const { id } = await context.params;
    const body = await request.json();

    const document = await prisma.document.findUnique({
      where: { id },
      include: { student: true },
    });

    if (!document) return error("Document not found", 404);

    if (user.role === "DOCUMENT_VERIFIER") {
      const hasAccess = await prisma.student.findFirst({
        where: { id: document.studentId, organizationId: user.organizationId },
      });
      if (!hasAccess) return error("Forbidden", 403);
    }

    const { status, reviewNotes } = body;
    const oldStatus = document.status;

    const updated = await prisma.document.update({
      where: { id },
      data: {
        status,
        reviewNotes,
        reviewedBy: user.userId,
        aiChecked: status === "APPROVED" || status === "REJECTED",
      },
    });

    const { ip, userAgent } = getClientInfo(request);
    await createAuditLog({
      organizationId: user.organizationId,
      userId: user.userId,
      studentId: document.studentId,
      action: "DOCUMENT_STATUS_CHANGE",
      entity: "Document",
      entityId: id,
      oldValue: { status: oldStatus },
      newValue: { status, reviewNotes },
      ipAddress: ip,
      userAgent,
    });

    const redis = await getRedisClient();
    if (redis) {
      await deleteCache(`notifications:${document.studentId}`);
    }

    return success(updated);
  } catch {
    return error("Failed to update document", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  try {
    const { id } = await context.params;
    const document = await prisma.document.findUnique({
      where: { id },
      include: { student: true },
    });

    if (!document) return error("Document not found", 404);

    if (user.role === "STUDENT") {
      const student = await prisma.student.findUnique({ where: { userId: user.userId } });
      if (!student || document.studentId !== student.id) return error("Forbidden", 403);
    }

    await prisma.document.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    const { ip, userAgent } = getClientInfo(request);
    await createAuditLog({
      organizationId: user.organizationId,
      userId: user.userId,
      studentId: document.studentId,
      action: "DOCUMENT_DELETE",
      entity: "Document",
      entityId: id,
      oldValue: { fileName: document.fileName, type: document.type },
      ipAddress: ip,
      userAgent,
    });

    return success({ message: "Document deleted" });
  } catch {
    return error("Failed to delete document", 500);
  }
}