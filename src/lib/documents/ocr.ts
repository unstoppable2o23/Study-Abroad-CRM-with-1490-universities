import { prisma } from "@/lib/prisma";

interface OCRResult {
  text: string;
  confidence: number;
  pageCount?: number;
  engine: string;
}

/**
 * Extract text from document file.
 * Uses pdf-parse for PDFs, tesseract.js for images (when available).
 * Falls back to basic text extraction.
 */
export async function extractText(documentId: string): Promise<OCRResult> {
  const document = await prisma.document.findUnique({ where: { id: documentId } });
  if (!document) throw new Error("Document not found");

  let rawText = "";
  let confidence = 0;
  let pageCount: number | undefined;
  const engine = "pdf-parse";

  try {
    if (document.mimeType === "application/pdf") {
      const pdfParse = require("pdf-parse");
      const fs = require("fs");
      const buffer = fs.readFileSync(document.filePath);
      const data = await pdfParse(buffer);
      rawText = data.text;
      pageCount = data.numpages;
      confidence = 0.9;
    } else if (document.mimeType.startsWith("image/")) {
      // Attempt OCR via tesseract.js if available
      try {
        const Tesseract = require("tesseract.js");
        const { data } = await Tesseract.recognize(document.filePath, "eng");
        rawText = data.text;
        confidence = data.confidence / 100;
      } catch {
        rawText = "[OCR unavailable for image - text extraction not possible]";
        confidence = 0;
      }
    } else {
      // For text-based formats, try parsing
      const fs = require("fs");
      rawText = fs.readFileSync(document.filePath, "utf-8").slice(0, 50000);
      confidence = 1.0;
    }
  } catch (e) {
    rawText = document.extractedText || "[Extraction failed]";
    confidence = 0;
  }

  // Store extraction result
  await prisma.documentExtraction.create({
    data: {
      documentId,
      engine,
      rawText: rawText.slice(0, 100000),
      confidence,
      pageCount,
    },
  });

  // Update document with extracted text
  if (rawText && rawText !== "[Extraction failed]") {
    await prisma.document.update({
      where: { id: documentId },
      data: { extractedText: rawText.slice(0, 50000) },
    });
  }

  return { text: rawText, confidence, pageCount, engine };
}

export async function getDocumentText(documentId: string): Promise<string> {
  const doc = await prisma.document.findUnique({ where: { id: documentId }, select: { extractedText: true, filePath: true, mimeType: true } });
  if (doc?.extractedText) return doc.extractedText;
  if (doc?.filePath) {
    try {
      const result = await extractText(documentId);
      return result.text;
    } catch {
      return "";
    }
  }
  return "";
}
