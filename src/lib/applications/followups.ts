import { prisma } from "@/lib/prisma";

export async function createFollowUp(data: {
  title: string;
  description?: string;
  dueDate: string;
  studentId?: string;
  applicationId?: string;
  taskId?: string;
  createdById: string;
  assignedToId?: string;
  category?: string;
}) {
  return prisma.followUp.create({
    data: {
      title: data.title,
      description: data.description,
      dueDate: new Date(data.dueDate),
      studentId: data.studentId,
      applicationId: data.applicationId,
      taskId: data.taskId,
      createdById: data.createdById,
      assignedToId: data.assignedToId,
      category: data.category,
    },
    include: {
      assignedTo: { select: { id: true, fullName: true } },
      createdBy: { select: { id: true, fullName: true } },
    },
  });
}

export async function getFollowUps(where: any = {}) {
  return prisma.followUp.findMany({
    where,
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    include: {
      student: { select: { id: true, fullName: true } },
      application: { select: { id: true, status: true } },
      assignedTo: { select: { id: true, fullName: true } },
      createdBy: { select: { id: true, fullName: true } },
      task: { select: { id: true, title: true } },
    },
  });
}

export async function updateFollowUp(id: string, data: any) {
  const updateData: any = { ...data };
  if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
  if (data.completedAt !== undefined) updateData.completedAt = data.completedAt ? new Date() : null;
  return prisma.followUp.update({ where: { id }, data: updateData });
}
