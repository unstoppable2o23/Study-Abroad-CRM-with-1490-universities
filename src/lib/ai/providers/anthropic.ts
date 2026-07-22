import type { AIProvider, AICompletionRequest, AICompletionResponse, AIEmbeddingRequest, AIEmbeddingResponse, AIConfig } from "../types";

export class AnthropicProvider implements AIProvider {
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
  }

  isConfigured(): boolean {
    return !!this.config.apiKey;
  }

  async complete(req: AICompletionRequest): Promise<AICompletionResponse> {
    const systemMessages = req.messages.filter((m) => m.role === "system");
    const userMessages = req.messages.filter((m) => m.role !== "system");

    const response = await fetch(`${this.config.baseUrl || "https://api.anthropic.com/v1"}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.config.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: req.model || this.config.model || "claude-3-5-sonnet-20241022",
        messages: userMessages,
        system: systemMessages.length > 0 ? systemMessages.map((m) => m.content).join("\n") : undefined,
        temperature: req.temperature ?? 0.7,
        max_tokens: req.maxTokens ?? 2048,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${response.status} ${error}`);
    }

    const data = await response.json();
    return {
      content: data.content[0].text,
      usage: {
        promptTokens: data.usage?.input_tokens,
        completionTokens: data.usage?.output_tokens,
        totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
      },
      model: data.model,
    };
  }

  async embed(req: AIEmbeddingRequest): Promise<AIEmbeddingResponse> {
    throw new Error("Anthropic does not provide embedding APIs. Use a different provider for embeddings.");
  }
}
