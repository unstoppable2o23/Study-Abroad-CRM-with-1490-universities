import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { success, unauthorized } from "@/lib/api-response";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const org = await prisma.organization.findUnique({
    where: { id: user.organizationId },
    select: { id: true, name: true, logo: true, brandColor: true, colors: true },
  });

  return success(org || { id: null, name: "Unknown", logo: null, brandColor: null, colors: null });
}
