import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized } from "@/lib/api-response";
import { generateSystemAlerts, createNotification } from "@/lib/notifications/service";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const alerts = await generateSystemAlerts();
    const userAlerts = alerts.filter(a => a.userId === user.userId);
    return success({ alerts: userAlerts, total: userAlerts.length });
  } catch {
    return error("Failed to generate system alerts", 500);
  }
}

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const alerts = await generateSystemAlerts();
    const userAlerts = alerts.filter(a => a.userId === user.userId);
    const created = [];

    for (const alert of userAlerts) {
      const n = await createNotification({
        userId: alert.userId,
        type: "SYSTEM_ALERT",
        title: alert.title,
        message: alert.message,
        metadata: alert.metadata,
      });
      if (n) created.push(n);
    }

    return success({ alerts: created, total: created.length, skipped: userAlerts.length - created.length });
  } catch {
    return error("Failed to generate and save system alerts", 500);
  }
}
