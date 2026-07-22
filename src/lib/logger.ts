import pino from "pino";

const isDevelopment = process.env.NODE_ENV !== "production";

const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? "debug" : "info"),
  transport: isDevelopment
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }
    : undefined,
  base: {
    service: "study-abroad-crm",
    environment: process.env.NODE_ENV || "development",
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
});

export { logger };

export function createChildLogger(bindings: Record<string, unknown>) {
  return logger.child(bindings);
}

export const auditLogger = createChildLogger({ type: "audit" });
export const securityLogger = createChildLogger({ type: "security" });
export const performanceLogger = createChildLogger({ type: "performance" });

export function logApiRequest(
  method: string,
  url: string,
  statusCode: number,
  durationMs: number,
  userId?: string,
  organizationId?: string
) {
  logger.info(
    {
      method,
      url,
      statusCode,
      durationMs,
      userId,
      organizationId,
      type: "api_request",
    },
    `${method} ${url} - ${statusCode} (${durationMs}ms)`
  );
}

export function logSecurityEvent(
  event: string,
  severity: "low" | "medium" | "high" | "critical",
  details: Record<string, unknown>,
  userId?: string,
  ip?: string
) {
  securityLogger.warn(
    {
      event,
      severity,
      ...details,
      userId,
      ip,
      timestamp: new Date().toISOString(),
    },
    `Security event: ${event} (${severity})`
  );
}

export function logAuditEvent(
  action: string,
  entity: string,
  entityId: string,
  oldValue?: unknown,
  newValue?: unknown,
  userId?: string,
  organizationId?: string
) {
  auditLogger.info(
    {
      action,
      entity,
      entityId,
      oldValue,
      newValue,
      userId,
      organizationId,
      timestamp: new Date().toISOString(),
    },
    `Audit: ${action} ${entity} ${entityId}`
  );
}

export function logError(
  error: Error,
  context: Record<string, unknown>,
  userId?: string
) {
  logger.error(
    {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      ...context,
      userId,
    },
    `Error: ${error.message}`
  );
}