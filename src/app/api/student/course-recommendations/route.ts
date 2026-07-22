import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized } from "@/lib/api-response";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const student = await prisma.student.findUnique({
      where: { userId: user.userId },
      include: {
        educationRecords: true,
        examScores: { include: { examType: true } },
        studentInterests: true,
        careerAssessments: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    if (!student) return error("Student profile not found", 404);

    const interests = student.studentInterests.map(si => si.interest.toLowerCase());
    const careerGoals = student.careerAssessments[0]?.careerMatches || [];
    const preferredLevel = student.educationRecords.length > 0 ? "MASTER" : "BACHELOR";
    const preferredCountries = student.preferredCountryId ? [student.preferredCountryId] : [];

    const where: any = { deletedAt: null, status: "PUBLISHED" };

    const courses = await prisma.course.findMany({
      where,
      include: {
        country: { select: { id: true, name: true, code: true } },
        careers: { select: { id: true, name: true } },
        categoryRef: { select: { id: true, name: true } },
        university: { select: { id: true, name: true } },
      },
      take: 50,
    });

    const scored = courses.map(course => {
      let score = 0;
      const reasons: string[] = [];

      const courseKeywords = [course.name, course.category, course.description || "", ...course.skills].join(" ").toLowerCase();

      for (const interest of interests) {
        if (courseKeywords.includes(interest)) {
          score += 20;
          reasons.push(`Matches your interest in "${interest}"`);
        }
      }

      for (const career of course.careers) {
        if (careerGoals.includes(career.name)) {
          score += 25;
          reasons.push(`Aligns with your career goal: ${career.name}`);
        }
      }

      if (course.level === preferredLevel) {
        score += 10;
        reasons.push(`Matches your education level: ${course.level}`);
      }

      if (preferredCountries.length > 0 && preferredCountries.includes(course.countryId)) {
        score += 15;
        reasons.push(`Available in your preferred country: ${course.country.name}`);
      }

      if (course.skills.length > 0) {
        score += 5;
        reasons.push(`Develops skills: ${course.skills.slice(0, 3).join(", ")}`);
      }

      return {
        id: course.id, name: course.name, level: course.level, category: course.category,
        description: course.description, duration: course.duration,
        tuitionFeeMin: course.tuitionFeeMin, tuitionFeeMax: course.tuitionFeeMax, currency: course.currency,
        skills: course.skills, entranceExams: course.entranceExams,
        country: course.country, university: course.university,
        careers: course.careers,
        matchScore: Math.min(score, 100),
        reasons: reasons.slice(0, 3),
        skillGap: [],
      };
    });

    const recommended = scored
      .filter(c => c.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);

    return success({
      recommendations: recommended,
      profile: {
        interests,
        careerGoals,
        preferredLevel,
        preferredCountries,
        hasCompleteProfile: student.educationRecords.length > 0,
      },
    });
  } catch {
    return error("Failed to get recommendations", 500);
  }
}
