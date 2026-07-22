import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized, forbidden } from "@/lib/api-response";
import { createTask, getTasks } from "@/lib/applications/tasks";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const { id } = await context.params;
    const app = await prisma.application.findUnique({ where: { id }, include: { student: { select: { userId: true, organizationId: true } } } });
    if (!app) return error("Application not found", 404);
    if (user.role === "STUDENT" && app.student.userId !== user.userId) return forbidden();
    if (["ADMIN", "COUNSELOR"].includes(user.role) && app.student.organizationId !== user.organizationId) return forbidden();

    const tasks = await getTasks({ applicationId: id });
    return success(tasks);
  } catch { return error("Failed to fetch tasks", 500); }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role === "STUDENT") return forbidden();

  try {
    const { id } = await context.params;
    const body = await request.json();
    const { title, description, priority, dueDate, assignedToId, category } = body;
    if (!title) return error("Title is required", 400);

    const task = await createTask({
      title, description, priority, dueDate, category,
      applicationId: id,
      studentId: body.studentId,
      assignedById: user.userId,
      assignedToId: assignedToId || user.userId,
    });

    return success(task, 201);
  } catch (e) { return error("Failed to create task: " + (e instanceof Error ? e.message : ""), 500); }
}
