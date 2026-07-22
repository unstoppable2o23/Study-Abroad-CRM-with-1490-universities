import { prisma } from "@/lib/prisma";

export async function createTask(data: {
  title: string;
  description?: string;
  priority?: string;
  dueDate?: string;
  studentId?: string;
  applicationId?: string;
  assignedById: string;
  assignedToId?: string;
  category?: string;
}) {
  return prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      priority: data.priority || "MEDIUM",
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      studentId: data.studentId,
      applicationId: data.applicationId,
      assignedById: data.assignedById,
      assignedToId: data.assignedToId,
      category: data.category,
    },
    include: {
      assignedTo: { select: { id: true, fullName: true } },
      assignedBy: { select: { id: true, fullName: true } },
    },
  });
}

export async function getTasks(where: any = {}) {
  return prisma.task.findMany({
    where,
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    include: {
      student: { select: { id: true, fullName: true } },
      application: { select: { id: true, status: true, university: { select: { name: true } } } },
      assignedTo: { select: { id: true, fullName: true } },
      assignedBy: { select: { id: true, fullName: true } },
      followUps: { where: { status: "PENDING" }, select: { id: true, dueDate: true } },
    },
  });
}

export async function updateTask(id: string, data: any) {
  return prisma.task.update({ where: { id }, data });
}

export async function deleteTask(id: string) {
  return prisma.task.delete({ where: { id } });
}
