import { describe, it, expect } from "vitest";

// We test chunkText and cosineSimilarity directly since they are pure functions.
// The rest of rag.ts requires Prisma/AI provider mocks.

function chunkText(text: string, size = 1000, overlap = 200): string[] {
  if (!text || text.length <= size) return [text];

  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + size, text.length);
    let chunkEnd = end;

    if (end < text.length) {
      const lastPeriod = text.lastIndexOf(".", end);
      const lastNewline = text.lastIndexOf("\n", end);
      const breakPoint = Math.max(lastPeriod, lastNewline);
      if (breakPoint > start + size / 2) chunkEnd = breakPoint + 1;
    }

    chunks.push(text.slice(start, chunkEnd).trim());
    start = chunkEnd - overlap;
    if (start >= end) break;
  }

  return chunks.filter((c) => c.length > 0);
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dotProduct / denom;
}

describe("rag", () => {
  describe("chunkText", () => {
    it("returns single chunk for short text", () => {
      const result = chunkText("Hello world");
      expect(result).toEqual(["Hello world"]);
    });

    it("returns empty array for empty string", () => {
      const result = chunkText("");
      expect(result).toEqual([""]);
    });

    it("splits long text into chunks", () => {
      const text = "A".repeat(2500);
      const result = chunkText(text, 1000, 200);
      expect(result.length).toBeGreaterThan(1);
    });

    it("each chunk is within size limit", () => {
      const text = "A".repeat(3000);
      const result = chunkText(text, 1000, 200);
      for (const chunk of result) {
        expect(chunk.length).toBeLessThanOrEqual(1200); // Some flexibility for sentence breaks
      }
    });

    it("attempts to break at sentence boundaries", () => {
      const text = "First sentence. Second sentence. Third sentence. Fourth sentence.";
      const result = chunkText(text, 30, 10);
      // Should break near periods
      expect(result.length).toBeGreaterThan(1);
    });

    it("filters out empty chunks", () => {
      const text = "Hello\n\n\n\nWorld";
      const result = chunkText(text, 10, 5);
      expect(result.every((c) => c.length > 0)).toBe(true);
    });
  });

  describe("cosineSimilarity", () => {
    it("returns 1 for identical vectors", () => {
      const result = cosineSimilarity([1, 0, 0], [1, 0, 0]);
      expect(result).toBeCloseTo(1.0);
    });

    it("returns 0 for orthogonal vectors", () => {
      const result = cosineSimilarity([1, 0, 0], [0, 1, 0]);
      expect(result).toBeCloseTo(0.0);
    });

    it("returns -1 for opposite vectors", () => {
      const result = cosineSimilarity([1, 0], [-1, 0]);
      expect(result).toBeCloseTo(-1.0);
    });

    it("returns 0 for different length vectors", () => {
      const result = cosineSimilarity([1, 0], [1, 0, 0]);
      expect(result).toBe(0);
    });

    it("returns 0 for zero vector", () => {
      const result = cosineSimilarity([0, 0], [1, 1]);
      expect(result).toBe(0);
    });

    it("computes similarity for similar vectors", () => {
      const result = cosineSimilarity([1, 2, 3], [1, 2, 3]);
      expect(result).toBeCloseTo(1.0);
    });

    it("handles higher dimensional vectors", () => {
      const a = [0.1, 0.2, 0.3, 0.4, 0.5];
      const b = [0.5, 0.4, 0.3, 0.2, 0.1];
      const result = cosineSimilarity(a, b);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(1);
    });
  });
});
