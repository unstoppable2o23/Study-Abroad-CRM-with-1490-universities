import { prisma } from "@/lib/prisma";
import { NotificationType, Prisma } from "@prisma/client";

export interface CreateNotificationInput {
  userId?: string;
  studentId?: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export async function createNotification(input: CreateNotificationInput) {
  if (!input.userId && !input.studentId) return null;

  if (input.userId) {
    const prefs = await prisma.notificationPreference.findUnique({ where: { userId: input.userId } });
    if (prefs && !prefs.inApp) return null;
    if (prefs && prefs.types.length > 0 && !prefs.types.includes(input.type)) return null;
    if (prefs && prefs.quietHoursStart && prefs.quietHoursEnd) {
      const now = new Date();
      const currentHHmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      if (currentHHmm >= prefs.quietHoursStart && currentHHmm <= prefs.quietHoursEnd) return null;
    }
  }

  let targetUserId = input.userId;
  if (!targetUserId && input.studentId) {
    const student = await prisma.student.findUnique({ where: { id: input.studentId }, select: { userId: true } });
    if (!student) return null;
    targetUserId = student.userId;
  }

  if (!targetUserId) return null;

  return prisma.notification.create({
    data: {
      userId: targetUserId,
      studentId: input.studentId || null,
      type: input.type,
      title: input.title,
      message: input.message,
      metadata: input.metadata as Prisma.InputJsonValue,
    },
  });
}

export async function notifyStudent(studentId: string, type: NotificationType, title: string, message: string, metadata?: Record<string, unknown>) {
  return createNotification({ studentId, type, title, message, metadata });
}

export async function notifyUser(userId: string, type: NotificationType, title: string, message: string, metadata?: Record<string, unknown>) {
  return createNotification({ userId, type, title, message, metadata });
}

export async function createSystemAlert(title: string, message: string, userId?: string, metadata?: Record<string, unknown>) {
  return createNotification({
    userId, type: "SYSTEM_ALERT" as NotificationType, title, message, metadata,
  });
}

export async function generateSystemAlerts() {
  const alerts: Array<{ userId: string; title: string; message: string; metadata?: Record<string, unknown> }> = [];

  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const upcomingDeadlines = await prisma.application.findMany({
    where: {
      status: { not: "ENROLLED" },
      deletedAt: null,
      offerDeadline: { lte: nextWeek, gte: new Date() },
    },
    include: {
      student: { select: { userId: true } },
      university: { select: { name: true } },
    },
  });
  for (const app of upcomingDeadlines) {
    alerts.push({
      userId: app.student.userId,
      title: "Offer Deadline Approaching",
      message: `Offer deadline for ${app.university.name} is ${app.offerDeadline?.toLocaleDateString()}`,
      metadata: { applicationId: app.id, deadline: app.offerDeadline?.toISOString() },
    });
  }

  const overdueTasks = await prisma.task.findMany({
    where: { status: "PENDING", dueDate: { lt: new Date() } },
    include: { assignedTo: { select: { id: true } } },
  });
  for (const task of overdueTasks) {
    if (!task.assignedToId) continue;
    alerts.push({
      userId: task.assignedToId,
      title: "Overdue Task",
      message: `Task "${task.title}" is overdue (due ${task.dueDate?.toLocaleDateString()})`,
      metadata: { taskId: task.id, dueDate: task.dueDate?.toISOString() },
    });
  }

  const pendingAssignments = await prisma.psychometricAssignment.findMany({
    where: { status: "ASSIGNED" },
    include: {
      student: { select: { userId: true } },
      test: { select: { title: true } },
    },
  });
  for (const assignment of pendingAssignments) {
    alerts.push({
      userId: assignment.student.userId,
      title: "Pending Psychometric Test",
      message: `Test "${assignment.test.title}" is pending completion`,
      metadata: { assignmentId: assignment.id, testName: assignment.test.title },
    });
  }

  return alerts;
}
