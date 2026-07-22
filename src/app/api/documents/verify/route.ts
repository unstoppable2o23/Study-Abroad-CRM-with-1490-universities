import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog, getClientInfo } from "@/lib/audit";
import { success, error, unauthorized, forbidden } from "@/lib/api-response";
import { indexApprovedDocument } from "@/lib/documents/analysis";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (!["ADMIN", "DOCUMENT_VERIFIER"].includes(user.role)) return forbidden();

  const url = new URL(request.url);
  const status = url.searchParams.get("status") || "PENDING";
  const type = url.searchParams.get("type");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");

  const where: any = { student: { organizationId: user.organizationId } };
  if (status) where.status = status;
  if (type) where.type = type;

  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where,
      include: {
        student: { select: { id: true, fullName: true, email: true } },
        uploadedBy: { select: { id: true, fullName: true } },
        _count: { select: { comments: true, versions: true, analyses: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.document.count({ where }),
  ]);

  return success({ data: documents, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
}

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (!["ADMIN", "DOCUMENT_VERIFIER"].includes(user.role)) return forbidden();

  try {
    const body = await request.json();
    const { documentId, status, reviewNotes } = body;

    if (!documentId || !status) return error("Document ID and status required", 400);
    if (!["APPROVED", "REJECTED", "NEEDS_CORRECTION"].includes(status)) return error("Invalid status", 400);

    const document = await prisma.document.findFirst({
      where: { id: documentId, student: { organizationId: user.organizationId } },
      include: { student: true },
    });
    if (!document) return error("Document not found", 404);

    const updated = await prisma.document.update({
      where: { id: documentId },
      data: {
        status,
        reviewedBy: user.userId,
        reviewNotes: status === "REJECTED" || status === "NEEDS_CORRECTION" ? reviewNotes || `Document ${status.toLowerCase()}` : reviewNotes || undefined,
        verifiedAt: status === "APPROVED" ? new Date() : undefined,
      },
    });

    const { ip, userAgent } = getClientInfo(request);
    await createAuditLog({
      organizationId: user.organizationId,
      userId: user.userId,
      studentId: document.studentId,
      action: `DOCUMENT_${status}`,
      entity: "Document",
      entityId: documentId,
      oldValue: { status: document.status },
      newValue: { status, reviewNotes },
      ipAddress: ip,
      userAgent,
    });

    // Index approved documents for RAG
    if (status === "APPROVED") {
      try {
        await indexApprovedDocument(documentId);
      } catch {
        // RAG indexing is optional
      }

      // Check if all student documents approved
      const pendingCount = await prisma.document.count({
        where: { studentId: document.studentId, status: { in: ["PENDING", "PROCESSING", "NEEDS_CORRECTION"] } },
      });
      if (pendingCount === 0) {
        await prisma.student.update({
          where: { id: document.studentId },
          data: { status: "DOCUMENTS_APPROVED" },
        });
      }
    }

    return success({ document: updated });
  } catch {
    return error("Failed to update document status", 500);
  }
}
