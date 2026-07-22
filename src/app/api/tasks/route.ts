import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized } from "@/lib/api-response";
import { getTasks } from "@/lib/applications/tasks";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role === "STUDENT") return error("Forbidden", 403);

  try {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const assignedTo = url.searchParams.get("assignedTo");
    const category = url.searchParams.get("category");
    const dueBefore = url.searchParams.get("dueBefore");

    const where: any = {};
    if (["ADMIN", "COUNSELOR"].includes(user.role)) {
      where.assignedTo = { organizationId: user.organizationId };
    }
    if (assignedTo === "me") where.assignedToId = user.userId;
    else if (assignedTo) where.assignedToId = assignedTo;
    if (status) where.status = status;
    if (category) where.category = category;
    if (dueBefore) where.dueDate = { lte: new Date(dueBefore) };

    const tasks = await getTasks(where);
    return success(tasks);
  } catch { return error("Failed to fetch tasks", 500); }
}
