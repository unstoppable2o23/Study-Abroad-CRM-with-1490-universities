import { describe, it, expect } from "vitest";
import {
  hasPermission,
  requirePermission,
  rolePermissions,
  type Permission,
} from "@/lib/rbac";

describe("rbac", () => {
  describe("rolePermissions", () => {
    it("defines permissions for all 5 roles", () => {
      expect(rolePermissions.SUPER_ADMIN).toBeDefined();
      expect(rolePermissions.ADMIN).toBeDefined();
      expect(rolePermissions.COUNSELOR).toBeDefined();
      expect(rolePermissions.DOCUMENT_VERIFIER).toBeDefined();
      expect(rolePermissions.STUDENT).toBeDefined();
    });

    it("SUPER_ADMIN has all permissions", () => {
      const allPermissions: Permission[] = [
        "students:read", "students:create", "students:update", "students:delete", "students:activate",
        "universities:read", "universities:create", "universities:update", "universities:delete",
        "courses:read", "courses:create", "courses:update", "courses:delete",
        "documents:read", "documents:review", "documents:approve",
        "psychometric:read", "psychometric:create", "psychometric:assign", "psychometric:score",
        "applications:read", "applications:update",
        "notifications:send",
        "settings:read", "settings:update",
        "users:manage", "organizations:manage", "audit:read", "sync:manage", "reports:read",
      ];
      for (const perm of allPermissions) {
        expect(rolePermissions.SUPER_ADMIN).toContain(perm);
      }
    });

    it("STUDENT has limited permissions", () => {
      expect(rolePermissions.STUDENT).toContain("students:read");
      expect(rolePermissions.STUDENT).toContain("universities:read");
      expect(rolePermissions.STUDENT).toContain("courses:read");
      expect(rolePermissions.STUDENT).toContain("documents:read");
      expect(rolePermissions.STUDENT).toContain("applications:read");
      expect(rolePermissions.STUDENT).toContain("applications:create");
      expect(rolePermissions.STUDENT).not.toContain("students:delete");
      expect(rolePermissions.STUDENT).not.toContain("organizations:manage");
      expect(rolePermissions.STUDENT).not.toContain("settings:update");
    });

    it("DOCUMENT_VERIFIER has only document-related permissions", () => {
      const perms = rolePermissions.DOCUMENT_VERIFIER;
      expect(perms).toContain("students:read");
      expect(perms).toContain("documents:read");
      expect(perms).toContain("documents:review");
      expect(perms).toContain("documents:approve");
      expect(perms).not.toContain("applications:update");
    });

    it("ADMIN has more permissions than COUNSELOR", () => {
      expect(rolePermissions.ADMIN.length).toBeGreaterThan(rolePermissions.COUNSELOR.length);
    });
  });

  describe("hasPermission", () => {
    it("returns true when role has permission", () => {
      expect(hasPermission("ADMIN", "students:read")).toBe(true);
      expect(hasPermission("STUDENT", "applications:create")).toBe(true);
    });

    it("returns false when role lacks permission", () => {
      expect(hasPermission("STUDENT", "students:delete")).toBe(false);
      expect(hasPermission("STUDENT", "organizations:manage")).toBe(false);
    });

    it("returns false for invalid role", () => {
      expect(hasPermission("INVALID_ROLE" as any, "students:read")).toBe(false);
    });
  });

  describe("requirePermission", () => {
    it("does not throw for granted permission", () => {
      expect(() => requirePermission("ADMIN", "students:read")).not.toThrow();
    });

    it("throws FORBIDDEN for missing permission", () => {
      expect(() => requirePermission("STUDENT", "students:delete")).toThrow("FORBIDDEN");
    });
  });

  describe("permission hierarchy", () => {
    it("COUNSELOR can read students but not create", () => {
      expect(hasPermission("COUNSELOR", "students:read")).toBe(true);
      expect(hasPermission("COUNSELOR", "students:create")).toBe(false);
    });

    it("ADMIN can create students", () => {
      expect(hasPermission("ADMIN", "students:create")).toBe(true);
    });

    it("COUNSELOR can review documents but not approve", () => {
      expect(hasPermission("COUNSELOR", "documents:review")).toBe(true);
      expect(hasPermission("COUNSELOR", "documents:approve")).toBe(false);
    });

    it("DOCUMENT_VERIFIER can approve documents", () => {
      expect(hasPermission("DOCUMENT_VERIFIER", "documents:approve")).toBe(true);
    });

    it("only SUPER_ADMIN can manage organizations", () => {
      expect(hasPermission("SUPER_ADMIN", "organizations:manage")).toBe(true);
      expect(hasPermission("ADMIN", "organizations:manage")).toBe(false);
      expect(hasPermission("COUNSELOR", "organizations:manage")).toBe(false);
    });
  });
});
