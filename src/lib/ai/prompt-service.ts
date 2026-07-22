import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAIProvider } from "./index";

export type PromptCategory = "CHATBOT" | "SOP" | "RESUME" | "RECOMMENDATION" | "DOCUMENT" | "ANALYSIS" | "COMPARISON";

export async function getPromptTemplate(key: string): Promise<{ systemPrompt: string; userPrompt?: string; temperature: number; maxTokens: number } | null> {
  const template = await prisma.aIPromptTemplate.findFirst({ where: { key, isDefault: true } });
  if (template) {
    return { systemPrompt: template.systemPrompt, userPrompt: template.userPrompt || undefined, temperature: template.temperature, maxTokens: template.maxTokens };
  }
  const anyTemplate = await prisma.aIPromptTemplate.findFirst({ where: { key } });
  if (!anyTemplate) return null;
  return { systemPrompt: anyTemplate.systemPrompt, userPrompt: anyTemplate.userPrompt || undefined, temperature: anyTemplate.temperature, maxTokens: anyTemplate.maxTokens };
}

interface CompleteWithTemplateOptions {
  key: string;
  variables?: Record<string, string>;
  userMessage?: string;
  context?: string;
  temperature?: number;
  maxTokens?: number;
}

export async function completeWithTemplate(opts: CompleteWithTemplateOptions): Promise<string> {
  const template = await getPromptTemplate(opts.key);
  let system = template?.systemPrompt || "You are a helpful study abroad assistant.";
  let userPrompt = template?.userPrompt;

  if (opts.variables) {
    for (const [k, v] of Object.entries(opts.variables)) {
      system = system.replaceAll(`{{${k}}}`, v);
      if (userPrompt) userPrompt = userPrompt.replaceAll(`{{${k}}}`, v);
    }
  }

  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: system },
  ];

  if (opts.context) {
    messages[0].content += `\n\nContext:\n${opts.context}`;
  }

  if (userPrompt) {
    messages.push({ role: "user", content: userPrompt });
  }

  if (opts.userMessage) {
    messages.push({ role: "user", content: opts.userMessage });
  }

  const provider = getAIProvider();
  const response = await provider.complete({
    messages,
    temperature: opts.temperature ?? template?.temperature ?? 0.3,
    maxTokens: opts.maxTokens ?? template?.maxTokens ?? 2048,
  });

  return response.content;
}

export async function logAIUsage(params: {
  userId?: string;
  feature: string;
  provider: string;
  model?: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  durationMs?: number;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await prisma.aIUsageLog.create({ data: params as any });
}
