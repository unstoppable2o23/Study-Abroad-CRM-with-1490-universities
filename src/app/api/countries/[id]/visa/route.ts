import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const { id } = await context.params;
    const country = await prisma.country.findUnique({ where: { id } });
    if (!country) return error("Country not found", 404);

    return success({
      visaInfo: country.visaInfo,
      studentVisaProcess: country.studentVisaProcess,
      visaDocuments: country.visaDocuments,
      visaTimeline: country.visaTimeline,
    });
  } catch { return error("Failed to fetch visa info", 500); }
}
