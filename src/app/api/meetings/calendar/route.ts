import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized } from "@/lib/api-response";
import { getMeetings } from "@/lib/applications/meetings";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role === "STUDENT") return error("Forbidden", 403);

  try {
    const url = new URL(request.url);
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");

    const where: any = {
      organizer: { organizationId: user.organizationId },
    };
    if (from || to) {
      where.startTime = {};
      if (from) where.startTime.gte = new Date(from);
      if (to) where.startTime.lte = new Date(to);
    }

    const meetings = await getMeetings(where);
    return success(meetings);
  } catch { return error("Failed to fetch calendar", 500); }
}
