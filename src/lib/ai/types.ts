export type AIProviderType = "openai" | "anthropic" | "google" | "azure" | "custom" | "fallback";

export type AIModelRole = "system" | "user" | "assistant";

export interface AIMessage {
  role: AIModelRole;
  content: string;
}

export interface AICompletionRequest {
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface AICompletionResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
}

export interface AIEmbeddingRequest {
  input: string | string[];
  model?: string;
}

export interface AIEmbeddingResponse {
  embeddings: number[][];
  usage?: { totalTokens: number };
  model: string;
}

export interface AIConfig {
  provider: AIProviderType;
  apiKey: string;
  baseUrl?: string;
  model?: string;
  embeddingModel?: string;
}

export interface AIProvider {
  complete(req: AICompletionRequest): Promise<AICompletionResponse>;
  embed(req: AIEmbeddingRequest): Promise<AIEmbeddingResponse>;
  isConfigured(): boolean;
}
