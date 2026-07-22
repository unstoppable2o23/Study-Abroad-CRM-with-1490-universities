import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized, forbidden } from "@/lib/api-response";
import { updateTask, deleteTask } from "@/lib/applications/tasks";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, context: { params: Promise<{ id: string; taskId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role === "STUDENT") return forbidden();

  try {
    const { id, taskId } = await context.params;
    const body = await request.json();
    const updateData: any = {};
    if (body.title) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.status) updateData.status = body.status;
    if (body.priority) updateData.priority = body.priority;
    if (body.dueDate) updateData.dueDate = new Date(body.dueDate);
    if (body.assignedToId) updateData.assignedToId = body.assignedToId;
    if (body.category) updateData.category = body.category;
    if (body.status === "COMPLETED") updateData.completedAt = new Date();

    const updated = await updateTask(taskId, updateData);
    return success(updated);
  } catch (e) { return error("Failed to update task", 500); }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string; taskId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role === "STUDENT") return forbidden();

  try {
    const { id, taskId } = await context.params;
    await deleteTask(taskId);
    return success({ deleted: true });
  } catch { return error("Failed to delete task", 500); }
}
