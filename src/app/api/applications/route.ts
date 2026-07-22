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

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  if (user.role === "STUDENT") {
    const student = await prisma.student.findUnique({ where: { userId: user.userId } });
    if (!student) return error("Student profile not found", 404);

    const applications = await prisma.application.findMany({
      where: { studentId: student.id },
      include: {
        university: { select: { name: true, city: true, country: { select: { name: true } } } },
        course: { select: { name: true, level: true } },
        activities: { orderBy: { createdAt: "desc" } },
      },
      orderBy: { createdAt: "desc" },
    });
    return success(applications);
  }

  if (["ADMIN", "COUNSELOR", "DOCUMENT_VERIFIER"].includes(user.role)) {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = { student: { organizationId: user.organizationId } };
    if (studentId) where.studentId = studentId;
    if (status) where.status = status;

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          university: { select: { name: true, city: true, country: { select: { name: true } } } },
          course: { select: { name: true, level: true } },
          student: { select: { fullName: true, email: true } },
          counselor: { select: { id: true, fullName: true } },
          activities: { orderBy: { createdAt: "desc" }, take: 5 },
          _count: { select: { tasks: true, meetings: true, calls: true, followUps: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.application.count({ where }),
    ]);

    return success({ data: applications, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  }

  if (user.role === "SUPER_ADMIN") {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {};
    if (studentId) where.studentId = studentId;
    if (status) where.status = status;

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          university: { select: { name: true, city: true, country: { select: { name: true } } } },
          course: { select: { name: true, level: true } },
          student: { select: { fullName: true, email: true } },
          counselor: { select: { id: true, fullName: true } },
          activities: { orderBy: { createdAt: "desc" }, take: 5 },
          _count: { select: { tasks: true, meetings: true, calls: true, followUps: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.application.count({ where }),
    ]);

    return success({ data: applications, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  }

  return error("Forbidden", 403);
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "STUDENT") return error("Forbidden", 403);

  try {
    const student = await prisma.student.findUnique({ where: { userId: user.userId } });
    if (!student) return error("Student profile not found", 404);

    const body = await request.json();
    const { universityId, courseId, intake } = body;

    if (!universityId) return error("University ID required", 400);

    const application = await prisma.application.create({
      data: {
        studentId: student.id,
        universityId,
        courseId: courseId || undefined,
        intake: intake || undefined,
        status: "DRAFT",
      },
      include: {
        university: { select: { name: true } },
        course: { select: { name: true } },
      },
    });

    await prisma.activity.create({
      data: {
        type: "APPLICATION_CREATED",
        description: `Application created for ${application.university.name}`,
        studentId: student.id,
        applicationId: application.id,
      },
    });

    const { ip, userAgent } = await import("@/lib/audit").then(m => m.getClientInfo(request));
    await createAuditLog({
      organizationId: user.organizationId,
      userId: user.userId,
      studentId: student.id,
      action: "APPLICATION_CREATE",
      entity: "Application",
      entityId: application.id,
      newValue: { universityId, courseId, intake },
      ipAddress: ip,
      userAgent,
    });

    return success(application, 201);
  } catch {
    return error("Failed to create application", 500);
  }
}