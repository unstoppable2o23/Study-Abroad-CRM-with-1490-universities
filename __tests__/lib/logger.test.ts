import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  logger,
  createChildLogger,
  auditLogger,
  securityLogger,
  performanceLogger,
  logApiRequest,
  logSecurityEvent,
  logAuditEvent,
  logError,
} from "@/lib/logger";

describe("logger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exports logger instance", () => {
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe("function");
    expect(typeof logger.error).toBe("function");
    expect(typeof logger.warn).toBe("function");
    expect(typeof logger.debug).toBe("function");
  });

  it("creates child logger with bindings", () => {
    const child = createChildLogger({ module: "test" });
    expect(child).toBeDefined();
    expect(typeof child.info).toBe("function");
  });

  it("exports typed loggers", () => {
    expect(auditLogger).toBeDefined();
    expect(securityLogger).toBeDefined();
    expect(performanceLogger).toBeDefined();
  });

  it("logApiRequest logs method, url, status, and duration", () => {
    const spy = vi.spyOn(logger, "info");
    logApiRequest("GET", "/api/test", 200, 45, "user-1", "org-1");
    expect(spy).toHaveBeenCalled();
    const call = spy.mock.calls[0];
    expect(call[1]).toContain("GET");
    expect(call[1]).toContain("/api/test");
    expect(call[1]).toContain("200");
    expect(call[1]).toContain("45ms");
  });

  it("logSecurityEvent logs event with severity", () => {
    const spy = vi.spyOn(securityLogger, "warn");
    logSecurityEvent("failed_login", "medium", { email: "test@test.com" }, "user-1", "127.0.0.1");
    expect(spy).toHaveBeenCalled();
  });

  it("logAuditEvent logs action, entity, entityId", () => {
    const spy = vi.spyOn(auditLogger, "info");
    logAuditEvent("CREATE", "Student", "student-1", undefined, { name: "John" }, "user-1", "org-1");
    expect(spy).toHaveBeenCalled();
  });

  it("logError logs error details", () => {
    const spy = vi.spyOn(logger, "error");
    const error = new Error("Test error");
    logError(error, { context: "test" }, "user-1");
    expect(spy).toHaveBeenCalled();
  });
});
