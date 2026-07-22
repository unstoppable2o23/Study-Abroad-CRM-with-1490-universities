import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { success, error, unauthorized, forbidden } from "@/lib/api-response";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "students:read"); } catch { return forbidden(); }

  const url = new URL(request.url);
  const studentId = url.searchParams.get("studentId");
  if (!studentId) return error("studentId query parameter required", 400);

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { organizationId: true },
  });
  if (!student) return error("Student not found", 404);
  if (user.role !== "SUPER_ADMIN" && student.organizationId !== user.organizationId) return forbidden();

  const features = await prisma.feature.findMany({ orderBy: { key: "asc" } });
  const studentAccess = await prisma.studentFeatureAccess.findMany({ where: { studentId } });
  const accessMap = new Map(studentAccess.map(a => [a.featureKey, a.granted]));

  const result = features.map(f => ({
    key: f.key,
    name: f.name,
    description: f.description,
    module: f.module,
    isDefault: f.isDefault,
    granted: accessMap.has(f.key) ? accessMap.get(f.key)! : f.isDefault,
  }));

  return success(result);
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "students:update"); } catch { return forbidden(); }

  const body = await request.json();
  const { studentId, features } = body;

  if (!studentId || !Array.isArray(features)) return error("studentId and features array required", 400);

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { organizationId: true },
  });
  if (!student) return error("Student not found", 404);
  if (user.role !== "SUPER_ADMIN" && student.organizationId !== user.organizationId) return forbidden();

  for (const f of features) {
    if (!f.key || typeof f.granted !== "boolean") continue;
    await prisma.studentFeatureAccess.upsert({
      where: { studentId_featureKey: { studentId, featureKey: f.key } },
      update: { granted: f.granted, grantedBy: user.userId },
      create: { studentId, featureKey: f.key, granted: f.granted, grantedBy: user.userId },
    });
  }

  return success({ message: "Student features updated" });
}
