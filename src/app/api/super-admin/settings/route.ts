import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { success, error } from "@/lib/api-response";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);
  try {
    requirePermission(user.role, "settings:read");
    const settings = await prisma.setting.findMany();
    const map: Record<string, unknown> = {};
    settings.forEach((s) => { map[s.key] = s.value; });
    return success(map);
  } catch { return error("Forbidden", 403); }
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);
  try {
    requirePermission(user.role, "settings:update");
    const body = await request.json();
    for (const [key, value] of Object.entries(body)) {
      await prisma.setting.upsert({
        where: { key },
        update: { value: value as any },
        create: { key, value: value as any },
      });
    }
    return success({ message: "Settings updated" });
  } catch { return error("Forbidden", 403); }
}
