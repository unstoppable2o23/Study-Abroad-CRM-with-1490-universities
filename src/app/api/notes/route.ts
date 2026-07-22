import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { success, error } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  if (user.role === "STUDENT") {
    const student = await prisma.student.findUnique({ where: { userId: user.userId } });
    if (!student) return error("Student profile not found", 404);

    const [notes, total] = await Promise.all([
      prisma.note.findMany({
        where: { studentId: student.id },
        include: { author: { select: { fullName: true } }, assignee: { select: { fullName: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.note.count({ where: { studentId: student.id } }),
    ]);

    return success({ data: notes, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  }

  if (["ADMIN", "COUNSELOR"].includes(user.role)) {
    const where: any = { student: { organizationId: user.organizationId } };
    if (studentId) where.studentId = studentId;

    const [notes, total] = await Promise.all([
      prisma.note.findMany({
        where,
        include: { author: { select: { fullName: true } }, assignee: { select: { fullName: true } }, student: { select: { fullName: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.note.count({ where }),
    ]);

    return success({ data: notes, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  }

  return error("Forbidden", 403);
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  if (user.role === "STUDENT") return error("Forbidden", 403);

  try {
    const body = await request.json();
    const { content, studentId, assigneeId } = body;

    if (!content || !studentId) return error("Content and studentId required", 400);

    const student = await prisma.student.findFirst({
      where: { id: studentId, organizationId: user.organizationId },
    });
    if (!student) return error("Student not found in your organization", 404);

    const note = await prisma.note.create({
      data: {
        content,
        authorId: user.userId,
        studentId,
        assigneeId: assigneeId || user.userId,
      },
      include: { author: { select: { fullName: true } }, assignee: { select: { fullName: true } } },
    });

    const { ip, userAgent } = await import("@/lib/audit").then(m => m.getClientInfo(request));
    await createAuditLog({
      organizationId: user.organizationId,
      userId: user.userId,
      studentId,
      action: "NOTE_CREATE",
      entity: "Note",
      entityId: note.id,
      newValue: { content, studentId, assigneeId: note.assigneeId },
      ipAddress: ip,
      userAgent,
    });

    return success(note, 201);
  } catch {
    return error("Failed to create note", 500);
  }
}