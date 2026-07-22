import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { unauthorized, forbidden, success } from "@/lib/api-response";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try {
    requirePermission(user.role, "reports:read");
  } catch {
    return forbidden();
  }

  const now = new Date();

  const [orgs, activeOrgs, expiredOrgs, totalUsers, totalStudents] = await Promise.all([
    prisma.organization.count(),
    prisma.organization.count({ where: { isActive: true, subscriptionEnd: { gt: now } } }),
    prisma.organization.count({ where: { subscriptionEnd: { lt: now } } }),
    prisma.user.count(),
    prisma.student.count({ where: { deletedAt: null } }),
  ]);

  const expiringOrgs = await prisma.organization.count({
    where: {
      isActive: true,
      subscriptionEnd: {
        gt: now,
        lt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      },
    },
  });

  const [admins, counselors, countries, universities, courses, careers] = await Promise.all([
    prisma.user.count({ where: { role: "ADMIN", isActive: true } }),
    prisma.user.count({ where: { role: "COUNSELOR", isActive: true } }),
    prisma.country.count(),
    prisma.university.count({ where: { deletedAt: null } }),
    prisma.course.count({ where: { deletedAt: null } }),
    prisma.career.count({ where: { deletedAt: null } }),
  ]);

  const [psychometricTests, completedPsychometric, aiConversations, knowledgeDocs] = await Promise.all([
    prisma.psychometricAssignment.count(),
    prisma.psychometricAssignment.count({ where: { status: "COMPLETED" } }),
    prisma.aIConversation.count(),
    prisma.knowledgeDocument.count({ where: { status: "APPROVED" } }),
  ]);

  return success({
    organizations: { total: orgs, active: activeOrgs, expired: expiredOrgs, expiring: expiringOrgs },
    users: { total: totalUsers, admins, counselors, students: totalStudents },
    education: { countries, universities, courses, careers },
    assessments: { total: psychometricTests, completed: completedPsychometric, pending: psychometricTests - completedPsychometric },
    ai: { conversations: aiConversations, knowledgeDocuments: knowledgeDocs },
  });
}
