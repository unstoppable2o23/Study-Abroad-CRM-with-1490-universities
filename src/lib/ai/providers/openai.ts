import type { AIProvider, AICompletionRequest, AICompletionResponse, AIEmbeddingRequest, AIEmbeddingResponse, AIConfig } from "../types";

export class OpenAIProvider implements AIProvider {
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
  }

  isConfigured(): boolean {
    return !!this.config.apiKey;
  }

  async complete(req: AICompletionRequest): Promise<AICompletionResponse> {
    const response = await fetch(`${this.config.baseUrl || "https://api.openai.com/v1"}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: req.model || this.config.model || "gpt-4o",
        messages: req.messages,
        temperature: req.temperature ?? 0.7,
        max_tokens: req.maxTokens ?? 2048,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${error}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      usage: {
        promptTokens: data.usage?.prompt_tokens,
        completionTokens: data.usage?.completion_tokens,
        totalTokens: data.usage?.total_tokens,
      },
      model: data.model,
    };
  }

  async embed(req: AIEmbeddingRequest): Promise<AIEmbeddingResponse> {
    const input = typeof req.input === "string" ? [req.input] : req.input;
    const response = await fetch(`${this.config.baseUrl || "https://api.openai.com/v1"}/embeddings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: req.model || this.config.embeddingModel || "text-embedding-3-small",
        input,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI Embedding API error: ${response.status} ${error}`);
    }

    const data = await response.json();
    return {
      embeddings: data.data.map((d: any) => d.embedding),
      usage: { totalTokens: data.usage?.total_tokens },
      model: data.model,
    };
  }
}
