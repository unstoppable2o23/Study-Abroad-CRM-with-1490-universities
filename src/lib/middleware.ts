import { NextRequest, NextResponse } from "next/server";
import { getRedisClient, generateCacheKey } from "@/lib/redis";

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyPrefix: string;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60 * 1000,
  maxRequests: 100,
  keyPrefix: "ratelimit",
};

const ENDPOINT_CONFIGS: Record<string, RateLimitConfig> = {
  "/api/auth/login": { windowMs: 15 * 60 * 1000, maxRequests: 10, keyPrefix: "ratelimit:auth" },
  "/api/auth/register": { windowMs: 60 * 60 * 1000, maxRequests: 5, keyPrefix: "ratelimit:auth" },
  "/api/auth/refresh": { windowMs: 60 * 1000, maxRequests: 30, keyPrefix: "ratelimit:auth" },
  "/api/ai/chat": { windowMs: 60 * 1000, maxRequests: 20, keyPrefix: "ratelimit:ai" },
  "/api/documents": { windowMs: 60 * 1000, maxRequests: 30, keyPrefix: "ratelimit:upload" },
};

export async function rateLimitMiddleware(
  request: NextRequest,
  config: RateLimitConfig = DEFAULT_CONFIG
): Promise<NextResponse | null> {
  const redis = await import("@/lib/redis").then((m) => m.getRedisClient());
  if (!redis) return null;

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const path = request.nextUrl.pathname;
  const endpointConfig = ENDPOINT_CONFIGS[path] || config;
  const key = generateCacheKey(endpointConfig.keyPrefix, ip, path);

  const windowSec = Math.ceil(endpointConfig.windowMs / 1000);

  const current = await redis.incr(key);
  if (current === 1) {
    await redis.expire(key, windowSec);
  }

  const ttl = await redis.ttl(key);

  const headers = {
    "X-RateLimit-Limit": endpointConfig.maxRequests.toString(),
    "X-RateLimit-Remaining": Math.max(0, endpointConfig.maxRequests - current).toString(),
    "X-RateLimit-Reset": Math.ceil(Date.now() / 1000 + ttl).toString(),
  };

  if (current > endpointConfig.maxRequests) {
    return new NextResponse(
      JSON.stringify({ success: false, error: "Too many requests" }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          ...headers,
          "Retry-After": ttl.toString(),
        },
      }
    );
  }

  const response = NextResponse.next();
  Object.entries(headers).forEach(([k, v]) => response.headers.set(k, v));
  return null;
}

export function securityHeadersMiddleware(request: NextRequest): NextResponse {
  const response = NextResponse.next();

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https:",
    "connect-src 'self' https://api.openai.com https://api.anthropic.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  response.headers.set("Content-Security-Policy", csp);

  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }

  return response;
}

export function corsMiddleware(request: NextRequest): NextResponse {
  const response = NextResponse.next();

  const origin = request.headers.get("origin");
  const allowedOrigins = process.env.CORS_ORIGINS?.split(",") || ["http://localhost:3000"];

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  }

  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: response.headers });
  }

  return response;
}

export async function combinedMiddleware(request: NextRequest): Promise<NextResponse> {
  const corsResponse = corsMiddleware(request);
  if (corsResponse.status === 204) return corsResponse;

  const rateLimitResponse = await rateLimitMiddleware(request);
  if (rateLimitResponse) return rateLimitResponse;

  return securityHeadersMiddleware(request);
}