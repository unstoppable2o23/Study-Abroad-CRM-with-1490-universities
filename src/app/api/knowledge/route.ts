import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { success, error, unauthorized, forbidden } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const sourceType = url.searchParams.get("sourceType");
    const search = url.searchParams.get("search");
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = status;
    if (sourceType) where.sourceType = sourceType;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    const [docs, total] = await Promise.all([
      prisma.knowledgeDocument.findMany({
        where, orderBy: { updatedAt: "desc" }, skip, take: limit,
      }),
      prisma.knowledgeDocument.count({ where }),
    ]);

    return success({ documents: docs, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch {
    return error("Failed to fetch knowledge documents", 500);
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "universities:create"); } catch { return forbidden(); }

  try {
    const body = await request.json();
    const { title, content, sourceType, referenceId, tags } = body;

    if (!title || !sourceType) return error("Title and sourceType are required", 400);

    const doc = await prisma.knowledgeDocument.create({
      data: {
        title, content, sourceType, referenceId,
        tags: tags || [],
        status: "DRAFT",
        createdBy: user.userId,
      },
    });

    await createAuditLog({
      organizationId: user.organizationId, userId: user.userId,
      action: "KNOWLEDGE_CREATED", entity: "KnowledgeDocument", entityId: doc.id,
      newValue: { title, sourceType },
    });

    return success(doc, 201);
  } catch {
    return error("Failed to create knowledge document", 500);
  }
}
