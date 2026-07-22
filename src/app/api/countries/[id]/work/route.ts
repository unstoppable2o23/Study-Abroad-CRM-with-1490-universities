import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const { id } = await context.params;
    const country = await prisma.country.findUnique({ where: { id }, select: { workOpportunities: true } });
    if (!country) return error("Country not found", 404);

    const opportunities = await prisma.workOpportunity.findMany({
      where: { countryId: id, isActive: true },
    });

    return success({ description: country.workOpportunities, opportunities });
  } catch { return error("Failed to fetch work opportunities", 500); }
}
