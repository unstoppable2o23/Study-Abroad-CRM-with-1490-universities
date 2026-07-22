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
    if (body.tuitionPaid !== undefined) updateData.tuitionPaid = body.tuitionPaid;
    if (body.tuitionAmount !== undefined) updateData.tuitionAmount = body.tuitionAmount;
    if (body.tuitionCurrency !== undefined) updateData.tuitionCurrency = body.tuitionCurrency;
    if (body.tuitionDeadline) updateData.tuitionDeadline = new Date(body.tuitionDeadline);

    const updated = await prisma.application.update({ where: { id }, data: updateData });

    await logActivity({
      type: "TUITION_UPDATED",
      description: `Tuition ${body.tuitionPaid ? "marked as paid" : "updated"}`,
      studentId: app.studentId,
      applicationId: id,
      userId: user.userId,
    });

    return success(updated);
  } catch { return error("Failed to update tuition details", 500); }
}
