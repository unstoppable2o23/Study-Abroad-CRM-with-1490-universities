import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const { id } = await context.params;
    const processes = await prisma.visaProcess.findMany({
      where: { countryId: id, isActive: true },
      orderBy: { visaType: "asc" },
    });
    return success(processes);
  } catch { return error("Failed to fetch visa processes", 500); }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const { id } = await context.params;
    const body = await request.json();
    const process = await prisma.visaProcess.create({
      data: { countryId: id, ...body },
    });
    return success(process, 201);
  } catch { return error("Failed to create visa process", 500); }
}
