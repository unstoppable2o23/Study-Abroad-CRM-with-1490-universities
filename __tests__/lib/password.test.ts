import { describe, it, expect } from "vitest";
import { validatePassword } from "@/lib/password";

describe("password", () => {
  describe("validatePassword", () => {
    it("returns valid for a strong password", () => {
      const result = validatePassword("StrongP@ss1");
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("fails if password is too short", () => {
      const result = validatePassword("Sh@rt1");
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Password must be at least 8 characters");
    });

    it("fails if missing uppercase letter", () => {
      const result = validatePassword("weakpass@1");
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Password must contain at least one uppercase letter");
    });

    it("fails if missing lowercase letter", () => {
      const result = validatePassword("WEAKPASS@1");
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Password must contain at least one lowercase letter");
    });

    it("fails if missing number", () => {
      const result = validatePassword("WeakPass@a");
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Password must contain at least one number");
    });

    it("fails if missing special character", () => {
      const result = validatePassword("WeakPass1a");
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Password must contain at least one special character");
    });

    it("returns multiple errors for multiple violations", () => {
      const result = validatePassword("weak");
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(4);
    });

    it("handles empty string", () => {
      const result = validatePassword("");
      expect(result.valid).toBe(false);
    });

    it("accepts various special characters", () => {
      expect(validatePassword("Valid!@#$%^&*()Pass1").valid).toBe(true);
      expect(validatePassword("Valid+=-[]{}Pass1").valid).toBe(true);
      expect(validatePassword("Valid;':\"|,Pass1").valid).toBe(true);
      expect(validatePassword("Valid.<>/?`~Pass1").valid).toBe(true);
    });
  });
});
