import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStorageDriver } from "@/lib/storage";
import { error } from "@/lib/api-response";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);

  try {
    const { id } = await context.params;

    const document = await prisma.document.findFirst({
      where: {
        id,
        OR: [
          { student: { userId: user.userId } },
          { student: { organizationId: user.organizationId } },
        ],
      },
      include: { student: true },
    });

    if (!document) return error("Document not found", 404);

    const driver = getStorageDriver();
    const url = driver.getPublicUrl(document.filePath);

    return NextResponse.redirect(url);
  } catch {
    return error("Download failed", 500);
  }
}