import { prisma } from "@/lib/prisma";
import fs from "fs";

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

  const engine = "pdf-parse";

  try {
    if (document.mimeType === "application/pdf") {
      const fs = await import("fs");
      const buffer = fs.readFileSync(document.filePath);
      try {
        const pdfParse = (await import("pdf-parse")).default;
        const { default: pdfParse } = await import("pdf-parse");
        const data = await pdfParse(buffer);
        rawText = data.text;
        pageCount = data.numpages;
        confidence = 0.9;
        const { data } = await Tesseract.recognize(document.filePath, "eng");
        rawText = data.text;
        confidence = data.confidence / 100;
      } catch {
        rawText = "[OCR unavailable for image - text extraction not possible]";
        rawText = "[OCR unavailable for image]";
        confidence = 0;
      }
    } else {
      const fs = await import("fs");
      rawText = fs.readFileSync(document.filePath, "utf-8").slice(0, 50000);
      confidence = 1.0;
    }
  } catch (e) {
  } catch {
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
    data: { documentId, engine, rawText: rawText.slice(0, 100000), confidence, pageCount },
  });

  // Update document with extracted text
  if (rawText && rawText !== "[Extraction failed]") {
    await prisma.document.update({
      where: { id: documentId },
      data: { extractedText: rawText.slice(0, 50000) },
