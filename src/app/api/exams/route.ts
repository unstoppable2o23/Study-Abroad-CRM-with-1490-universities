import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog, getClientInfo } from "@/lib/audit";
import { success, error } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  const student = await prisma.student.findUnique({ where: { userId: user.userId } });
  if (!student) return error("Student profile not found", 404);

  const exams = await prisma.entranceExam.findMany({
    where: { studentId: student.id },
    orderBy: { dateTaken: "desc" },
  });

  return success(exams);
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  const student = await prisma.student.findUnique({ where: { userId: user.userId } });
  if (!student) return error("Student profile not found", 404);

  try {
    const body = await request.json();
    const { examType, score, dateTaken } = body;

    if (!examType || !score) return error("Exam type and score required", 400);

    const exam = await prisma.entranceExam.create({
      data: {
        studentId: student.id,
        examType,
        score,
        dateTaken: dateTaken ? new Date(dateTaken) : undefined,
      },
    });

    const { ip, userAgent } = getClientInfo(request);
    await createAuditLog({
      organizationId: user.organizationId,
      userId: user.userId,
      studentId: student.id,
      action: "EXAM_ADD",
      entity: "EntranceExam",
      entityId: exam.id,
      newValue: { examType, score, dateTaken },
      ipAddress: (await getClientInfo(request)).ip,
      userAgent: (await getClientInfo(request)).userAgent,
    });

    return success(exam, 201);
  } catch {
    return error("Failed to add exam", 500);
  }
}