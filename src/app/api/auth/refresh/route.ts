import { verifyRefreshToken, generateTokens, storeRefreshToken, revokeRefreshToken, isRefreshTokenValid } from "@/lib/auth";
import { error } from "@/lib/api-response";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (!refreshToken) {
      return error("No refresh token", 401);
    }

    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return error("Invalid or expired refresh token", 401);
    }

    const valid = await isRefreshTokenValid(refreshToken);
    if (!valid) {
      const res = NextResponse.json({ success: false, error: "Refresh token has been revoked" }, { status: 401 });
      res.cookies.delete("access_token");
      res.cookies.delete("refresh_token");
      return res;
    }

    const tokens = generateTokens({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      organizationId: payload.organizationId,
    });

    await revokeRefreshToken(refreshToken);
    await storeRefreshToken(payload.userId, tokens.refreshToken);

    const response = NextResponse.json({ success: true, data: { accessToken: tokens.accessToken } });
    response.cookies.set("access_token", tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60,
    });
    response.cookies.set("refresh_token", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/auth/refresh",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch {
    return error("Internal server error", 500);
  }
}
