import { prisma } from "@/lib/prisma";

export async function createMeeting(data: {
  title: string;
  description?: string;
  meetingType?: string;
  startTime: string;
  endTime?: string;
  location?: string;
  isVirtual?: boolean;
  studentId: string;
  applicationId?: string;
  organizerId: string;
  notes?: string;
}) {
  return prisma.meeting.create({
    data: {
      title: data.title,
      description: data.description,
      meetingType: data.meetingType || "COUNSELING",
      startTime: new Date(data.startTime),
      endTime: data.endTime ? new Date(data.endTime) : undefined,
      location: data.location,
      isVirtual: data.isVirtual || false,
      studentId: data.studentId,
      applicationId: data.applicationId,
      organizerId: data.organizerId,
      notes: data.notes,
    },
    include: {
      student: { select: { id: true, fullName: true } },
      organizer: { select: { id: true, fullName: true } },
    },
  });
}

export async function getMeetings(where: any = {}) {
  return prisma.meeting.findMany({
    where,
    orderBy: { startTime: "desc" },
    include: {
      student: { select: { id: true, fullName: true } },
      organizer: { select: { id: true, fullName: true } },
      application: { select: { id: true, status: true } },
    },
  });
}

export async function updateMeeting(id: string, data: any) {
  const updateData: any = { ...data };
  if (data.startTime) updateData.startTime = new Date(data.startTime);
  if (data.endTime) updateData.endTime = new Date(data.endTime);
  return prisma.meeting.update({ where: { id }, data: updateData });
}
