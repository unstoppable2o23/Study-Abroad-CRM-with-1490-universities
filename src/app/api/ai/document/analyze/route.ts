import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized } from "@/lib/api-response";
import { analyzeDocument } from "@/lib/ai/document-analysis";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const body = await request.json();
    const { fileName, fileType, content, documentType } = body;

    if (!fileName || !content || !documentType) {
      return error("fileName, content, and documentType are required", 400);
    }

    const result = await analyzeDocument({ fileName, fileType, content, documentType });
    return success(result);
  } catch (e) {
    return error("Failed to analyze document: " + (e instanceof Error ? e.message : ""), 500);
  }
}
