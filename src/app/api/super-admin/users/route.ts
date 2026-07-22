import { prisma } from "@/lib/prisma";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { success, error } from "@/lib/api-response";
import { createAuditLog } from "@/lib/audit";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);
  try {
    requirePermission(user.role, "users:manage");
    const users = await prisma.user.findMany({
      select: { id: true, email: true, fullName: true, role: true, isActive: true, organizationId: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    return success(users);
  } catch { return error("Forbidden", 403); }
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return error("Unauthorized", 401);
  try {
    requirePermission(currentUser.role, "users:manage");
    const body = await request.json();
    const passwordHash = await hashPassword(body.password || "changeme123");
    const newUser = await prisma.user.create({
      data: {
        email: body.email, passwordHash, fullName: body.fullName,
        role: body.role, organizationId: body.organizationId,
      },
    });
    await createAuditLog({
      userId: currentUser.userId, action: "CREATE", entity: "User", entityId: newUser.id,
      newValue: { email: newUser.email, role: newUser.role },
    });
    return success({ id: newUser.id, email: newUser.email, fullName: newUser.fullName, role: newUser.role }, 201);
  } catch { return error("Forbidden", 403); }
}
