import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized } from "@/lib/api-response";
import { compareUniversities } from "@/lib/ai/document-analysis";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const body = await request.json();
    const { universityIds } = body;

    if (!universityIds || !Array.isArray(universityIds) || universityIds.length < 2) {
      return error("At least 2 university IDs are required", 400);
    }

    const universities = await prisma.university.findMany({
      where: { id: { in: universityIds } },
      include: { country: { select: { name: true } }, universityCourses: { include: { course: { select: { name: true } } }, take: 5 } },
    });

    if (universities.length < 2) return error("At least 2 universities must be found", 400);

    const result = await compareUniversities(
      universities.map(u => ({
        id: u.id,
        name: u.name,
        country: u.country?.name || "Unknown",
        worldRanking: u.ranking || undefined,
        tuitionFees: undefined,
        courses: u.universityCourses.map(uc => uc.course.name),
      }))
    );

    return success(result);
  } catch (e) {
    return error("Failed to compare universities: " + (e instanceof Error ? e.message : ""), 500);
  }
}
