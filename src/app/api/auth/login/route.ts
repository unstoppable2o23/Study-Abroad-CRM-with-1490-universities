import { prisma } from "@/lib/prisma";
import { verifyPassword, generateTokens, storeRefreshToken } from "@/lib/auth";
import { success, error } from "@/lib/api-response";
import { logFailedLogin, logSuccessfulLogin, getClientInfo } from "@/lib/audit";
import { NextResponse } from "next/server";
import { z } from "zod";

const loginSchema = z.object({
  identifier: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return error("Invalid input");
    }

    const { identifier, password } = parsed.data;
    const clientInfo = getClientInfo(request);

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier.toLowerCase() },
          ...(identifier.includes("@") ? [] : [{ username: identifier }]),
        ],
      },
      include: { organization: true },
    });

    if (!user) {
      await logFailedLogin(identifier, clientInfo.ip, clientInfo.userAgent, "user_not_found");
      return error("Invalid credentials", 401);
    }

    if (user.status === "DELETED" || user.status === "SUSPENDED") {
      await logFailedLogin(user.email, clientInfo.ip, clientInfo.userAgent, `account_${user.status.toLowerCase()}`);
      return error("Account is not accessible", 403);
    }

    if (!user.isActive || user.status === "INACTIVE" || user.status === "PENDING") {
      await logFailedLogin(user.email, clientInfo.ip, clientInfo.userAgent, "account_inactive");
      return error("Account is not active", 403);
    }

    if (!user.organization.isActive) {
      await logFailedLogin(user.email, clientInfo.ip, clientInfo.userAgent, "organization_inactive");
      return error("Organization is not active", 403);
    }

    if (user.organization.subscriptionEnd && user.organization.subscriptionEnd < new Date()) {
      await logFailedLogin(user.email, clientInfo.ip, clientInfo.userAgent, "subscription_expired");
      return error("Organization subscription has expired", 403);
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      await logFailedLogin(user.email, clientInfo.ip, clientInfo.userAgent, "invalid_password");
      return error("Invalid credentials", 401);
    }

    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    });

    await storeRefreshToken(user.id, tokens.refreshToken);

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          organizationId: user.organizationId,
        },
        accessToken: tokens.accessToken,
      },
    });

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

    await logSuccessfulLogin(user.id, user.email, user.organizationId, clientInfo.ip, clientInfo.userAgent);

    return response;
  } catch {
    return error("Internal server error", 500);
  }
}
