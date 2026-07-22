import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized } from "@/lib/api-response";
import { NotificationType } from "@prisma/client";

const VALID_TYPES: NotificationType[] = [
  "DOCUMENT_UPDATE", "TEST_ASSIGNMENT", "SUBSCRIPTION_EXPIRY",
  "APPLICATION_UPDATE", "STUDENT_APP_STATUS_CHANGE",
  "TASK_ASSIGNED", "MEETING_SCHEDULED", "CALL_LOGGED",
  "SYSTEM_ALERT", "DEADLINE_REMINDER", "RECOMMENDATION", "GENERAL",
];

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    let prefs = await prisma.notificationPreference.findUnique({ where: { userId: user.userId } });
    if (!prefs) {
      prefs = await prisma.notificationPreference.create({
        data: { userId: user.userId, types: VALID_TYPES },
      });
    }
    return success(prefs);
  } catch {
    return error("Failed to fetch notification preferences", 500);
  }
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const body = await request.json();

    const allowedFields = ["email", "inApp", "push", "types", "quietHoursStart", "quietHoursEnd", "digestFrequency"];
    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) updateData[field] = body[field];
    }

    if (body.types) {
      if (!Array.isArray(body.types)) return error("types must be an array", 400);
      const invalid = body.types.filter((t: string) => !VALID_TYPES.includes(t as NotificationType));
      if (invalid.length > 0) return error(`Invalid notification types: ${invalid.join(", ")}`, 400);
    }

    const prefs = await prisma.notificationPreference.upsert({
      where: { userId: user.userId },
      update: updateData,
      create: { userId: user.userId, ...updateData, types: body.types || VALID_TYPES },
    });

    return success(prefs);
  } catch {
    return error("Failed to update notification preferences", 500);
  }
}
