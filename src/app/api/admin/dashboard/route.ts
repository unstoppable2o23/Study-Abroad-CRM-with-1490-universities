import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { unauthorized, forbidden, success } from "@/lib/api-response";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "reports:read"); } catch { return forbidden(); }

  const orgId = user.organizationId;
  const now = new Date();

  const [totalStudents, studentsByStatus, pendingDocs, assignedTests, pendingTests, completedTests, totalApps, submittedApps, visaApps, popularUnis, preferredCountries, recentActivity] = await Promise.all([
    prisma.student.count({ where: { organizationId: orgId, deletedAt: null } }),
    prisma.student.groupBy({ by: ["status"], where: { organizationId: orgId, deletedAt: null }, _count: true }),
    prisma.document.count({ where: { student: { organizationId: orgId }, status: "PENDING", deletedAt: null } }),
    prisma.psychometricAssignment.count({ where: { student: { organizationId: orgId } } }),
    prisma.psychometricAssignment.count({ where: { student: { organizationId: orgId }, status: { in: ["ASSIGNED", "IN_PROGRESS"] } } }),
    prisma.psychometricAssignment.count({ where: { student: { organizationId: orgId }, status: "COMPLETED" } }),
    prisma.application.count({ where: { student: { organizationId: orgId }, deletedAt: null } }),
    prisma.application.count({ where: { student: { organizationId: orgId }, status: { in: ["SUBMITTED", "UNDER_REVIEW", "OFFER_RECEIVED", "OFFER_ACCEPTED"] }, deletedAt: null } }),
    prisma.application.count({ where: { student: { organizationId: orgId }, status: { in: ["VISA_PROCESSING", "VISA_APPROVED"] }, deletedAt: null } }),
    prisma.application.groupBy({ by: ["universityId"], where: { student: { organizationId: orgId }, deletedAt: null }, _count: true, orderBy: { _count: { universityId: "desc" } }, take: 5 }),
    prisma.student.groupBy({ by: ["country"], where: { organizationId: orgId, country: { not: null }, deletedAt: null }, _count: true, orderBy: { _count: { country: "desc" } }, take: 5 }),
    prisma.activity.findMany({ where: { student: { organizationId: orgId } }, orderBy: { createdAt: "desc" }, take: 10, include: { student: { select: { id: true, fullName: true } } } }),
  ]);

  const activeStudents = studentsByStatus.find(s => !["CLOSED", "DELETED"].includes(s.status))?._count ?? 0;
  const inactiveStudents = studentsByStatus.filter(s => ["CLOSED"].includes(s.status)).reduce((sum, s) => sum + s._count, 0);

  return success({
    students: { total: totalStudents, active: totalStudents - inactiveStudents, inactive: inactiveStudents },
    documents: { pending: pendingDocs },
    assessments: { total: assignedTests, pending: pendingTests, completed: completedTests },
    applications: { total: totalApps, submitted: submittedApps, visa: visaApps },
    popularUniversities: popularUnis,
    preferredCountries,
    recentActivity,
  });
}
