import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized, forbidden } from "@/lib/api-response";
import { createMeeting, getMeetings } from "@/lib/applications/meetings";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const { id } = await context.params;
    const app = await prisma.application.findUnique({ where: { id }, include: { student: { select: { userId: true, organizationId: true } } } });
    if (!app) return error("Application not found", 404);
    if (user.role === "STUDENT" && app.student.userId !== user.userId) return forbidden();

    const meetings = await getMeetings({ applicationId: id });
    return success(meetings);
  } catch { return error("Failed to fetch meetings", 500); }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role === "STUDENT") return forbidden();

  try {
    const { id } = await context.params;
    const body = await request.json();
    const { title, description, meetingType, startTime, endTime, location, isVirtual, notes } = body;
    if (!title || !startTime) return error("Title and startTime are required", 400);

    const meeting = await createMeeting({
      title, description, meetingType, startTime, endTime, location, isVirtual, notes,
      applicationId: id,
      studentId: body.studentId,
      organizerId: user.userId,
    });

    return success(meeting, 201);
  } catch (e) { return error("Failed to create meeting", 500); }
}
