import { describe, it, expect } from "vitest";
import { PLAN_LIMITS } from "@/lib/subscription";

describe("subscription", () => {
  describe("PLAN_LIMITS", () => {
    it("TRIAL has 50 students", () => {
      expect(PLAN_LIMITS.TRIAL.students).toBe(50);
    });

    it("TRIAL has 5 users", () => {
      expect(PLAN_LIMITS.TRIAL.users).toBe(5);
    });

    it("BASIC has 200 students", () => {
      expect(PLAN_LIMITS.BASIC.students).toBe(200);
    });

    it("PROFESSIONAL has 1000 students", () => {
      expect(PLAN_LIMITS.PROFESSIONAL.students).toBe(1000);
    });

    it("ENTERPRISE has unlimited students (-1)", () => {
      expect(PLAN_LIMITS.ENTERPRISE.students).toBe(-1);
    });

    it("ENTERPRISE has unlimited users (-1)", () => {
      expect(PLAN_LIMITS.ENTERPRISE.users).toBe(-1);
    });

    it("ENTERPRISE has unlimited storage (-1)", () => {
      expect(PLAN_LIMITS.ENTERPRISE.storage).toBe(-1);
    });

    it("STORAGE limits scale with plan tier", () => {
      expect(PLAN_LIMITS.TRIAL.storage).toBeLessThan(PLAN_LIMITS.BASIC.storage);
      expect(PLAN_LIMITS.BASIC.storage).toBeLessThan(PLAN_LIMITS.PROFESSIONAL.storage);
      expect(PLAN_LIMITS.PROFESSIONAL.storage).toBeGreaterThan(0);
    });

    it("student limits scale with plan tier", () => {
      expect(PLAN_LIMITS.TRIAL.students).toBeLessThan(PLAN_LIMITS.BASIC.students);
      expect(PLAN_LIMITS.BASIC.students).toBeLessThan(PLAN_LIMITS.PROFESSIONAL.students);
      expect(PLAN_LIMITS.PROFESSIONAL.students).toBeGreaterThan(0);
    });

    it("user limits scale with plan tier", () => {
      expect(PLAN_LIMITS.TRIAL.users).toBeLessThan(PLAN_LIMITS.BASIC.users);
      expect(PLAN_LIMITS.BASIC.users).toBeLessThan(PLAN_LIMITS.PROFESSIONAL.users);
      expect(PLAN_LIMITS.PROFESSIONAL.users).toBeGreaterThan(0);
    });
  });
});
