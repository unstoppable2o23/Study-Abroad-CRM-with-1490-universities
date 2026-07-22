import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  let student = await prisma.student.findUnique({
    where: { userId: user.userId },
    include: { entranceExams: true, educationRecords: true, studyOptions: true, documents: { where: { deletedAt: null }, select: { id: true, status: true } } },
  });

  if (!student) {
    return success({
      profile: null,
      completion: { percentage: 0, missing: ["personal", "academic", "preferences", "documents"] },
    });
  }

  const completion = calculateCompletion(student);
  const { documents, ...profile } = student;

  return success({ profile, completion, documentStatus: documents.map(d => ({ id: d.id, status: d.status })) });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  let student = await prisma.student.findUnique({ where: { userId: user.userId } });
  if (!student) return error("Profile not found. Please register first.", 404);

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

    if (body.mobile) {
      const existing = await prisma.student.findFirst({
        where: { organizationId: user.organizationId, mobile: body.mobile, id: { not: student.id }, deletedAt: null },
      });
      if (existing) return error("Mobile already in use in this organization", 409);
    }

    const updateData: Record<string, unknown> = { status: "PROFILE_INCOMPLETE" };
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === "dateOfBirth") updateData[field] = new Date(body[field]);
        else if (["tenthPercentage", "twelfthPercentage", "graduationPercentage", "budgetMin", "budgetMax"].includes(field)) updateData[field] = body[field] ? parseFloat(body[field]) : null;
        else if (["tenthYear", "twelfthYear", "graduationYear"].includes(field)) updateData[field] = body[field] ? parseInt(body[field]) : null;
        else updateData[field] = body[field];
      }
    }

    const updated = await prisma.student.update({ where: { id: student.id }, data: updateData });

    if (body.entranceExams && Array.isArray(body.entranceExams)) {
      await prisma.entranceExam.deleteMany({ where: { studentId: student.id } });
      for (const exam of body.entranceExams) {
        if (exam.examType) {
          await prisma.entranceExam.create({
            data: { studentId: student.id, examType: exam.examType, score: exam.score, dateTaken: exam.dateTaken ? new Date(exam.dateTaken) : undefined },
          });
        }
      }
    }

    await createAuditLog({
      organizationId: user.organizationId,
      userId: user.userId,
      studentId: student.id,
      action: "PROFILE_UPDATED",
      entity: "Student",
      entityId: student.id,
    });

    const result = await prisma.student.findUnique({
      where: { id: student.id },
      include: { entranceExams: true },
    });

    return success(result);
  } catch {
    return error("Failed to update profile", 500);
  }
}

function calculateCompletion(student: any) {
  const fields = [
    { key: "fullName", label: "personal" }, { key: "mobile", label: "personal" },
    { key: "dateOfBirth", label: "personal" }, { key: "gender", label: "personal" },
    { key: "address", label: "personal" }, { key: "country", label: "personal" },
    { key: "tenthSchool", label: "academic" }, { key: "tenthBoard", label: "academic" },
    { key: "tenthPercentage", label: "academic" }, { key: "tenthYear", label: "academic" },
    { key: "interests", label: "preferences" }, { key: "preferredCountry", label: "preferences" },
  ];

  const categories = ["personal", "academic", "preferences", "documents"] as const;
  const catFields: Record<string, string[]> = { personal: [], academic: [], preferences: [], documents: [] };

  for (const f of fields) {
    const val = student[f.key];
    if (val === null || val === undefined || val === "" || (Array.isArray(val) && val.length === 0)) {
      catFields[f.label].push(f.key);
    }
  }
  if (!student.documents || student.documents.length === 0) {
    catFields.documents.push("documents");
  }

  const weights: Record<string, number> = { personal: 40, academic: 30, preferences: 20, documents: 10 };
  let total = 0;
  const missing: string[] = [];
  const scores: Record<string, number> = {};

  for (const cat of categories) {
    const missingInCat = catFields[cat].length;
    const totalInCat = cat === "documents" ? 1 : fields.filter(f => f.label === cat).length;
    let catScore = 0;
    if (totalInCat > 0) {
      catScore = ((totalInCat - missingInCat) / totalInCat) * weights[cat];
      total += catScore;
      if (missingInCat === totalInCat) missing.push(cat);
    }
    scores[cat] = Math.round(catScore);
  }

  return { percentage: Math.round(total), ...scores, missing };
}
