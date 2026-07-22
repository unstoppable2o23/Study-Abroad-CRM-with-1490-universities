import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { success, error, unauthorized, forbidden } from "@/lib/api-response";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const examType = await prisma.examType.findUnique({ where: { id } });
    if (!examType) return error("Exam type not found", 404);
    return success(examType);
  } catch {
    return error("Failed to fetch exam type", 500);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "settings:update"); } catch { return forbidden(); }

  try {
    const body = await request.json();
    const { name, code, description, minScore, maxScore, scoreUnit, isActive } = body;

    if (name || code) {
      const existing = await prisma.examType.findFirst({
        where: { OR: [{ name }, { code }].filter(Boolean), NOT: { id } },
      });
      if (existing) return error("Another exam type with this name or code already exists", 409);
    }

    const examType = await prisma.examType.update({
      where: { id },
      data: { ...(name && { name }), ...(code && { code }), ...(description !== undefined && { description }), ...(minScore !== undefined && { minScore: minScore ? parseFloat(minScore) : null }), ...(maxScore !== undefined && { maxScore: maxScore ? parseFloat(maxScore) : null }), ...(scoreUnit !== undefined && { scoreUnit }), ...(isActive !== undefined && { isActive }) },
    });

    return success(examType);
  } catch {
    return error("Failed to update exam type", 500);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { requirePermission(user.role, "settings:update"); } catch { return forbidden(); }

  try {
    await prisma.examType.delete({ where: { id } });
    return success({ deleted: true });
  } catch {
    return error("Failed to delete exam type", 500);
  }
}
