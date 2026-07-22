import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { success, error, unauthorized, forbidden } from "@/lib/api-response";
import { createAuditLog, getClientInfo } from "@/lib/audit";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "students:update"); } catch { return forbidden(); }

  const { id } = await params;

  const student = await prisma.student.findFirst({
    where: { id, organizationId: user.organizationId, deletedAt: null },
  });
  if (!student) return error("Student not found", 404);

  try {
    const body = await request.json();
    const allowedFields = [
      "fullName", "mobile", "dateOfBirth", "gender", "address", "country",
      "tenthSchool", "tenthBoard", "tenthPercentage", "tenthYear",
      "twelfthSchool", "twelfthBoard", "twelfthPercentage", "twelfthYear",
      "graduationDegree", "graduationUniversity", "graduationPercentage", "graduationYear",
      "interests", "hobbies",
      "preferredCountry", "preferredUniversity", "preferredCourse",
      "budgetMin", "budgetMax",
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === "dateOfBirth") updateData[field] = new Date(body[field]);
        else if (["tenthPercentage", "twelfthPercentage", "graduationPercentage", "budgetMin", "budgetMax"].includes(field)) updateData[field] = body[field] ? parseFloat(body[field]) : null;
        else if (["tenthYear", "twelfthYear", "graduationYear"].includes(field)) updateData[field] = body[field] ? parseInt(body[field]) : null;
        else updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) return error("No valid fields to update", 400);

    if (updateData.fullName || updateData.mobile || updateData.address || updateData.gender) {
      updateData.status = "PROFILE_INCOMPLETE";
    }

    const updated = await prisma.student.update({
      where: { id },
      data: updateData,
    });

    const { ip, userAgent } = getClientInfo(request);
    await createAuditLog({
      organizationId: user.organizationId,
      userId: user.userId,
      studentId: id,
      action: "STUDENT_UPDATED",
      entity: "Student",
      entityId: id,
      oldValue: { fullName: student.fullName },
      newValue: { ...updateData },
      ipAddress: ip,
      userAgent,
    });

    if (body.entranceExams) {
      await prisma.entranceExam.deleteMany({ where: { studentId: id } });
      for (const exam of body.entranceExams) {
        await prisma.entranceExam.create({
          data: { studentId: id, examType: exam.examType, score: exam.score, dateTaken: exam.dateTaken ? new Date(exam.dateTaken) : undefined },
        });
      }
    }

    const result = await prisma.student.findUnique({
      where: { id },
      include: { entranceExams: true },
    });

    return success(result);
  } catch {
    return error("Failed to update student", 500);
  }
}
