import { describe, it, expect } from "vitest";
import { cn, formatDate, formatCurrency, slugify } from "@/lib/utils";

describe("utils", () => {
  describe("cn", () => {
    it("merges class names", () => {
      const result = cn("text-red-500", "text-blue-500");
      expect(result).toBe("text-blue-500");
    });

    it("handles conditional classes", () => {
      const result = cn("base", false && "hidden", "extra");
      expect(result).toContain("base");
      expect(result).not.toContain("hidden");
      expect(result).toContain("extra");
    });

    it("returns empty string for no input", () => {
      expect(cn()).toBe("");
    });
  });

  describe("formatDate", () => {
    it("formats a Date object", () => {
      const result = formatDate(new Date("2024-01-15"));
      expect(result).toBe("January 15, 2024");
    });

    it("formats a date string", () => {
      const result = formatDate("2024-06-30");
      expect(result).toBe("June 30, 2024");
    });
  });

  describe("formatCurrency", () => {
    it("formats USD by default", () => {
      const result = formatCurrency(1234.56);
      expect(result).toBe("$1,234.56");
    });

    it("formats with specified currency", () => {
      const result = formatCurrency(1000, "EUR");
      expect(result).toContain("1,000");
    });

    it("formats zero", () => {
      expect(formatCurrency(0)).toBe("$0.00");
    });
  });

  describe("slugify", () => {
    it("converts text to lowercase slug", () => {
      expect(slugify("Hello World")).toBe("hello-world");
    });

    it("removes special characters", () => {
      expect(slugify("Hello! @World#")).toBe("hello-world");
    });

    it("collapses multiple dashes", () => {
      expect(slugify("hello   world")).toBe("hello-world");
    });

    it("trims leading/trailing dashes", () => {
      expect(slugify(" hello world ")).toBe("hello-world");
    });

    it("handles already slugged text", () => {
      expect(slugify("already-a-slug")).toBe("already-a-slug");
    });
  });
});
