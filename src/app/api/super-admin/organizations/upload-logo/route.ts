import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStorageDriver, validateFile, UploadInput } from "@/lib/storage";
import { success, error, unauthorized, forbidden } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try { const { requirePermission } = await import("@/lib/rbac"); requirePermission(user.role, "organizations:manage"); } catch { return forbidden(); }

  try {
    const formData = await request.formData();
    const file = formData.get("logo") as File | null;
    const orgId = formData.get("orgId") as string | null;
    if (!file) return error("No logo file provided", 400);
    if (!orgId) return error("orgId required", 400);

    const validation = validateFile({ mimeType: file.type, size: file.size });
    if (!validation.valid) return error(validation.error!, 400);

    const buffer = Buffer.from(await file.arrayBuffer());
    const input: UploadInput = { buffer, originalName: file.name, mimeType: file.type };
    const driver = getStorageDriver();
    const result = await driver.upload(input);

    const url = result.publicUrl || result.storagePath;

    await prisma.organization.update({
      where: { id: orgId },
      data: { logo: url },
    });

    return success({ url, fileName: result.fileName });
  } catch (err) {
    return error("Upload failed: " + (err instanceof Error ? err.message : ""), 500);
  }
}
