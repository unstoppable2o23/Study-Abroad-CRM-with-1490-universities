import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const { id } = await context.params;
    const reasons = await prisma.visaRejectionReason.findMany({
      where: { countryId: id, isActive: true },
    });
    return success(reasons);
  } catch { return error("Failed to fetch rejection reasons", 500); }
}
