import { NextRequest } from "next/server";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog, getClientInfo } from "@/lib/audit";
import { validatePassword } from "@/lib/password";
import { success, error, validationError, unauthorized, forbidden } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  if (!["SUPER_ADMIN", "ADMIN"].includes(user.role)) return forbidden("Only admins can reset passwords");

  try {
    const body = await request.json();
    const { targetUserId, newPassword } = body;

    if (!targetUserId || !newPassword) return error("User ID and new password required", 400);

    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.valid) {
      return validationError({ password: passwordCheck.errors });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) return error("User not found", 404);

    if (targetUser.role === "SUPER_ADMIN" && user.role !== "SUPER_ADMIN") {
      return forbidden("Cannot reset Super Admin password");
    }

    if (targetUser.organizationId !== user.organizationId && user.role !== "SUPER_ADMIN") {
      return forbidden("Cannot reset password for user in different organization");
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: targetUserId },
      data: { passwordHash, status: "ACTIVE" },
    });

    await prisma.refreshToken.deleteMany({ where: { userId: targetUserId } });

    const clientInfo = getClientInfo(request);
    await createAuditLog({
      organizationId: user.organizationId,
      userId: user.userId,
      action: "PASSWORD_RESET",
      entity: "User",
      entityId: targetUserId,
      oldValue: { previousHash: targetUser.passwordHash.substring(0, 10) + "..." },
      newValue: { targetEmail: targetUser.email },
      ipAddress: clientInfo.ip,
      userAgent: clientInfo.userAgent,
    });

    return success({ message: "Password reset successfully" });
  } catch {
    return error("Failed to reset password", 500);
  }
}
