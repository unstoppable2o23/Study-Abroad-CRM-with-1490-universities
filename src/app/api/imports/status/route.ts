import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { success, error, unauthorized, forbidden } from "@/lib/api-response";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "sync:manage"); } catch { return forbidden(); }

  try {
    const [universities, courses, careers, scholarships, pendingUnis, pendingCourses, pendingCareers] = await Promise.all([
      prisma.university.count({ where: { status: "PENDING_REVIEW" } }),
      prisma.course.count({ where: { status: "PENDING_REVIEW", importSource: "CSV" } }),
      prisma.career.count({ where: { status: "PENDING_REVIEW" } }),
      prisma.scholarship.count({ where: { isActive: false } }),
      prisma.university.count({ where: { status: "PENDING_REVIEW" } }),
      prisma.course.count({ where: { status: "PENDING_REVIEW" } }),
      prisma.career.count({ where: { status: "PENDING_REVIEW" } }),
    ]);

    const recentImports = await prisma.auditLog.findMany({
      where: {
        action: { in: ["UNIVERSITY_IMPORT", "COURSE_IMPORT", "CAREER_IMPORT", "SCHOLARSHIP_IMPORT"] },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { action: true, newValue: true, createdAt: true, userId: true },
    });

    return success({
      pendingApprovals: {
        universities: pendingUnis, courses: pendingCourses, careers: pendingCareers,
        total: pendingUnis + pendingCourses + pendingCareers,
      },
      csvImported: { universities, courses, careers, scholarships },
      recentImports,
    });
  } catch {
    return error("Failed to fetch import status", 500);
  }
}
