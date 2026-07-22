import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized } from "@/lib/api-response";
import { generateSOP } from "@/lib/ai/sop";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const body = await request.json();
    const { template, degree, field, university, researchInterests, academicBackground, workExperience, achievements, goals } = body;

    if (!template || !degree || !university) {
      return error("template, degree, and university are required", 400);
    }

    const result = await generateSOP({
      template,
      degree,
      field,
      university,
      researchInterests,
      academicBackground,
      workExperience,
      achievements,
      goals,
    });

    return success(result);
  } catch (e) {
    return error("Failed to generate SOP: " + (e instanceof Error ? e.message : ""), 500);
  }
}
