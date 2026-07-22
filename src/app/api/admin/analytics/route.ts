import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { unauthorized, forbidden, success } from "@/lib/api-response";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "reports:read"); } catch { return forbidden(); }

  const orgId = user.organizationId;

  const [students, coursePrefs, countryPrefs, careerInterests, testPerformance, statusDist, genderDist, monthlySignups] = await Promise.all([
    prisma.student.count({ where: { organizationId: orgId, deletedAt: null } }),
    prisma.student.groupBy({ by: ["preferredCourse"], where: { organizationId: orgId, preferredCourse: { not: null }, deletedAt: null }, _count: true, orderBy: { _count: { preferredCourse: "desc" } }, take: 10 }),
    prisma.student.groupBy({ by: ["preferredCountry"], where: { organizationId: orgId, preferredCountry: { not: null }, deletedAt: null }, _count: true, orderBy: { _count: { preferredCountry: "desc" } }, take: 10 }),
    prisma.preferredStudyOption.findMany({ where: { student: { organizationId: orgId }, type: "COURSE" }, include: { student: { select: { id: true } } }, take: 100 }),
    prisma.assessmentAttempt.findMany({
      where: { student: { organizationId: orgId }, status: "COMPLETED" },
      select: { score: true, assessmentId: true },
      take: 100,
    }),
    prisma.student.groupBy({ by: ["status"], where: { organizationId: orgId, deletedAt: null }, _count: true }),
    prisma.student.groupBy({ by: ["gender"], where: { organizationId: orgId, gender: { not: null }, deletedAt: null }, _count: true }),
    prisma.student.findMany({
      where: { organizationId: orgId, deletedAt: null },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const monthMap: Record<string, number> = {};
  for (const s of monthlySignups) {
    const key = s.createdAt.toISOString().slice(0, 7);
    monthMap[key] = (monthMap[key] || 0) + 1;
  }
  const signupsByMonth = Object.entries(monthMap).map(([month, count]) => ({ month, count })).sort((a, b) => a.month.localeCompare(b.month));

  return success({
    totalStudents: students,
    coursePreferences: coursePrefs.map(c => ({ name: c.preferredCourse, count: c._count })),
    countryPreferences: countryPrefs.map(c => ({ name: c.preferredCountry, count: c._count })),
    careerInterests: careerInterests.length,
    testPerformance: { total: testPerformance.length, averageScore: testPerformance.length > 0 ? testPerformance.reduce((s, a) => s + (a.score as any)?.overall || 0, 0) / testPerformance.length : 0 },
    statusDistribution: statusDist.map(s => ({ status: s.status, count: s._count })),
    genderDistribution: genderDist.map(g => ({ gender: g.gender, count: g._count })),
    signupsByMonth,
  });
}
