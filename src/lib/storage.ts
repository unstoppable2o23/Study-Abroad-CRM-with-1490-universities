import fs from "fs/promises";
import path from "path";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export interface UploadInput {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  studentId?: string;
  documentId?: string;
}

export interface UploadResult {
  fileId: string;
  fileName: string;
  storagePath: string;
  originalName: string;
  mimeType: string;
  size: number;
  publicUrl: string;
  thumbnailUrl: string | null;
}

export interface StorageDriver {
  upload(input: UploadInput): Promise<UploadResult>;
  getPublicUrl(storagePath: string): string;
  delete?(storagePath: string): Promise<void>;
}

export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg", "image/png", "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain", "text/csv",
];

export const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png", ".gif", ".webp", ".doc", ".docx", ".txt", ".csv"];

export function getStoragePath(studentId?: string, documentId?: string): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const parts = [`${year}/${month}`];
  if (studentId) parts.push(`student_${studentId}`);
  if (documentId) parts.push(`doc_${documentId}`);
  return parts.join("/");
}

export function validateFile(file: { mimeType: string; size: number }): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.includes(file.mimeType)) {
    return { valid: false, error: `File type '${file.mimeType}' is not allowed` };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File size exceeds maximum of ${MAX_FILE_SIZE / (1024 * 1024)}MB` };
  }
  if (file.size === 0) return { valid: false, error: "File is empty" };
  return { valid: true };
}

export function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/_{2,}/g, "_").toLowerCase();
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

class LocalDriver implements StorageDriver {
  private basePath: string;
  private publicUrlBase: string;

  constructor() {
    this.basePath = process.env.STORAGE_LOCAL_PATH || path.join(process.cwd(), "uploads");
    this.publicUrlBase = process.env.PUBLIC_URL || "http://localhost:3000";
  }

  async upload(input: UploadInput): Promise<UploadResult> {
    const ext = path.extname(input.originalName);
    const safeName = sanitizeFileName(path.basename(input.originalName, ext));
    const date = new Date().toISOString().slice(0, 10);
    const subDir = `documents/${date}`;
    const dir = path.join(this.basePath, subDir);
    const fileId = generateId();
    const fileName = `${fileId}-${safeName}${ext}`;
    const storagePath = `${subDir}/${fileName}`;

    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, fileName), input.buffer);

    return {
      fileId, fileName, storagePath, originalName: input.originalName,
      mimeType: input.mimeType, size: input.buffer.length,
      publicUrl: `${this.publicUrlBase}/api/files/${storagePath}`,
      thumbnailUrl: input.mimeType.startsWith("image/") ? `${this.publicUrlBase}/api/files/${storagePath}?thumbnail=1` : null,
    };
  }

  getPublicUrl(storagePath: string): string {
    return `${this.publicUrlBase}/api/files/${storagePath}`;
  }
}

class S3Driver implements StorageDriver {
  private client: S3Client;
  private bucket: string;
  private publicUrlBase: string;

  constructor() {
    this.client = new S3Client({
      region: process.env.S3_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || "",
        secretAccessKey: process.env.S3_SECRET_KEY || "",
      },
    });
    this.bucket = process.env.S3_BUCKET || "";
    this.publicUrlBase = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  }

  async upload(input: UploadInput): Promise<UploadResult> {
    const ext = path.extname(input.originalName);
    const safeName = sanitizeFileName(path.basename(input.originalName, ext));
    const date = new Date().toISOString().slice(0, 10);
    const subDir = `documents/${date}`;
    const fileId = generateId();
    const fileName = `${fileId}-${safeName}${ext}`;
    const storagePath = `${subDir}/${fileName}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: storagePath,
        Body: input.buffer,
        ContentType: input.mimeType,
      })
    );

    return {
      fileId, fileName, storagePath, originalName: input.originalName,
      mimeType: input.mimeType, size: input.buffer.length,
      publicUrl: `${this.publicUrlBase}/api/files/${storagePath}`,
      thumbnailUrl: input.mimeType.startsWith("image/")
        ? `${this.publicUrlBase}/api/files/${storagePath}?thumbnail=1`
        : null,
    };
  }

  getPublicUrl(storagePath: string): string {
    return `${this.publicUrlBase}/api/files/${storagePath}`;
  }

  async delete(storagePath: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: storagePath })
    );
  }

  async getSignedDownloadUrl(storagePath: string, expiresIn = 3600): Promise<string> {
    return getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.bucket, Key: storagePath }),
      { expiresIn }
    );
  }
}

let storageDriverInstance: StorageDriver;

export function getStorageDriver(): StorageDriver {
  if (!storageDriverInstance) {
    if (process.env.STORAGE_PROVIDER === "s3") {
      storageDriverInstance = new S3Driver();
    } else {
      storageDriverInstance = new LocalDriver();
    }
  }
  return storageDriverInstance;
}

export function setStorageDriver(driver: StorageDriver): void {
  storageDriverInstance = driver;
}

export function validateFileForUpload(file: { name: string; size: number; type: string }): { valid: boolean; error?: string } {
  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return { valid: false, error: `File extension '${ext}' is not allowed. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}` };
  }
  return validateFile({ mimeType: file.type, size: file.size });
}

export function generateStoragePath(type: string, studentId: string, fileName: string): string {
  const date = new Date().toISOString().slice(0, 10);
  const safeName = sanitizeFileName(fileName);
  return `uploads/${type}/${studentId}/${date}/${Date.now()}-${safeName}`;
}
