import { prisma } from "@/lib/prisma";
import fs from "fs";

interface OCRResult {
  text: string;
  confidence: number;
  pageCount?: number;
  engine: string;
}

export async function extractText(documentId: string): Promise<OCRResult> {
  const doc = await prisma.document.findUnique({ where: { id: documentId } });
  if (!doc) throw new Error("Document not found");

  let rawText = "";
  let confidence = 0;
  let pageCount: number | undefined;
  const engine = "pdf-parse";

  try {
    if (doc.mimeType === "application/pdf") {
      const buffer = fs.readFileSync(doc.filePath);
      try {
        const pdfParse = require("pdf-parse");
        const data = await pdfParse(buffer);
        rawText = data.text;
        pageCount = data.numpages;
        confidence = 0.9;
      } catch {
        rawText = "[PDF parsing unavailable]";
        confidence = 0;
      }
    } else if (doc.mimeType.startsWith("image/")) {
      try {
        const Tesseract = require("tesseract.js");
        const { data } = await Tesseract.recognize(doc.filePath, "eng");
        rawText = data.text;
        confidence = data.confidence / 100;
      } catch {
        rawText = "[OCR unavailable]";
        confidence = 0;
      }
    } else {
      rawText = fs.readFileSync(doc.filePath, "utf-8").slice(0, 50000);
      confidence = 1.0;
    }
  } catch {
    rawText = doc.extractedText || "[Extraction failed]";
    confidence = 0;
  }

  await prisma.documentExtraction.create({
    data: { documentId, engine, rawText: rawText.slice(0, 100000), confidence, pageCount },
  });

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
