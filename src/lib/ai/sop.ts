import { getAIProvider } from "./index";
import { logAIUsage } from "./prompt-service";

const SOP_TEMPLATES: Record<string, { systemPrompt: string; userPrompt: string }> = {
  research: {
    systemPrompt: `You are an expert SOP (Statement of Purpose) writer for research programs. 
Generate a compelling, well-structured SOP that highlights research experience, academic achievements, and future research goals.
Format the SOP with proper paragraphs and sections. Use a formal academic tone.`,
    userPrompt: "Generate a research SOP for {{degree}} program in {{field}} at {{university}}.",
  },
  mba: {
    systemPrompt: `You are an expert SOP writer for MBA programs.
Generate a compelling SOP that highlights professional experience, leadership, career goals, and why this MBA program.
Use a confident professional tone.`,
    userPrompt: "Generate an MBA SOP for {{university}}.",
  },
  masters: {
    systemPrompt: `You are an expert SOP writer for Master's programs.
Generate a well-structured SOP covering academic background, work experience, reasons for choosing this program, and future goals.
Use a balanced academic-professional tone.`,
    userPrompt: "Generate a Master's SOP for {{degree}} at {{university}}.",
  },
  phd: {
    systemPrompt: `You are an expert SOP writer for PhD programs.
Generate a research-focused SOP that demonstrates deep knowledge of the field, research experience, specific research interests, and fit with the program.
Use a formal academic tone with technical depth.`,
    userPrompt: "Generate a PhD SOP for {{degree}} at {{university}}. Research interests: {{researchInterests}}.",
  },
  undergraduate: {
    systemPrompt: `You are an expert SOP writer for undergraduate programs.
Generate an SOP that highlights academic achievements, extracurricular activities, personal growth, and reasons for choosing this program.
Use a sincere and enthusiastic tone.`,
    userPrompt: "Generate an undergraduate SOP for {{degree}} at {{university}}.",
  },
};

export interface SOPInput {
  template: string;
  degree: string;
  field?: string;
  university: string;
  researchInterests?: string;
  academicBackground?: string;
  workExperience?: string;
  achievements?: string;
  goals?: string;
}

export async function generateSOP(input: SOPInput): Promise<{ content: string; template: string; wordCount: number }> {
  const templateConfig = SOP_TEMPLATES[input.template] || SOP_TEMPLATES.masters;

  const variables: Record<string, string> = {
    degree: input.degree,
    field: input.field || "your field",
    university: input.university,
    researchInterests: input.researchInterests || "Not specified",
  };

  let systemPrompt = templateConfig.systemPrompt;
  let userPrompt = templateConfig.userPrompt;
  for (const [k, v] of Object.entries(variables)) {
    systemPrompt = systemPrompt.replaceAll(`{{${k}}}`, v);
    userPrompt = userPrompt.replaceAll(`{{${k}}}`, v);
  }

  if (input.academicBackground) userPrompt += `\nAcademic Background: ${input.academicBackground}`;
  if (input.workExperience) userPrompt += `\nWork Experience: ${input.workExperience}`;
  if (input.achievements) userPrompt += `\nAchievements: ${input.achievements}`;
  if (input.goals) userPrompt += `\nCareer Goals: ${input.goals}`;

  const provider = getAIProvider();
  const start = Date.now();

  const response = await provider.complete({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    maxTokens: 4096,
  });

  await logAIUsage({
    feature: "SOP",
    provider: provider.isConfigured() ? process.env.AI_PROVIDER || "openai" : "fallback",
    model: process.env.AI_MODEL,
    promptTokens: response.usage?.promptTokens,
    completionTokens: response.usage?.completionTokens,
    totalTokens: response.usage?.totalTokens,
    durationMs: Date.now() - start,
  });

  const wordCount = response.content.split(/\s+/).filter(Boolean).length;
  return { content: response.content, template: input.template, wordCount };
}
