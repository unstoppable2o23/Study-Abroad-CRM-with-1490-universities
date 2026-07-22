import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { success, error } from "@/lib/api-response";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  try {
    let student = await prisma.student.findUnique({
      where: { userId: user.userId },
      include: { entranceExams: true },
    });

    if (!student) {
      student = await prisma.student.create({
        data: {
          userId: user.userId,
          fullName: user.email,
          email: user.email,
          organizationId: user.organizationId,
        },
        include: { entranceExams: true },
      });
    }

    return success(student);
  } catch {
    return error("Failed to fetch profile", 500);
  }
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  try {
    const body = await request.json();

    const student = await prisma.student.upsert({
      where: { userId: user.userId },
      update: {
        fullName: body.fullName,
        mobile: body.mobile,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
        gender: body.gender,
        address: body.address,
        country: body.country,
        tenthSchool: body.tenthSchool,
        tenthBoard: body.tenthBoard,
        tenthPercentage: body.tenthPercentage ? parseFloat(body.tenthPercentage) : undefined,
        tenthYear: body.tenthYear ? parseInt(body.tenthYear) : undefined,
        twelfthSchool: body.twelfthSchool,
        twelfthBoard: body.twelfthBoard,
        twelfthPercentage: body.twelfthPercentage ? parseFloat(body.twelfthPercentage) : undefined,
        twelfthYear: body.twelfthYear ? parseInt(body.twelfthYear) : undefined,
        graduationDegree: body.graduationDegree,
        graduationUniversity: body.graduationUniversity,
        graduationPercentage: body.graduationPercentage ? parseFloat(body.graduationPercentage) : undefined,
        graduationYear: body.graduationYear ? parseInt(body.graduationYear) : undefined,
        interests: body.interests,
        hobbies: body.hobbies,
        preferredCountry: body.preferredCountry,
        preferredUniversity: body.preferredUniversity,
        preferredCourse: body.preferredCourse,
        budgetMin: body.budgetMin ? parseFloat(body.budgetMin) : undefined,
        budgetMax: body.budgetMax ? parseFloat(body.budgetMax) : undefined,
        status: "PROFILE_INCOMPLETE",
      },
      create: {
        userId: user.userId,
        fullName: body.fullName || user.email,
        email: user.email,
        organizationId: user.organizationId,
        mobile: body.mobile,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
        gender: body.gender,
      },
      include: { entranceExams: true },
    });

    if (body.entranceExams) {
      await prisma.entranceExam.deleteMany({ where: { studentId: student.id } });
      for (const exam of body.entranceExams) {
        await prisma.entranceExam.create({
          data: {
            studentId: student.id,
            examType: exam.examType,
            score: exam.score,
            dateTaken: exam.dateTaken ? new Date(exam.dateTaken) : undefined,
          },
        });
      }
    }

    const updated = await prisma.student.findUnique({
      where: { id: student.id },
      include: { entranceExams: true },
    });

    return success(updated);
  } catch {
    return error("Failed to update profile", 500);
  }
}
