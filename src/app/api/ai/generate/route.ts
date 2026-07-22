import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAIProvider, isAIConfigured } from "@/lib/ai";
import { createAuditLog } from "@/lib/audit";
import { success, error } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  if (!isAIConfigured()) return error("AI provider not configured", 503);

  try {
    const body = await request.json();
    const { type, studentId, context } = body;

    if (!type || !["sop", "resume"].includes(type)) return error("Invalid type", 400);

    let targetStudentId = studentId;
    if (user.role === "STUDENT") {
      const student = await prisma.student.findUnique({ where: { userId: user.userId } });
      if (!student) return error("Student profile not found", 404);
      targetStudentId = student.id;
    } else if (!targetStudentId) {
      return error("Student ID required for admins/counselors", 400);
    }

    const student = await prisma.student.findUnique({
      where: { id: targetStudentId },
      include: {
        entranceExams: true,
        documents: { where: { type: "SOP" }, take: 1 },
        applications: { include: { university: true, course: true } },
        psychometricTests: { include: { test: true } },
      },
    });

    if (!student) return error("Student not found", 404);

    const provider = getAIProvider();

    let prompt = "";
    let systemPrompt = "";

    if (type === "sop") {
      systemPrompt = "You are an expert study abroad consultant. Write a compelling Statement of Purpose.";
      prompt = `Write a Statement of Purpose for a student applying to universities abroad.

Student Profile:
- Name: ${student.fullName}
- Education: ${student.graduationDegree || "Not specified"} from ${student.graduationUniversity || "Not specified"} (${student.graduationPercentage || "N/A"}%, ${student.graduationYear || "N/A"})
- 12th: ${student.twelfthPercentage || "N/A"}% (${student.twelfthYear || "N/A"}) from ${student.twelfthBoard || "N/A"}
- 10th: ${student.tenthPercentage || "N/A"}% (${student.tenthYear || "N/A"}) from ${student.tenthBoard || "N/A"}
- Exams: ${student.entranceExams.map(e => `${e.examType}: ${e.score}`).join(", ") || "Not specified"}
- Preferred Country: ${student.preferredCountry || "Not specified"}
- Preferred University: ${student.preferredUniversity || "Not specified"}
- Preferred Course: ${student.preferredCourse || "Not specified"}
- Budget: ${student.budgetMin ? `$${student.budgetMin} - $${student.budgetMax || "No max"}` : "Not specified"}
- Interests: ${student.interests?.join(", ") || "Not specified"}
- Applications: ${student.applications.map(a => `${a.university.name} - ${a.course?.name || "No course"}`).join(", ") || "None"}

Write a compelling, personalized SOP (800-1000 words) highlighting academic journey, motivation, career goals, and why this student is a strong candidate.`;
    } else {
      systemPrompt = "You are an expert career counselor. Create a professional resume/CV for a student applying to international universities.";
      prompt = `Create a professional resume for a student applying to international universities.

Student Profile:
- Name: ${student.fullName}
- Email: ${student.email}
- Education: ${student.graduationDegree || "Not specified"} from ${student.graduationUniversity || "Not specified"} (${student.graduationPercentage || "N/A"}%, ${student.graduationYear || "N/A"})
- 12th: ${student.twelfthPercentage || "N/A"}% (${student.twelfthYear || "N/A"}) from ${student.twelfthBoard || "N/A"}
- 10th: ${student.tenthPercentage || "N/A"}% (${student.tenthYear || "N/A"}) from ${student.tenthBoard || "N/A"}
- Exams: ${student.entranceExams.map(e => `${e.examType}: ${e.score}`).join(", ") || "Not specified"}
- Interests: ${student.interests?.join(", ") || "Not specified"}
- Hobbies: ${student.hobbies?.join(", ") || "Not specified"}
- Applications: ${student.applications.map(a => `${a.university.name} - ${a.course?.name || "No course"}`).join(", ") || "None"}

Create a well-formatted resume suitable for university applications. Include sections: Personal Information, Education, Test Scores, Projects/Experience, Skills, Interests.`;
    }

    const response = await provider.complete({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      maxTokens: 2048,
    });

    const { ip, userAgent } = await import("@/lib/audit").then(m => m.getClientInfo(request));
    await createAuditLog({
      organizationId: user.organizationId,
      userId: user.userId,
      studentId: targetStudentId,
      action: type === "sop" ? "SOP_GENERATE" : "RESUME_GENERATE",
      entity: "AIGeneration",
      newValue: { type, contentLength: response.content.length, model: response.model },
      ipAddress: ip,
      userAgent,
    });

    return success({ content: response.content, model: response.model, usage: response.usage });
  } catch (err) {
    console.error("AI generation error:", err);
    return error("Generation failed", 500);
  }
}