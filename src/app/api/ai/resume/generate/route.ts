import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized } from "@/lib/api-response";
import { generateResume } from "@/lib/ai/resume";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const body = await request.json();
    const { template, fullName, email, phone, summary, education, skills, projects, certifications, achievements, experience } = body;

    if (!template || !fullName || !email || !education || !skills) {
      return error("template, fullName, email, education, and skills are required", 400);
    }

    const result = await generateResume({
      template,
      fullName,
      email,
      phone,
      summary,
      education,
      skills,
      projects,
      certifications,
      achievements,
      experience,
    });

    return success(result);
  } catch (e) {
    return error("Failed to generate resume: " + (e instanceof Error ? e.message : ""), 500);
  }
}
