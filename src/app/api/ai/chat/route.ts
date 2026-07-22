import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized } from "@/lib/api-response";
import { getAIProvider } from "@/lib/ai";
import { queryWithRAG } from "@/lib/ai/rag";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const body = await request.json();
    const { message, conversationId } = body;
    if (!message) return error("Message is required", 400);

    let conversation;
    if (conversationId) {
      conversation = await prisma.aIConversation.findFirst({
        where: { id: conversationId, userId: user.userId, status: { not: "ARCHIVED" } },
      });
      if (!conversation) return error("Conversation not found", 404);
    } else {
      conversation = await prisma.aIConversation.create({
        data: { userId: user.userId, title: message.slice(0, 100) },
      });
    }

    // Save user message
    await prisma.aIMessage.create({
      data: { conversationId: conversation.id, role: "user", content: message },
    });

    // Get conversation history
    const history = await prisma.aIMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: "asc" },
      take: 20,
    });

    // Try RAG first, then fall back to AI-only
    let answer: string;
    let sources: Array<{ content: string; score: number }> = [];

    try {
      const ragResult = await queryWithRAG({
        query: message,
        studentId: user.role === "STUDENT" ? user.userId : undefined,
        systemPrompt: `You are a helpful study abroad and career guidance assistant. Answer based on the provided context.
If the user asks about universities, courses, countries, careers, visas, or scholarships, use the available data.
If the context doesn't contain enough information, say so and suggest what the user can do.`,
      });
      answer = ragResult.answer;
      sources = ragResult.sources;
    } catch {
      // Fallback to AI-only
      const provider = getAIProvider();
      const aiMessages = history.map(m => ({ role: m.role as "user" | "assistant" | "system", content: m.content }));
      const response = await provider.complete({
        messages: [
          { role: "system", content: "You are a helpful study abroad and career guidance assistant. Help students with university selection, course guidance, career advice, visa information, and application tips." },
          ...aiMessages,
        ],
        temperature: 0.5,
      });
      answer = response.content;
    }

    // Save assistant response
    const aiMsg = await prisma.aIMessage.create({
      data: { conversationId: conversation.id, role: "assistant", content: answer },
    });

    return success({
      conversationId: conversation.id,
      message: { id: aiMsg.id, role: "assistant", content: answer, createdAt: aiMsg.createdAt },
      sources: sources.slice(0, 3),
    });
  } catch (e) {
    return error("Failed to process chat: " + (e instanceof Error ? e.message : "Unknown"), 500);
  }
}
