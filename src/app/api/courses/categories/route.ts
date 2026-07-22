import { prisma } from "@/lib/prisma";
import { success, error } from "@/lib/api-response";

export async function GET() {
  try {
    const categories = await prisma.courseCategory.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { courses: true } },
        children: { where: { isActive: true }, select: { id: true, name: true, slug: true } },
      },
      orderBy: { name: "asc" },
    });
    return success(categories);
  } catch {
    return error("Failed to fetch categories", 500);
  }
}
