import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const { id } = await context.params;
    const docs = await prisma.visaDocument.findMany({
      where: { countryId: id, isActive: true },
      orderBy: { order: "asc" },
    });
    return success(docs);
  } catch { return error("Failed to fetch visa documents", 500); }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const { id } = await context.params;
    const body = await request.json();
    const doc = await prisma.visaDocument.create({
      data: { countryId: id, ...body },
    });
    return success(doc, 201);
  } catch { return error("Failed to create visa document", 500); }
}
