import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized, forbidden } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/applications/activity";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role === "STUDENT") return forbidden();

  try {
    const { id } = await context.params;
    const body = await request.json();

    const app = await prisma.application.findUnique({ where: { id }, include: { student: true } });
    if (!app) return error("Application not found", 404);

    const updateData: any = {};
    if (body.departureDate) updateData.departureDate = new Date(body.departureDate);
    if (body.arrivalDate) updateData.arrivalDate = new Date(body.arrivalDate);

    const updated = await prisma.application.update({ where: { id }, data: updateData });

    await logActivity({
      type: "TRAVEL_UPDATED",
      description: body.departureDate ? `Departure scheduled for ${body.departureDate}` : "Travel details updated",
      studentId: app.studentId,
      applicationId: id,
      userId: user.userId,
    });

    return success(updated);
  } catch { return error("Failed to update travel details", 500); }
}
