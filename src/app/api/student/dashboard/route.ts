import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { success, unauthorized } from "@/lib/api-response";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const student = await prisma.student.findUnique({
    where: { userId: user.userId },
    include: {
      documents: { where: { deletedAt: null }, select: { id: true, type: true, status: true } },
      psychometricTests: { include: { test: { select: { id: true, title: true } } }, orderBy: { createdAt: "desc" } },
      applications: { where: { deletedAt: null }, include: { university: { select: { id: true, name: true } } }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!student) {
    return success({
      profileExists: false,
      message: "Complete your profile to get started",
      recommendations: { universities: [], careers: [] },
      tests: { assigned: 0, pending: 0, completed: 0 },
      documents: { total: 0, approved: 0, pending: 0 },
      applications: { total: 0, submitted: 0 },
    });
  }

  const completion = calculateCompletion(student);

  const [savedUniversities, careerCount] = await Promise.all([
    prisma.preferredStudyOption.count({ where: { studentId: student.id, type: "UNIVERSITY" } }),
    prisma.career.count({ where: { isActive: true, deletedAt: null } }),
  ]);

  const testStats = {
    assigned: student.psychometricTests.length,
    pending: student.psychometricTests.filter(t => t.status === "ASSIGNED" || t.status === "IN_PROGRESS").length,
    completed: student.psychometricTests.filter(t => t.status === "COMPLETED").length,
  };

  const docStats = {
    total: student.documents.length,
    approved: student.documents.filter(d => d.status === "APPROVED").length,
    pending: student.documents.filter(d => d.status === "PENDING" || d.status === "PROCESSING").length,
  };

  const appStats = {
    total: student.applications.length,
    submitted: student.applications.filter(a => a.status !== "DRAFT").length,
  };

  return success({
    profileExists: true,
    completion,
    student: {
      fullName: student.fullName,
      email: student.email,
      status: student.status,
      country: student.country,
      preferredCountry: student.preferredCountry,
    },
    tests: testStats,
    documents: docStats,
    applications: appStats,
    savedUniversities,
    totalCareers: careerCount,
    recentTests: student.psychometricTests.slice(0, 3),
    recentApplications: student.applications.slice(0, 3),
  });
}

function calculateCompletion(student: any) {
  const personalFields = ["fullName", "mobile", "dateOfBirth", "gender", "address", "country"];
  const academicFields = ["tenthSchool", "tenthBoard", "tenthPercentage", "tenthYear"];
  const prefFields = ["interests", "preferredCountry", "preferredUniversity", "preferredCourse"];

  const countFilled = (fields: string[]) => fields.filter(f => {
    const v = student[f];
    return v !== null && v !== undefined && v !== "" && (!Array.isArray(v) || v.length > 0);
  }).length;

  const personal = Math.round((countFilled(personalFields) / personalFields.length) * 40);
  const academic = Math.round((countFilled(academicFields) / academicFields.length) * 30);
  const preferences = Math.round((countFilled(prefFields) / prefFields.length) * 20);
  const docs = student.documents && student.documents.length > 0 ? 10 : 0;

  return { percentage: personal + academic + preferences + docs, personal, academic, preferences, documents: docs };
}
