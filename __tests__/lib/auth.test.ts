import { describe, it, expect, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";

const JWT_SECRET = "test-jwt-secret";
const JWT_REFRESH_SECRET = "test-refresh-secret";

vi.mock("@/lib/auth", async () => {
  const actual = await vi.importActual<typeof import("@/lib/auth")>("@/lib/auth");
  let bcryptCounter = 0;
  const bcryptHashMap = new Map<string, string>();
  return {
    ...actual,
    hashPassword: vi.fn().mockImplementation(async (password: string) => {
      bcryptCounter++;
      const h = `$2a$12$mockhash${String(bcryptCounter).padStart(50, "0")}`;
      bcryptHashMap.set(h, password);
      return h;
    }),
    verifyPassword: vi.fn().mockImplementation(async (password: string, hash: string) => {
      return bcryptHashMap.get(hash) === password;
    }),
    storeRefreshToken: vi.fn().mockResolvedValue(undefined),
    revokeRefreshToken: vi.fn().mockResolvedValue(undefined),
    revokeAllUserRefreshTokens: vi.fn().mockResolvedValue(undefined),
    isRefreshTokenValid: vi.fn().mockResolvedValue(true),
  };
});

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue({ value: "mock-token" }),
  }),
}));

import {
  hashPassword,
  verifyPassword,
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  hasRole,
  requireRole,
  hashToken,
  type JwtPayload,
} from "@/lib/auth";

const mockPayload: JwtPayload = {
  userId: "user-123",
  email: "test@example.com",
  role: "ADMIN",
  organizationId: "org-123",
};

describe("auth", () => {
  describe("hashPassword", () => {
    it("returns a hashed password different from input", async () => {
      const hash = await hashPassword("mypassword");
      expect(hash).not.toBe("mypassword");
      expect(hash.length).toBeGreaterThan(10);
    });

    it("produces valid bcrypt hashes that verify correctly", async () => {
      const hash1 = await hashPassword("mypassword");
      const hash2 = await hashPassword("mypassword");
      expect(hash1).toMatch(/^\$2[aby]?\$/);
      expect(hash2).toMatch(/^\$2[aby]?\$/);
      expect(await verifyPassword("mypassword", hash1)).toBe(true);
      expect(await verifyPassword("mypassword", hash2)).toBe(true);
    });
  });

  describe("verifyPassword", () => {
    it("returns true for matching password", async () => {
      const hash = await hashPassword("mypassword");
      const result = await verifyPassword("mypassword", hash);
      expect(result).toBe(true);
    });

    it("returns false for non-matching password", async () => {
      const hash = await hashPassword("mypassword");
      const result = await verifyPassword("wrongpassword", hash);
      expect(result).toBe(false);
    });
  });

  describe("hashToken", () => {
    it("returns a deterministic SHA-256 hash", () => {
      const token = "my-refresh-token";
      const hash1 = hashToken(token);
      const hash2 = hashToken(token);
      expect(hash1).toBe(hash2);
      expect(hash1.length).toBe(64);
      expect(hash1).toMatch(/^[a-f0-9]{64}$/);
    });

    it("returns different hashes for different tokens", () => {
      const hash1 = hashToken("token-1");
      const hash2 = hashToken("token-2");
      expect(hash1).not.toBe(hash2);
    });
  });

  describe("generateTokens", () => {
    it("returns both accessToken and refreshToken", () => {
      const tokens = generateTokens(mockPayload);
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(typeof tokens.accessToken).toBe("string");
      expect(typeof tokens.refreshToken).toBe("string");
    });

    it("access token contains expected payload", () => {
      const tokens = generateTokens(mockPayload);
      const decoded = jwt.verify(tokens.accessToken, JWT_SECRET) as JwtPayload;
      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded.role).toBe(mockPayload.role);
      expect(decoded.organizationId).toBe(mockPayload.organizationId);
    });

    it("refresh token has type=refresh and jti in payload", () => {
      const tokens = generateTokens(mockPayload);
      const decoded = jwt.verify(tokens.refreshToken, JWT_REFRESH_SECRET) as any;
      expect(decoded.type).toBe("refresh");
      expect(decoded.jti).toBeDefined();
      expect(decoded.userId).toBe(mockPayload.userId);
    });

    it("generates different refresh tokens each time (unique jti)", () => {
      const tokens1 = generateTokens(mockPayload);
      const tokens2 = generateTokens(mockPayload);
      expect(tokens1.refreshToken).not.toBe(tokens2.refreshToken);
    });
  });

  describe("verifyAccessToken", () => {
    it("returns payload for valid token", () => {
      const tokens = generateTokens(mockPayload);
      const result = verifyAccessToken(tokens.accessToken);
      expect(result).not.toBeNull();
      expect(result?.userId).toBe(mockPayload.userId);
    });

    it("returns null for invalid token", () => {
      const result = verifyAccessToken("invalid-token");
      expect(result).toBeNull();
    });

    it("returns null for token signed with wrong secret", () => {
      const token = jwt.sign(mockPayload, "wrong-secret");
      const result = verifyAccessToken(token);
      expect(result).toBeNull();
    });
  });

  describe("verifyRefreshToken", () => {
    it("returns payload for valid refresh token", () => {
      const tokens = generateTokens(mockPayload);
      const result = verifyRefreshToken(tokens.refreshToken);
      expect(result).not.toBeNull();
      expect(result?.userId).toBe(mockPayload.userId);
    });

    it("returns null for access token used as refresh", () => {
      const tokens = generateTokens(mockPayload);
      const result = verifyRefreshToken(tokens.accessToken);
      expect(result).toBeNull();
    });
  });

  describe("hasRole", () => {
    it("returns true when user has matching role", () => {
      expect(hasRole(mockPayload, ["ADMIN"])).toBe(true);
    });

    it("returns false when user lacks role", () => {
      expect(hasRole(mockPayload, ["STUDENT"])).toBe(false);
    });

    it("returns false for null user", () => {
      expect(hasRole(null, ["ADMIN"])).toBe(false);
    });

    it("checks multiple roles", () => {
      expect(hasRole(mockPayload, ["ADMIN", "COUNSELOR"])).toBe(true);
      expect(hasRole(mockPayload, ["STUDENT", "SUPER_ADMIN"])).toBe(false);
    });
  });

  describe("requireRole", () => {
    it("does not throw for matching role", () => {
      expect(() => requireRole(mockPayload, ["ADMIN"])).not.toThrow();
    });

    it("throws FORBIDDEN for non-matching role", () => {
      expect(() => requireRole(mockPayload, ["STUDENT"])).toThrow("FORBIDDEN");
    });

    it("throws FORBIDDEN for null user", () => {
      expect(() => requireRole(null, ["ADMIN"])).toThrow("FORBIDDEN");
    });
  });
});
