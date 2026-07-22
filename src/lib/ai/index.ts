import type { AIProvider, AIConfig, AIProviderType } from "./types";
import { OpenAIProvider } from "./providers/openai";
import { AnthropicProvider } from "./providers/anthropic";
import { FallbackProvider } from "./providers/fallback";

export type { AIProvider, AIConfig, AIProviderType };
export type { AICompletionRequest, AICompletionResponse, AIEmbeddingRequest, AIEmbeddingResponse, AIMessage } from "./types";

let cachedConfig: AIConfig | null = null;
let cachedProvider: AIProvider | null = null;

function loadConfigFromEnv(): AIConfig {
  return {
    provider: (process.env.AI_PROVIDER as AIProviderType) || "openai",
    apiKey: process.env.AI_API_KEY || "",
    baseUrl: process.env.AI_BASE_URL || undefined,
    model: process.env.AI_MODEL || undefined,
    embeddingModel: process.env.AI_EMBEDDING_MODEL || undefined,
  };
}

export function getAIProvider(config?: AIConfig): AIProvider {
  const cfg = config || loadConfigFromEnv();

  if (cachedProvider && !config) return cachedProvider;

  // If no API key, use fallback
  if (!cfg.apiKey) {
    const fallback = new FallbackProvider(cfg);
    if (!config) cachedProvider = fallback;
    return fallback;
  }

  let provider: AIProvider;
  switch (cfg.provider) {
    case "anthropic":
      provider = new AnthropicProvider(cfg);
      break;
    case "openai":
    default:
      provider = new OpenAIProvider(cfg);
      break;
  }

  if (!config) cachedProvider = provider;
  return provider;
}

export function resetProvider(): void {
  cachedProvider = null;
}

export function isAIConfigured(): boolean {
  return !!process.env.AI_API_KEY;
}

export function getAIConfig(): AIConfig {
  if (!cachedConfig) cachedConfig = loadConfigFromEnv();
  return cachedConfig;
}
