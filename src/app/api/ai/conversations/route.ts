import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized } from "@/lib/api-response";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const where: any = { status: { not: "ARCHIVED" } };

    if (user.role === "STUDENT") {
      where.userId = user.userId;
    } else if (user.role === "ADMIN" || user.role === "COUNSELOR") {
      where.user = { organizationId: user.organizationId };
    }

    const conversations = await prisma.aIConversation.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: 50,
      include: {
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
        user: { select: { id: true, fullName: true, email: true } },
      },
    });

    return success(conversations.map(c => ({
      id: c.id,
      title: c.title,
      status: c.status,
      user: c.user,
      lastMessage: c.messages[0]?.content?.slice(0, 200) || null,
      messageCount: (c.metadata as any)?.messageCount || 0,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    })));
  } catch {
    return error("Failed to fetch conversations", 500);
  }
}
