import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { success, error, unauthorized, forbidden, paginated } from "@/lib/api-response";
import { createAuditLog, getClientInfo } from "@/lib/audit";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const type = url.searchParams.get("type");
    const studentId = url.searchParams.get("studentId");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");

    const where: any = { deletedAt: null };

    if (user.role === "STUDENT") {
      const student = await prisma.student.findUnique({ where: { userId: user.userId } });
      if (!student) return error("Student profile not found", 404);
      where.studentId = student.id;
    } else if (user.role === "ADMIN" || user.role === "DOCUMENT_VERIFIER") {
      where.student = { organizationId: user.organizationId };
      if (studentId) where.studentId = studentId;
    }
    // Super admin: no filter

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

    return paginated(documents, total, page, limit);
  } catch {
    return error("Failed to fetch documents", 500);
  }
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const student = await prisma.student.findUnique({ where: { userId: user.userId } });
  if (!student) return error("Student profile not found", 404);

  const formData = await request.formData();
  const file = formData.get("file") as File;
  const type = formData.get("type") as string;
  const description = formData.get("description") as string;
  const tagsRaw = formData.get("tags") as string;

  if (!file || !type) return error("File and type required", 400);

  const buffer = Buffer.from(await file.arrayBuffer());
  const tags = tagsRaw ? tagsRaw.split(",").map(t => t.trim()).filter(Boolean) : [];
  const validTypes = ["PASSPORT", "ID_DOCUMENT", "TRANSCRIPTS", "SOP", "RESUME", "LOR", "CLASS_10", "CLASS_12", "GRADUATION", "CERTIFICATE", "ACHIEVEMENT", "FINANCIAL_STATEMENT", "LOAN_DOCUMENT", "IELTS", "TOEFL", "PTE", "GRE", "GMAT", "SAT", "OTHER"];

  if (!validTypes.includes(type)) return error("Invalid document type", 400);

  const driver = (await import("@/lib/storage")).getStorageDriver();
  const result = await driver.upload({ buffer, originalName: file.name, mimeType: file.type, studentId: student.id });

  const document = await prisma.document.create({
    data: {
      studentId: student.id,
      type: type as any,
      fileName: result.fileName,
      filePath: result.storagePath,
      fileSize: file.size,
      mimeType: file.type,
      description: description || undefined,
      tags,
      uploadedById: user.userId,
    },
  });

  const { ip, userAgent } = getClientInfo(request);
  await createAuditLog({
    organizationId: user.organizationId,
    userId: user.userId,
    studentId: student.id,
    action: "DOCUMENT_UPLOAD",
    entity: "Document",
    entityId: document.id,
    newValue: { fileName: file.name, type, size: file.size, tags, description },
    ipAddress: ip,
    userAgent,
  });

  return success({
    id: document.id,
    fileName: document.fileName,
    type: document.type,
    status: document.status,
    uploadedAt: document.createdAt,
  });
}
