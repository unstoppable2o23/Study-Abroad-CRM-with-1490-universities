import { prisma } from "@/lib/prisma";
import { success, error } from "@/lib/api-response";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length < 2) {
      return error("At least 2 course IDs are required for comparison", 400);
    }
    if (ids.length > 5) {
      return error("Maximum 5 courses can be compared at once", 400);
    }

    const courses = await prisma.course.findMany({
      where: { id: { in: ids }, deletedAt: null },
      include: {
        country: { select: { id: true, name: true, code: true } },
        university: { select: { id: true, name: true, city: true } },
        categoryRef: { select: { id: true, name: true } },
        careers: { select: { id: true, name: true } },
        universityCourses: {
          include: { university: { select: { id: true, name: true, city: true } } },
          take: 5,
        },
      },
    });

    if (courses.length < 2) return error("At least 2 valid courses required", 400);

    const comparison = courses.map(c => ({
      id: c.id, name: c.name, level: c.level, category: c.category,
      description: c.description, duration: c.duration,
      tuitionFeeMin: c.tuitionFeeMin, tuitionFeeMax: c.tuitionFeeMax, currency: c.currency || "USD",
      skills: c.skills, entranceExams: c.entranceExams,
      country: c.country.name, university: c.university?.name,
      careers: c.careers.map(ca => ca.name),
      universityCount: c.universityCourses.length,
    }));

    const differences: Record<string, any> = {};
    const levels = [...new Set(comparison.map(c => c.level).filter(Boolean))];
    if (levels.length > 0) differences.levels = levels;
    differences.categories = [...new Set(comparison.map(c => c.category).filter(Boolean))];
    differences.countries = [...new Set(comparison.map(c => c.country).filter(Boolean))];

    return success({ courses: comparison, differences, totalCompared: comparison.length });
  } catch {
    return error("Failed to compare courses", 500);
  }
}
