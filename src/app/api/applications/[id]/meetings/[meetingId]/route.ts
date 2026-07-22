import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized, forbidden } from "@/lib/api-response";
import { updateMeeting } from "@/lib/applications/meetings";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, context: { params: Promise<{ id: string; meetingId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role === "STUDENT") return forbidden();

  try {
    const { id, meetingId } = await context.params;
    const body = await request.json();
    const updated = await updateMeeting(meetingId, body);
    return success(updated);
  } catch { return error("Failed to update meeting", 500); }
}
