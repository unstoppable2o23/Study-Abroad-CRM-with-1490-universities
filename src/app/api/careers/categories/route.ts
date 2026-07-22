import { prisma } from "@/lib/prisma";
import { success, error } from "@/lib/api-response";

export async function GET() {
  try {
    const categories = await prisma.careerCategory.findMany({
      where: { isActive: true },
      include: { _count: { select: { careers: true } } },
      orderBy: { name: "asc" },
    });
    return success(categories);
  } catch {
    return error("Failed to fetch career categories", 500);
  }
}
