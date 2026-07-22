import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import type { UserRole, User, UserStatus } from "@prisma/client";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "dev-jwt-secret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "dev-refresh-secret";
const ACCESS_EXPIRATION: string = process.env.JWT_ACCESS_EXPIRATION || "24h";
const REFRESH_EXPIRATION: string = process.env.JWT_REFRESH_EXPIRATION || "7d";

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  organizationId: string;
}

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    organizationId: string;
  };
}

function parseExpiration(exp: string): number {
  const match = exp.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60;
  const val = parseInt(match[1]);
  switch (match[2]) {
    case "s": return val;
    case "m": return val * 60;
    case "h": return val * 3600;
    case "d": return val * 86400;
    default: return 7 * 24 * 60 * 60;
  }
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + parseExpiration(REFRESH_EXPIRATION) * 1000);
  await prisma.refreshToken.create({
    data: { tokenHash, userId, expiresAt },
  });
}

export async function revokeRefreshToken(refreshToken: string): Promise<void> {
  const tokenHash = hashToken(refreshToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function revokeAllUserRefreshTokens(userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function isRefreshTokenValid(refreshToken: string): Promise<boolean> {
  const tokenHash = hashToken(refreshToken);
  const record = await prisma.refreshToken.findFirst({
    where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
  });
  return record !== null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateTokens(payload: JwtPayload) {
  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_EXPIRATION,
  });

  const refreshToken = jwt.sign(
    { ...payload, type: "refresh", jti: crypto.randomUUID() },
    JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRATION }
  );

  return { accessToken, refreshToken };
}

export function verifyAccessToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(request?: Request): Promise<JwtPayload | null> {
  let token: string | undefined;

  try {
    const cookieStore = await cookies();
    token = cookieStore.get("access_token")?.value;
  } catch {}

  if (!token && request) {
    const cookieHeader = request.headers.get("cookie");
    if (cookieHeader) {
      const match = cookieHeader.match(/(?:^|;\s*)access_token=([^;]*)/);
      token = match?.[1];
    }
    if (!token) {
      const authHeader = request.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.slice(7);
      }
    }
  }

  if (!token) return null;
  return verifyAccessToken(token);
}

export async function getCurrentUserWithDetails(): Promise<{
  id: string;
  email: string;
  username: string | null;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  organizationId: string;
  lastLoginAt: Date | null;
  createdAt: Date;
} | null> {
  const payload = await getCurrentUser();
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      username: true,
      fullName: true,
      role: true,
      status: true,
      organizationId: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });

  return user;
}

export function hasRole(user: JwtPayload | null, roles: UserRole[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

export function requireRole(user: JwtPayload | null, roles: UserRole[]): void {
  if (!hasRole(user, roles)) {
    throw new Error("FORBIDDEN");
  }
}
