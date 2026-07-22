import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { success, error, validationError } from "@/lib/api-response";
import { validatePassword } from "@/lib/password";
import { createAuditLog } from "@/lib/audit";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, username, password, mobile, dateOfBirth, gender, address, country, interests, hobbies, preferredCountry, preferredUniversity, preferredCourse, tenthSchool, tenthBoard, tenthPercentage, tenthYear, twelfthSchool, twelfthBoard, twelfthPercentage, twelfthYear, graduationDegree, graduationUniversity, graduationPercentage, graduationYear, entranceExams } = body;

    if (!fullName || !email || !password) {
      return error("Full name, email, and password are required", 400);
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) return validationError({ password: passwordCheck.errors });

    const existingEmail = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingEmail) return error("Email already registered", 409);

    if (username) {
      const existingUsername = await prisma.user.findUnique({ where: { username } });
      if (existingUsername) return error("Username already taken", 409);
    }

    const org = await prisma.organization.findFirst({ where: { slug: "default-org" } });
    if (!org) return error("No organization configured", 500);

    if (mobile) {
      const existingMobile = await prisma.student.findFirst({
        where: { organizationId: org.id, mobile, deletedAt: null },
      });
      if (existingMobile) return error("Mobile already in use in this organization", 409);
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username: username || null,
        passwordHash,
        fullName,
        role: "STUDENT",
        status: "ACTIVE",
        organizationId: org.id,
      },
    });

    const studentData: Record<string, unknown> = {
      userId: user.id,
      fullName,
      email: email.toLowerCase(),
      mobile: mobile || null,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      gender: gender || null,
      address: address || null,
      country: country || null,
      interests: interests || [],
      hobbies: hobbies || [],
      preferredCountry: preferredCountry || null,
      preferredUniversity: preferredUniversity || null,
      preferredCourse: preferredCourse || null,
      tenthSchool: tenthSchool || null,
      tenthBoard: tenthBoard || null,
      tenthPercentage: tenthPercentage ? parseFloat(tenthPercentage) : null,
      tenthYear: tenthYear ? parseInt(tenthYear) : null,
      twelfthSchool: twelfthSchool || null,
      twelfthBoard: twelfthBoard || null,
      twelfthPercentage: twelfthPercentage ? parseFloat(twelfthPercentage) : null,
      twelfthYear: twelfthYear ? parseInt(twelfthYear) : null,
      graduationDegree: graduationDegree || null,
      graduationUniversity: graduationUniversity || null,
      graduationPercentage: graduationPercentage ? parseFloat(graduationPercentage) : null,
      graduationYear: graduationYear ? parseInt(graduationYear) : null,
      organizationId: org.id,
      status: "REGISTERED",
    };

    const student = await prisma.student.create({ data: studentData as any });

    if (entranceExams && Array.isArray(entranceExams)) {
      for (const exam of entranceExams) {
        if (exam.examType && exam.score) {
          await prisma.entranceExam.create({
            data: { studentId: student.id, examType: exam.examType, score: exam.score, dateTaken: exam.dateTaken ? new Date(exam.dateTaken) : undefined },
          });
        }
      }
    }

    await prisma.notification.create({
      data: { userId: user.id, studentId: student.id, type: "GENERAL", title: "Welcome!", message: `Welcome ${fullName}! Your account is ready. Please complete your profile.` },
    });

    await createAuditLog({
      organizationId: org.id,
      userId: user.id,
      studentId: student.id,
      action: "STUDENT_REGISTERED",
      entity: "Student",
      entityId: student.id,
      newValue: { fullName, email: email.toLowerCase() },
    });

    return success({ id: user.id, email: user.email, fullName: user.fullName, role: user.role }, 201);
  } catch {
    return error("Failed to register", 500);
  }
}
