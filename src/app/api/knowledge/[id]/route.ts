import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { success, error, unauthorized, forbidden } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  try {
    const doc = await prisma.knowledgeDocument.findUnique({ where: { id } });
    if (!doc || doc.deletedAt) return error("Knowledge document not found", 404);
    return success(doc);
  } catch {
    return error("Failed to fetch knowledge document", 500);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "universities:update"); } catch { return forbidden(); }

  const { id } = await context.params;

  try {
    const existing = await prisma.knowledgeDocument.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) return error("Knowledge document not found", 404);

    const body = await request.json();
    const { title, content, sourceType, referenceId, tags, status, approvalStatus } = body;

    const updateData: Record<string, unknown> = {};
    if (title) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (sourceType) updateData.sourceType = sourceType;
    if (referenceId !== undefined) updateData.referenceId = referenceId;
    if (tags) updateData.tags = tags;
    if (status) updateData.status = status;

    // Handle approval workflow
    if (approvalStatus) {
      updateData.approvalStatus = approvalStatus;
      if (approvalStatus === "APPROVED") {
        updateData.approvedBy = user.userId;
        updateData.approvedAt = new Date();
        updateData.status = "APPROVED";
      } else if (approvalStatus === "REJECTED") {
        updateData.approvedBy = user.userId;
        updateData.approvedAt = new Date();
        updateData.status = "DRAFT";
      }
    }

    const updated = await prisma.knowledgeDocument.update({
      where: { id },
      data: updateData,
    });

    await createAuditLog({
      organizationId: user.organizationId, userId: user.userId,
      action: "KNOWLEDGE_UPDATED", entity: "KnowledgeDocument", entityId: id,
      oldValue: { title: existing.title, status: existing.status },
      newValue: { title: updated.title, status: updated.status, approvalStatus: updated.approvalStatus },
    });

    return success(updated);
  } catch {
    return error("Failed to update knowledge document", 500);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "universities:delete"); } catch { return forbidden(); }

  const { id } = await context.params;

  try {
    const existing = await prisma.knowledgeDocument.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) return error("Knowledge document not found", 404);

    await prisma.knowledgeDocument.update({ where: { id }, data: { deletedAt: new Date() } });

    await createAuditLog({
      organizationId: user.organizationId, userId: user.userId,
      action: "KNOWLEDGE_DELETED", entity: "KnowledgeDocument", entityId: id,
      oldValue: { title: existing.title },
    });

    return success({ message: "Knowledge document deleted" });
  } catch {
    return error("Failed to delete knowledge document", 500);
  }
}
