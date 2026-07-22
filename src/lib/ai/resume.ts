import { getAIProvider } from "./index";
import { logAIUsage } from "./prompt-service";

interface ResumeInput {
  template: "modern" | "classic" | "academic" | "ats";
  fullName: string;
  email: string;
  phone?: string;
  summary?: string;
  education: Array<{ degree: string; institution: string; year: string; gpa?: string }>;
  skills: string[];
  projects?: Array<{ name: string; description: string; technologies?: string[] }>;
  certifications?: Array<{ name: string; issuer: string; year: string }>;
  achievements?: string[];
  experience?: Array<{ company: string; role: string; duration: string; description: string }>;
}

const RESUME_PROMPTS: Record<string, string> = {
  modern: "Generate a modern, visually clean ATS-friendly resume. Use clear section headers and bullet points. Format with proper spacing.",
  classic: "Generate a classic professional resume. Use traditional section headers and formal language. Keep formatting conservative.",
  academic: "Generate an academic CV style resume. Emphasize publications, research, teaching experience, and academic achievements.",
  ats: "Generate an ATS-optimized resume. Use simple formatting, standard section headers, and keyword-rich content. Avoid tables or columns.",
};

export async function generateResume(input: ResumeInput): Promise<{ content: string; template: string }> {
  const templatePrompt = RESUME_PROMPTS[input.template] || RESUME_PROMPTS.modern;

  const provider = getAIProvider();
  const start = Date.now();

  const response = await provider.complete({
    messages: [
      { role: "system", content: `You are a professional resume writer. ${templatePrompt}

Return the resume as plain text with clear section headers.` },
      { role: "user", content: `Generate a resume with this information:
${JSON.stringify(input, null, 2)}` },
    ],
    temperature: 0.5,
    maxTokens: 4096,
  });

  await logAIUsage({
    feature: "RESUME",
    provider: provider.isConfigured() ? process.env.AI_PROVIDER || "openai" : "fallback",
    model: process.env.AI_MODEL,
    promptTokens: response.usage?.promptTokens,
    completionTokens: response.usage?.completionTokens,
    totalTokens: response.usage?.totalTokens,
    durationMs: Date.now() - start,
  });

  return { content: response.content, template: input.template };
}
