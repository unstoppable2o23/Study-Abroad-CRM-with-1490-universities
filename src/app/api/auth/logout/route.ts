import { getCurrentUser, revokeAllUserRefreshTokens } from "@/lib/auth";
import { createAuditLog, getClientInfo } from "@/lib/audit";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const user = await getCurrentUser(request);

  if (user) {
    await revokeAllUserRefreshTokens(user.userId);

    const clientInfo = getClientInfo(request);
    await createAuditLog({
      organizationId: user.organizationId,
      userId: user.userId,
      action: "LOGOUT",
      entity: "User",
      entityId: user.userId,
      ipAddress: clientInfo.ip,
      userAgent: clientInfo.userAgent,
    });
  }

  const response = NextResponse.json({ success: true, data: { message: "Logged out" } });
  response.cookies.delete("access_token");
  response.cookies.delete("refresh_token");

  return response;
}
