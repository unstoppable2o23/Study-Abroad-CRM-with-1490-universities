import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized, forbidden } from "@/lib/api-response";
import { createCall, getCalls } from "@/lib/applications/calls";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const { id } = await context.params;
    const app = await prisma.application.findUnique({ where: { id }, include: { student: { select: { userId: true, organizationId: true } } } });
    if (!app) return error("Application not found", 404);
    if (user.role === "STUDENT" && app.student.userId !== user.userId) return forbidden();

    const calls = await getCalls({ applicationId: id });
    return success(calls);
  } catch { return error("Failed to fetch calls", 500); }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role === "STUDENT") return forbidden();

  try {
    const { id } = await context.params;
    const body = await request.json();
    const { callType, duration, notes, outcome, followUpRequired } = body;

    const call = await createCall({
      applicationId: id,
      studentId: body.studentId,
      callerId: user.userId,
      callType, duration, notes, outcome, followUpRequired,
    });

    return success(call, 201);
  } catch { return error("Failed to log call", 500); }
}
