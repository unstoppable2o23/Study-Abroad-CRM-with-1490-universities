import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized } from "@/lib/api-response";
import { getAIProvider } from "@/lib/ai";
import { logAIUsage } from "@/lib/ai/prompt-service";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const body = await request.json();
    const { country, question } = body;
    if (!country || !question) return error("country and question are required", 400);

    const provider = getAIProvider();
    const start = Date.now();

    const response = await provider.complete({
      messages: [
        { role: "system", content: `You are a visa guidance expert specializing in study abroad for ${country}.
Answer questions about student visas, required documents, visa processes, timelines, work opportunities, and PR pathways for ${country}.
Provide accurate, helpful information. If the information is beyond your knowledge, suggest the user check the official immigration website.` },
        { role: "user", content: `Question about studying in ${country}: ${question}` },
      ],
      temperature: 0.3,
    });

    await logAIUsage({
      userId: user.userId,
      feature: "CHAT",
      provider: provider.isConfigured() ? process.env.AI_PROVIDER || "openai" : "fallback",
      model: process.env.AI_MODEL,
      durationMs: Date.now() - start,
      metadata: { type: "visa-guide", country },
    });

    return success({ answer: response.content });
  } catch (e) {
    return error("Failed to get visa guidance: " + (e instanceof Error ? e.message : ""), 500);
  }
}
