import { getAIProvider } from "./index";
import { logAIUsage } from "./prompt-service";

interface DocumentAnalysisInput {
  fileName: string;
  fileType: string;
  content: string; // extracted text
  documentType: "SOP" | "RESUME" | "LOR" | "PASSPORT" | "TRANSCRIPT";
}

export async function analyzeDocument(input: DocumentAnalysisInput): Promise<{
  summary: string;
  missingInformation: string[];
  errors: string[];
  suggestions: string[];
  score: number;
}> {
  const provider = getAIProvider();
  const start = Date.now();

  const response = await provider.complete({
    messages: [
      { role: "system", content: `You are a document verification expert for study abroad applications.
Analyze the uploaded ${input.documentType} document and provide feedback.

Return a JSON object with:
- summary: brief overview of the document
- missingInformation: array of missing critical items
- errors: array of errors found
- suggestions: array of improvement suggestions
- score: overall quality score (0-100)` },
      { role: "user", content: `File: ${input.fileName}
Type: ${input.documentType}
Content:
${input.content.slice(0, 10000)}

Analyze this document.` },
    ],
    temperature: 0.2,
  });

  await logAIUsage({
    feature: "DOCUMENT",
    provider: provider.isConfigured() ? process.env.AI_PROVIDER || "openai" : "fallback",
    model: process.env.AI_MODEL,
    durationMs: Date.now() - start,
  });

  try {
    return JSON.parse(response.content.replace(/```json/g, "").replace(/```/g, ""));
  } catch {
    return {
      summary: response.content,
      missingInformation: [],
      errors: [],
      suggestions: [],
      score: 50,
    };
  }
}

export async function compareUniversities(universities: Array<{
  id: string;
  name: string;
  country: string;
  worldRanking?: number;
  tuitionFees?: number;
  livingCost?: number;
  intake?: string;
  courses: string[];
}>): Promise<{
  comparison: string;
  summary: string;
  recommendation: string;
  reasoning: string;
}> {
  const provider = getAIProvider();
  const start = Date.now();

  const response = await provider.complete({
    messages: [
      { role: "system", content: `You are a university comparison expert. Compare the following universities across rankings, fees, location, courses, and ROI.

Return a JSON object with:
- comparison: detailed comparison table as text
- summary: brief summary
- recommendation: which university is best and why
- reasoning: detailed reasoning` },
      { role: "user", content: `Compare these universities:
${JSON.stringify(universities, null, 2)}` },
    ],
    temperature: 0.3,
  });

  await logAIUsage({
    feature: "COMPARISON",
    provider: provider.isConfigured() ? process.env.AI_PROVIDER || "openai" : "fallback",
    model: process.env.AI_MODEL,
    durationMs: Date.now() - start,
  });

  try {
    return JSON.parse(response.content.replace(/```json/g, "").replace(/```/g, ""));
  } catch {
    return { comparison: response.content, summary: "", recommendation: "", reasoning: "" };
  }
}
