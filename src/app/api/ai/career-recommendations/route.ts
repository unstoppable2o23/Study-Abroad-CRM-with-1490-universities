import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized } from "@/lib/api-response";
import { getCareerRecommendations } from "@/lib/ai/recommendation";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const url = new URL(request.url);
    const interests = url.searchParams.get("interests");
    const subjects = url.searchParams.get("favoriteSubjects");
    const skills = url.searchParams.get("skills");

    const result = await getCareerRecommendations({
      userId: user.userId,
      interests: interests ? interests.split(",") : undefined,
      favoriteSubjects: subjects ? subjects.split(",") : undefined,
      skills: skills ? skills.split(",") : undefined,
    });

    return success(result);
  } catch (e) {
    return error("Failed to generate career recommendations: " + (e instanceof Error ? e.message : ""), 500);
  }
}
