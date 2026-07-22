import type { AIProvider, AICompletionRequest, AICompletionResponse, AIEmbeddingRequest, AIEmbeddingResponse, AIConfig } from "../types";

export class FallbackProvider implements AIProvider {
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
  }

  isConfigured(): boolean {
    return true; // Fallback always "available"
  }

  async complete(req: AICompletionRequest): Promise<AICompletionResponse> {
    const lastMsg = req.messages[req.messages.length - 1]?.content || "";

    return {
      content: `[Fallback AI] I'm operating in fallback mode (no AI provider configured). Based on the available data:\n\n${generateFallbackResponse(lastMsg)}`,
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      model: "fallback-v1",
    };
  }

  async embed(_req: AIEmbeddingRequest): Promise<AIEmbeddingResponse> {
    return {
      embeddings: [[]],
      usage: { totalTokens: 0 },
      model: "fallback-v1",
    };
  }
}

function generateFallbackResponse(query: string): string {
  const q = query.toLowerCase();

  if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
    return "Hello! I'm your study abroad assistant. I can help with universities, courses, careers, visas, scholarships, and more. Please configure an AI provider (OpenAI, Anthropic) for full responses.";
  }

  if (q.includes("university") || q.includes("college") || q.includes("course")) {
    return "I can help you find universities and courses. Please check our university and course databases in the platform for available options. Configure an AI provider for personalized recommendations.";
  }

  if (q.includes("visa") || q.includes("student visa")) {
    return "For visa guidance, please visit the official immigration website of your target country. Common requirements include: acceptance letter, financial proof, language scores, and valid passport.";
  }

  if (q.includes("scholarship") || q.includes("financial aid")) {
    return "Scholarships depend on your profile, target country, and university. Check our scholarship database and configure an AI provider for personalized matches.";
  }

  if (q.includes("career") || q.includes("job")) {
    return "Career guidance is available. Check our career library for detailed information on various career paths, required skills, and recommended courses.";
  }

  return "I'm here to help with study abroad planning. Configure an AI provider (set AI_PROVIDER and AI_API_KEY in environment) for intelligent responses. For now, please browse our university and course catalogs.";
}
