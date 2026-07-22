import { prisma } from "@/lib/prisma";
import { success } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const count = await prisma.university.count({ where: { deletedAt: null } });
    return success({ count });
  } catch {
    return success({ count: 0 });
  }
}
