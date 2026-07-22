import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { success, error } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  if (!["ADMIN", "COUNSELOR"].includes(user.role)) return error("Forbidden", 403);

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const counselorId = searchParams.get("counselorId");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const where: any = { organizationId: user.organizationId };
  if (status) where.status = status;
  if (counselorId) where.counselorId = counselorId;

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      include: {
        counselor: { select: { fullName: true, email: true } },
        _count: { select: { applications: true, documents: true, notes: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.student.count({ where }),
  ]);

  return success({ data: students, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  if (!["ADMIN", "COUNSELOR"].includes(user.role)) return error("Forbidden", 403);

  try {
    const body = await request.json();
    const { studentId, counselorId } = body;

    if (!studentId || !counselorId) return error("Student ID and Counselor ID required", 400);

    const student = await prisma.student.findFirst({
      where: { id: studentId, organizationId: user.organizationId },
    });
    if (!student) return error("Student not found", 404);

    const counselor = await prisma.user.findFirst({
      where: { id: counselorId, organizationId: user.organizationId, role: "COUNSELOR" },
    });
    if (!counselor) return error("Counselor not found", 404);

    await prisma.student.update({
      where: { id: studentId },
      data: { counselorId },
    });

    const { ip, userAgent } = await import("@/lib/audit").then(m => m.getClientInfo(request));
    await createAuditLog({
      organizationId: user.organizationId,
      userId: user.userId,
      studentId,
      action: "COUNSELOR_ASSIGN",
      entity: "Student",
      entityId: studentId,
      newValue: { counselorId },
      ipAddress: ip,
      userAgent,
    });

    return success({ message: "Counselor assigned successfully" });
  } catch {
    return error("Failed to assign counselor", 500);
  }
}