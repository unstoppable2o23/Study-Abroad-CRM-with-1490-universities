import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    student: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

vi.mock("@/lib/audit", () => ({
  createAuditLog: vi.fn(),
  getClientInfo: vi.fn().mockReturnValue({ ip: "127.0.0.1", userAgent: "test" }),
}));

import { requireAuth, requirePermission, requireTenant, requireResourceOwnership } from "@/lib/guards";
import * as auth from "@/lib/auth";
import * as prismaModule from "@/lib/prisma";
import type { JwtPayload } from "@/lib/auth";

const mockUser: JwtPayload = {
  userId: "user-123",
  email: "admin@test.com",
  role: "ADMIN",
  organizationId: "org-123",
};

const mockSuperAdmin: JwtPayload = {
  userId: "super-1",
  email: "super@test.com",
  role: "SUPER_ADMIN",
  organizationId: "org-123",
};

const mockStudent: JwtPayload = {
  userId: "student-1",
  email: "student@test.com",
  role: "STUDENT",
  organizationId: "org-123",
};

const mockCounselor: JwtPayload = {
  userId: "counselor-1",
  email: "counselor@test.com",
  role: "COUNSELOR",
  organizationId: "org-123",
};

describe("guards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("requireAuth", () => {
    it("returns user when authenticated and active", async () => {
      vi.mocked(auth.getCurrentUser).mockResolvedValue(mockUser);
      vi.mocked(prismaModule.prisma.user.findUnique).mockResolvedValue({
        isActive: true,
        status: "ACTIVE",
      } as any);

      const result = await requireAuth();
      expect(result.allowed).toBe(true);
      if (result.allowed) {
        expect(result.user.userId).toBe("user-123");
      }
    });

    it("returns unauthorized when no token", async () => {
      vi.mocked(auth.getCurrentUser).mockResolvedValue(null);

      const result = await requireAuth();
      expect(result.allowed).toBe(false);
      if (!result.allowed) {
        expect(result.response.status).toBe(401);
      }
    });

    it("returns unauthorized when account is inactive", async () => {
      vi.mocked(auth.getCurrentUser).mockResolvedValue(mockUser);
      vi.mocked(prismaModule.prisma.user.findUnique).mockResolvedValue({
        isActive: false,
        status: "INACTIVE",
      } as any);

      const result = await requireAuth();
      expect(result.allowed).toBe(false);
      if (!result.allowed) {
        expect(result.response.status).toBe(401);
      }
    });

    it("returns unauthorized when account is deleted", async () => {
      vi.mocked(auth.getCurrentUser).mockResolvedValue(mockUser);
      vi.mocked(prismaModule.prisma.user.findUnique).mockResolvedValue({
        isActive: false,
        status: "DELETED",
      } as any);

      const result = await requireAuth();
      expect(result.allowed).toBe(false);
    });
  });

  describe("requirePermission", () => {
    it("returns allowed when user has permission", () => {
      const result = requirePermission(mockUser, "students:read");
      expect(result.allowed).toBe(true);
    });

    it("returns forbidden when user lacks permission", () => {
      const result = requirePermission(mockUser, "organizations:manage");
      expect(result.allowed).toBe(false);
      if (!result.allowed) {
        expect(result.response.status).toBe(403);
      }
    });

    it("returns forbidden for student trying admin action", () => {
      const result = requirePermission(mockStudent, "users:manage");
      expect(result.allowed).toBe(false);
    });

    it("allows super admin everything", () => {
      expect(requirePermission(mockSuperAdmin, "organizations:manage").allowed).toBe(true);
      expect(requirePermission(mockSuperAdmin, "sync:manage").allowed).toBe(true);
      expect(requirePermission(mockSuperAdmin, "audit:read").allowed).toBe(true);
    });
  });

  describe("requireTenant", () => {
    it("allows same organization access", async () => {
      const result = await requireTenant(mockUser, "org-123");
      expect(result.allowed).toBe(true);
    });

    it("denies cross-organization access for non-super-admin", async () => {
      const result = await requireTenant(mockUser, "org-456");
      expect(result.allowed).toBe(false);
      if (!result.allowed) {
        expect(result.response.status).toBe(403);
      }
    });

    it("allows super admin cross-organization access", async () => {
      const result = await requireTenant(mockSuperAdmin, "org-456");
      expect(result.allowed).toBe(true);
    });

    it("allows access when target org is null (self-service)", async () => {
      const result = await requireTenant(mockUser, null);
      expect(result.allowed).toBe(true);
    });
  });

  describe("requireResourceOwnership", () => {
    it("allows super admin access to any resource", async () => {
      const result = await requireResourceOwnership(mockSuperAdmin, "other-user");
      expect(result.allowed).toBe(true);
    });

    it("allows student access to own resources", async () => {
      const result = await requireResourceOwnership(mockStudent, "student-1");
      expect(result.allowed).toBe(true);
    });

    it("denies student access to other user's resources", async () => {
      const result = await requireResourceOwnership(mockStudent, "other-user");
      expect(result.allowed).toBe(false);
    });

    it("allows admin access to own org student resources", async () => {
      vi.mocked(prismaModule.prisma.student.findUnique).mockResolvedValue({
        organizationId: "org-123",
        userId: "student-1",
      } as any);

      const result = await requireResourceOwnership(mockUser, null, "student-abc");
      expect(result.allowed).toBe(true);
    });

    it("denies counselor access to unassigned students", async () => {
      vi.mocked(prismaModule.prisma.student.findUnique).mockResolvedValue({
        organizationId: "org-123",
        userId: "student-1",
      } as any);
      vi.mocked(prismaModule.prisma.student.findFirst).mockResolvedValue(null);

      const result = await requireResourceOwnership(mockCounselor, null, "student-abc");
      expect(result.allowed).toBe(false);
    });

    it("allows counselor access to assigned students", async () => {
      vi.mocked(prismaModule.prisma.student.findUnique).mockResolvedValue({
        organizationId: "org-123",
        userId: "student-1",
        counselorId: "counselor-1",
      } as any);
      vi.mocked(prismaModule.prisma.student.findFirst).mockResolvedValue({ id: "student-abc" } as any);

      const result = await requireResourceOwnership(mockCounselor, null, "student-abc");
      expect(result.allowed).toBe(true);
    });
  });
});
