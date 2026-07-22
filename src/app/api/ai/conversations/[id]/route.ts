import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized, forbidden } from "@/lib/api-response";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const { id } = await context.params;

    const conversation = await prisma.aIConversation.findUnique({
      where: { id },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
        user: { select: { id: true, fullName: true, email: true, role: true, organizationId: true } },
      },
    });

    if (!conversation) return error("Conversation not found", 404);

    if (user.role === "STUDENT" && conversation.userId !== user.userId) return forbidden();
    if (user.role === "ADMIN" && conversation.user.organizationId !== user.organizationId) return forbidden();

    return success({
      id: conversation.id,
      title: conversation.title,
      status: conversation.status,
      user: conversation.user,
      messages: conversation.messages.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        tokens: m.tokens,
        model: m.model,
        createdAt: m.createdAt,
      })),
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    });
  } catch {
    return error("Failed to fetch conversation", 500);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const { id } = await context.params;
    const body = await request.json();

    const conversation = await prisma.aIConversation.findUnique({ where: { id } });
    if (!conversation) return error("Conversation not found", 404);
    if (user.role === "STUDENT" && conversation.userId !== user.userId) return forbidden();

    const updateData: any = {};
    if (body.status) updateData.status = body.status;
    if (body.title) updateData.title = body.title;

    const updated = await prisma.aIConversation.update({ where: { id }, data: updateData });
    return success(updated);
  } catch {
    return error("Failed to update conversation", 500);
  }
}
