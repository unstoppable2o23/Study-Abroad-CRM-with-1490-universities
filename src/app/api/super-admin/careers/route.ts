import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { success, error, unauthorized, forbidden } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "careers:read"); } catch { return forbidden(); }

  const careers = await prisma.career.findMany({
    include: {
      _count: { select: { courses: true, psychometricMatches: true } },
    },
    orderBy: { name: "asc" },
  });

  return success(careers);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "careers:create"); } catch { return forbidden(); }

  try {
    const body = await request.json();
    const { name, description, skills, eligibility, futureScope, salaryTrends, recruiters, isEmerging, roadmap } = body;

    if (!name) return error("Career name is required", 400);

    const existing = await prisma.career.findUnique({ where: { name } });
    if (existing) return error("Career already exists", 409);

    const career = await prisma.career.create({
      data: {
        name,
        description: description || "",
        skills: skills || [],
        eligibility: eligibility || "",
        futureScope: futureScope || "",
        salaryTrends: salaryTrends || null,
        recruiters: recruiters || [],
        roadmap: roadmap || null,
        isEmerging: isEmerging || false,
      },
    });

    await createAuditLog({
      userId: user.userId,
      action: "CAREER_CREATED",
      entity: "Career",
      entityId: career.id,
      newValue: { name: career.name },
    });

    return success(career, 201);
  } catch {
    return error("Failed to create career", 500);
  }
}
