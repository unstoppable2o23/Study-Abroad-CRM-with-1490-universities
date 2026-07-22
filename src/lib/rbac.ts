import type { UserRole } from "@prisma/client";

export type Permission =
  | "students:read"
  | "students:create"
  | "students:update"
  | "students:delete"
  | "students:activate"
  | "universities:read"
  | "universities:create"
  | "universities:update"
  | "universities:delete"
  | "courses:read"
  | "courses:create"
  | "courses:update"
  | "courses:delete"
  | "careers:read"
  | "careers:create"
  | "careers:update"
  | "careers:delete"
  | "documents:read"
  | "documents:review"
  | "documents:approve"
  | "psychometric:read"
  | "psychometric:create"
  | "psychometric:assign"
  | "psychometric:score"
  | "applications:read"
  | "applications:create"
  | "applications:update"
  | "notifications:send"
  | "settings:read"
  | "settings:update"
  | "users:manage"
  | "organizations:manage"
  | "audit:read"
  | "sync:manage"
  | "reports:read";

export const rolePermissions: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    "students:read", "students:create", "students:update", "students:delete", "students:activate",
    "universities:read", "universities:create", "universities:update", "universities:delete",
    "courses:read", "courses:create", "courses:update", "courses:delete",
    "careers:read", "careers:create", "careers:update", "careers:delete",
    "documents:read", "documents:review", "documents:approve",
    "psychometric:read", "psychometric:create", "psychometric:assign", "psychometric:score",
    "applications:read", "applications:update",
    "notifications:send",
    "settings:read", "settings:update",
    "users:manage",
    "organizations:manage",
    "audit:read",
    "sync:manage",
    "reports:read",
  ],
  ADMIN: [
    "students:read", "students:create", "students:update", "students:activate",
    "universities:read", "universities:create", "universities:update",
    "courses:read", "courses:create", "courses:update",
    "careers:read", "careers:create", "careers:update",
    "documents:read", "documents:review", "documents:approve",
    "psychometric:read", "psychometric:create", "psychometric:assign",
    "applications:read", "applications:update",
    "notifications:send",
    "settings:read",
    "reports:read",
  ],
  COUNSELOR: [
    "students:read", "students:update",
    "universities:read",
    "courses:read",
    "documents:read", "documents:review",
    "psychometric:read", "psychometric:assign",
    "applications:read", "applications:update",
    "reports:read",
  ],
  DOCUMENT_VERIFIER: [
    "students:read",
    "documents:read", "documents:review", "documents:approve",
  ],
  STUDENT: [
    "students:read",
    "universities:read",
    "courses:read",
    "documents:read",
    "applications:read", "applications:create",
  ],
};

export function hasPermission(
  role: UserRole,
  permission: Permission
): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

export function requirePermission(
  role: UserRole,
  permission: Permission
): void {
  if (!hasPermission(role, permission)) {
    throw new Error("FORBIDDEN");
  }
}
