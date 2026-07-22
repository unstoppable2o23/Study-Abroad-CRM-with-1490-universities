import { vi } from "vitest";

export function createMockRequest(options?: {
  url?: string;
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  searchParams?: Record<string, string>;
}): Request {
  let url = options?.url || "http://localhost:3000/api/test";
  if (options?.searchParams) {
    const params = new URLSearchParams(options.searchParams);
    url += `?${params.toString()}`;
  }

  const headers = new Headers(options?.headers || {});
  if (options?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return new Request(url, {
    method: options?.method || "GET",
    headers,
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });
}

export function mockAuthenticatedUser(payload?: {
  userId?: string;
  email?: string;
  role?: string;
  organizationId?: string;
}) {
  return {
    userId: payload?.userId || "user-123",
    email: payload?.email || "test@example.com",
    role: payload?.role || "ADMIN",
    organizationId: payload?.organizationId || "org-123",
  };
}
