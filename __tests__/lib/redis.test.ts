import { describe, it, expect } from "vitest";
import { generateCacheKey, CACHE_KEYS } from "@/lib/redis";

describe("redis", () => {
  describe("generateCacheKey", () => {
    it("joins parts with colon", () => {
      expect(generateCacheKey("user", "123")).toBe("user:123");
    });

    it("handles multiple parts", () => {
      expect(generateCacheKey("a", "b", "c")).toBe("a:b:c");
    });

    it("converts numbers to strings", () => {
      expect(generateCacheKey("item", 42)).toBe("item:42");
    });

    it("handles empty input", () => {
      expect(generateCacheKey()).toBe("");
    });
  });

  describe("CACHE_KEYS", () => {
    it("generates user key", () => {
      expect(CACHE_KEYS.user("123")).toBe("user:123");
    });

    it("generates student key", () => {
      expect(CACHE_KEYS.student("456")).toBe("student:456");
    });

    it("generates organization key", () => {
      expect(CACHE_KEYS.organization("org-1")).toBe("org:org-1");
    });

    it("generates university key", () => {
      expect(CACHE_KEYS.university("uni-1")).toBe("university:uni-1");
    });

    it("generates course key", () => {
      expect(CACHE_KEYS.course("course-1")).toBe("course:course-1");
    });

    it("generates career key", () => {
      expect(CACHE_KEYS.career("career-1")).toBe("career:career-1");
    });

    it("generates university search key with JSON params", () => {
      const key = CACHE_KEYS.universitySearch({ country: "US", ranking: "100" });
      expect(key).toContain("university:search:");
      expect(key).toContain("US");
    });

    it("generates course search key", () => {
      const key = CACHE_KEYS.courseSearch({ query: "computer science" });
      expect(key).toContain("course:search:");
    });

    it("generates ai response key with base64 query", () => {
      const key = CACHE_KEYS.aiResponse("hello world");
      expect(key).toContain("ai:");
      expect(key).toContain(Buffer.from("hello world").toString("base64"));
    });

    it("generates rate limit key", () => {
      const key = CACHE_KEYS.rateLimit("auth", "127.0.0.1", "/api/auth/login");
      expect(key).toBe("ratelimit:auth:127.0.0.1:/api/auth/login");
    });

    it("generates settings key", () => {
      expect(CACHE_KEYS.settings()).toBe("settings");
    });

    it("generates notifications key", () => {
      expect(CACHE_KEYS.notifications("user-1")).toBe("notifications:user-1");
    });
  });
});
