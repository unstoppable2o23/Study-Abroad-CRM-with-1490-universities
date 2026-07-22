import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized } from "@/lib/api-response";
import { getUniversityRecommendations } from "@/lib/ai/recommendation";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const url = new URL(request.url);
    const tenthPct = url.searchParams.get("tenthPercentage");
    const twelfthPct = url.searchParams.get("twelfthPercentage");
    const cgpa = url.searchParams.get("graduationCGPA");
    const budget = url.searchParams.get("budget");
    const countries = url.searchParams.get("preferredCountries");
    const courses = url.searchParams.get("preferredCourses");

    const result = await getUniversityRecommendations({
      userId: user.userId,
      tenthPercentage: tenthPct ? Number(tenthPct) : undefined,
      twelfthPercentage: twelfthPct ? Number(twelfthPct) : undefined,
      graduationCGPA: cgpa ? Number(cgpa) : undefined,
      budget: budget ? Number(budget) : undefined,
      preferredCountries: countries ? countries.split(",") : undefined,
      preferredCourses: courses ? courses.split(",") : undefined,
    });

    return success(result);
  } catch (e) {
    return error("Failed to generate recommendations: " + (e instanceof Error ? e.message : ""), 500);
  }
}
