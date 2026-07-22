import { describe, it, expect } from "vitest";
import {
  validateFile,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
  getStoragePath,
} from "@/lib/storage";

describe("storage", () => {
  describe("validateFile", () => {
    it("accepts valid PDF", () => {
      const result = validateFile({ mimeType: "application/pdf", size: 1024 });
      expect(result.valid).toBe(true);
    });

    it("accepts valid DOCX", () => {
      const result = validateFile({
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        size: 1024,
      });
      expect(result.valid).toBe(true);
    });

    it("accepts valid JPEG", () => {
      const result = validateFile({ mimeType: "image/jpeg", size: 1024 });
      expect(result.valid).toBe(true);
    });

    it("accepts valid PNG", () => {
      const result = validateFile({ mimeType: "image/png", size: 1024 });
      expect(result.valid).toBe(true);
    });

    it("accepts valid HEIC", () => {
      const result = validateFile({ mimeType: "image/heic", size: 1024 });
      expect(result.valid).toBe(true);
    });

    it("rejects executable files", () => {
      const result = validateFile({ mimeType: "application/x-executable", size: 1024 });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("not allowed");
    });

    it("rejects HTML files", () => {
      const result = validateFile({ mimeType: "text/html", size: 1024 });
      expect(result.valid).toBe(false);
    });

    it("rejects files exceeding size limit", () => {
      const result = validateFile({
        mimeType: "application/pdf",
        size: MAX_FILE_SIZE + 1,
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("exceeds");
    });

    it("accepts files at exact size limit", () => {
      const result = validateFile({
        mimeType: "application/pdf",
        size: MAX_FILE_SIZE,
      });
      expect(result.valid).toBe(true);
    });
  });

  describe("ALLOWED_MIME_TYPES", () => {
    it("includes PDF", () => {
      expect(ALLOWED_MIME_TYPES).toContain("application/pdf");
    });

    it("includes images", () => {
      expect(ALLOWED_MIME_TYPES).toContain("image/jpeg");
      expect(ALLOWED_MIME_TYPES).toContain("image/png");
      expect(ALLOWED_MIME_TYPES).toContain("image/heic");
      expect(ALLOWED_MIME_TYPES).toContain("image/heif");
    });

    it("includes DOCX", () => {
      expect(ALLOWED_MIME_TYPES).toContain(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );
    });
  });

  describe("getStoragePath", () => {
    it("generates path with student and document", () => {
      const path = getStoragePath("student-1", "doc-1");
      expect(path).toContain("student_student-1");
      expect(path).toContain("doc_doc-1");
    });

    it("generates path with student only", () => {
      const path = getStoragePath("student-1");
      expect(path).toContain("student_student-1");
      expect(path).not.toContain("doc_");
    });

    it("generates path without student or document", () => {
      const path = getStoragePath();
      expect(path).toMatch(/\d{4}\/\d{2}/);
    });
  });
});
