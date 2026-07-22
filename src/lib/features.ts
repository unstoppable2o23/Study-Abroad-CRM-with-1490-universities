import { prisma } from "@/lib/prisma";

export async function getOrgFeatures(orgId: string): Promise<Set<string>> {
  const overrides = await prisma.organizationFeature.findMany({
    where: { orgId },
    select: { featureKey: true, enabled: true },
  });

  const defaults = await prisma.feature.findMany({
    where: { isDefault: true },
    select: { key: true },
  });

  const overrideMap = new Map(overrides.map(o => [o.featureKey, o.enabled]));
  const enabled = new Set<string>();

  for (const d of defaults) {
    enabled.add(d.key);
  }
  for (const [key, val] of overrideMap) {
    if (val) enabled.add(key);
    else enabled.delete(key);
  }

  return enabled;
}

export async function getStudentFeatureAccess(studentId: string): Promise<Set<string>> {
  const [orgFeatureKeys, studentGrants] = await Promise.all([
    prisma.student.findUnique({
      where: { id: studentId },
      select: { organizationId: true },
    }).then(s => s ? getOrgFeatures(s.organizationId) : new Set<string>()),
    prisma.studentFeatureAccess.findMany({
      where: { studentId },
      select: { featureKey: true, granted: true },
    }),
  ]);

  const grantMap = new Map(studentGrants.map(g => [g.featureKey, g.granted]));
  const result = new Set(orgFeatureKeys);

  for (const [key, granted] of grantMap) {
    if (granted) result.add(key);
    else result.delete(key);
  }

  return result;
}
