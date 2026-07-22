import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized, forbidden } from "@/lib/api-response";
import { createFollowUp, getFollowUps, updateFollowUp } from "@/lib/applications/followups";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const { id } = await context.params;
    const app = await prisma.application.findUnique({ where: { id }, include: { student: { select: { userId: true, organizationId: true } } } });
    if (!app) return error("Application not found", 404);
    if (user.role === "STUDENT" && app.student.userId !== user.userId) return forbidden();

    const followUps = await getFollowUps({ applicationId: id });
    return success(followUps);
  } catch { return error("Failed to fetch follow-ups", 500); }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role === "STUDENT") return forbidden();

  try {
    const { id } = await context.params;
    const body = await request.json();
    const { title, description, dueDate, assignedToId, category } = body;
    if (!title || !dueDate) return error("Title and dueDate are required", 400);

    const followUp = await createFollowUp({
      title, description, dueDate, category,
      applicationId: id,
      studentId: body.studentId,
      createdById: user.userId,
      assignedToId: assignedToId || user.userId,
    });

    return success(followUp, 201);
  } catch (e) { return error("Failed to create follow-up", 500); }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role === "STUDENT") return forbidden();

  try {
    const { id } = await context.params;
    const body = await request.json();
    const { followUpId } = body;
    if (!followUpId) return error("followUpId is required", 400);

    const updated = await updateFollowUp(followUpId, body);
    return success(updated);
  } catch { return error("Failed to update follow-up", 500); }
}
