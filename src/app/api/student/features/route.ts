import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { success, unauthorized } from "@/lib/api-response";
import { getStudentFeatureAccess } from "@/lib/features";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const student = await prisma.student.findUnique({ where: { userId: user.userId } });
  if (!student) return success(await getDefaultFeatures());

  const enabled = await getStudentFeatureAccess(student.id);
  return success(Array.from(enabled));
}

async function getDefaultFeatures(): Promise<string[]> {
  const defaults = await prisma.feature.findMany({
    where: { isDefault: true },
    select: { key: true },
  });
  return defaults.map(f => f.key);
}
