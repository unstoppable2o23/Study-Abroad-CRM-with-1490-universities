import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized, forbidden } from "@/lib/api-response";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const { id } = await context.params;
    const application = await prisma.application.findUnique({
      where: { id, deletedAt: null },
      include: {
        university: { select: { id: true, name: true, city: true, ranking: true, country: { select: { name: true } } } },
        course: { select: { id: true, name: true, level: true } },
        student: { select: { id: true, fullName: true, email: true, mobile: true } },
        counselor: { select: { id: true, fullName: true, email: true } },
        activities: { orderBy: { createdAt: "desc" }, take: 20 },
        tasks: { orderBy: { createdAt: "desc" }, take: 10, include: { assignedTo: { select: { fullName: true } } } },
        meetings: { orderBy: { startTime: "desc" }, take: 10 },
        calls: { orderBy: { createdAt: "desc" }, take: 10 },
        followUps: { orderBy: { dueDate: "asc" }, take: 10 },
        documents: { include: { document: { select: { id: true, fileName: true, type: true, status: true } } } },
        _count: { select: { tasks: true, meetings: true, calls: true, followUps: true, documents: true } },
      },
    });

    if (!application) return error("Application not found", 404);

    if (user.role === "STUDENT") {
      const student = await prisma.student.findUnique({ where: { userId: user.userId } });
      if (!student || application.studentId !== student.id) return forbidden();
    }

    return success(application);
  } catch {
    return error("Failed to fetch application", 500);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const { id } = await context.params;
    const body = await request.json();

    const existing = await prisma.application.findUnique({ where: { id }, include: { student: true } });
    if (!existing) return error("Application not found", 404);

    if (user.role === "STUDENT" && existing.student.userId !== user.userId) return forbidden();

    const updateData: any = {};
    if (body.status) updateData.status = body.status;
    if (body.status === "OFFER_RECEIVED") updateData.offerReceivedAt = new Date();
    if (body.visaStatus !== undefined) updateData.visaStatus = body.visaStatus;
    if (body.tuitionPaid !== undefined) updateData.tuitionPaid = body.tuitionPaid;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.intake) updateData.intake = body.intake;
    if (body.counselorId) updateData.counselorId = body.counselorId;
    if (body.priority) updateData.priority = body.priority;
    if (body.leadSource) updateData.leadSource = body.leadSource;
    if (body.offerDeadline) updateData.offerDeadline = new Date(body.offerDeadline);
    if (body.offerLetterFile) updateData.offerLetterFile = body.offerLetterFile;

    const application = await prisma.application.update({ where: { id }, data: updateData });

    await prisma.activity.create({
      data: {
        type: "APPLICATION_UPDATED",
        description: body.status ? `Status changed to ${body.status}` : "Application details updated",
        studentId: existing.studentId,
        applicationId: application.id,
        userId: user.userId,
      },
    });

    return success(application);
  } catch {
    return error("Failed to update application", 500);
  }
}
