import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";
import { securityHeadersMiddleware, corsMiddleware } from "@/lib/middleware";

function createRequest(options?: { origin?: string; method?: string; headers?: Record<string, string> }) {
  const headers = new Headers(options?.headers || {});
  if (options?.origin) headers.set("origin", options.origin);

  return new NextRequest(new Request("http://localhost:3000/test", {
    method: options?.method || "GET",
    headers,
  }));
}

describe("middleware", () => {
  describe("securityHeadersMiddleware", () => {
    it("sets X-Content-Type-Options to nosniff", () => {
      const request = createRequest();
      const response = securityHeadersMiddleware(request);
      expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    });

    it("sets X-Frame-Options to DENY", () => {
      const request = createRequest();
      const response = securityHeadersMiddleware(request);
      expect(response.headers.get("X-Frame-Options")).toBe("DENY");
    });

    it("sets X-XSS-Protection", () => {
      const request = createRequest();
      const response = securityHeadersMiddleware(request);
      expect(response.headers.get("X-XSS-Protection")).toBe("1; mode=block");
    });

    it("sets Referrer-Policy", () => {
      const request = createRequest();
      const response = securityHeadersMiddleware(request);
      expect(response.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    });

    it("sets Permissions-Policy", () => {
      const request = createRequest();
      const response = securityHeadersMiddleware(request);
      const pp = response.headers.get("Permissions-Policy");
      expect(pp).toContain("camera=()");
      expect(pp).toContain("microphone=()");
      expect(pp).toContain("geolocation=()");
    });

    it("sets Content-Security-Policy", () => {
      const request = createRequest();
      const response = securityHeadersMiddleware(request);
      const csp = response.headers.get("Content-Security-Policy");
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("frame-ancestors 'none'");
    });

    it("sets HSTS in production", () => {
      const original = process.env.NODE_ENV;
      (process.env as Record<string, string>).NODE_ENV = "production";

      const request = createRequest();
      const response = securityHeadersMiddleware(request);
      expect(response.headers.get("Strict-Transport-Security")).toContain("max-age=31536000");

      (process.env as Record<string, string>).NODE_ENV = original;
    });

    it("does not set HSTS in non-production", () => {
      const original = process.env.NODE_ENV;
      (process.env as Record<string, string>).NODE_ENV = "development";

      const request = createRequest();
      const response = securityHeadersMiddleware(request);
      expect(response.headers.get("Strict-Transport-Security")).toBeNull();

      (process.env as Record<string, string>).NODE_ENV = original;
    });
  });

  describe("corsMiddleware", () => {
    it("sets Access-Control-Allow-Origin for allowed origin", () => {
      process.env.CORS_ORIGINS = "http://localhost:3000,http://example.com";
      const request = createRequest({ origin: "http://example.com" });
      const response = corsMiddleware(request);
      expect(response.headers.get("Access-Control-Allow-Origin")).toBe("http://example.com");
    });

    it("does not set CORS headers for disallowed origin", () => {
      process.env.CORS_ORIGINS = "http://localhost:3000";
      const request = createRequest({ origin: "http://evil.com" });
      const response = corsMiddleware(request);
      expect(response.headers.get("Access-Control-Allow-Origin")).toBeNull();
    });

    it("returns 204 for OPTIONS preflight", () => {
      process.env.CORS_ORIGINS = "http://localhost:3000";
      const request = createRequest({ method: "OPTIONS", origin: "http://localhost:3000" });
      const response = corsMiddleware(request);
      expect(response.status).toBe(204);
    });

    it("sets allowed methods and headers", () => {
      process.env.CORS_ORIGINS = "http://localhost:3000";
      const request = createRequest({ origin: "http://localhost:3000" });
      const response = corsMiddleware(request);
      expect(response.headers.get("Access-Control-Allow-Methods")).toContain("GET");
      expect(response.headers.get("Access-Control-Allow-Methods")).toContain("POST");
      expect(response.headers.get("Access-Control-Allow-Headers")).toContain("Content-Type");
    });

    it("sets credentials to true", () => {
      process.env.CORS_ORIGINS = "http://localhost:3000";
      const request = createRequest({ origin: "http://localhost:3000" });
      const response = corsMiddleware(request);
      expect(response.headers.get("Access-Control-Allow-Credentials")).toBe("true");
    });
  });
});
