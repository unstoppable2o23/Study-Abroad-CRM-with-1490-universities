import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import { validatePassword } from "@/lib/password";
import { createAuditLog, getClientInfo } from "@/lib/audit";

const REQUIRED_FIELDS = ["fullName", "email", "password"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface RowResult {
  row: number;
  fullName: string;
  email: string;
  status: "valid" | "error";
  errors: string[];
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === "," && !inQuotes) { values.push(current.trim()); current = ""; continue; }
      current += ch;
    }
    values.push(current.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] || ""; });
    return row;
  });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  try { requirePermission(user.role, "students:create"); } catch {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const confirm = formData.get("confirm") === "true";

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const text = await file.text();
    const rows = parseCSV(text);

    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: "CSV file is empty or has no data rows" }, { status: 400 });
    }

    if (rows.length > 500) {
      return NextResponse.json({ success: false, error: "Maximum 500 students per bulk upload" }, { status: 400 });
    }

    const existingEmails = await prisma.user.findMany({
      where: { email: { in: rows.map((r) => r.email?.toLowerCase()) } },
      select: { email: true },
    });
    const existingEmailSet = new Set(existingEmails.map((e) => e.email.toLowerCase()));

    const existingUsernames = await prisma.user.findMany({
      where: { username: { in: rows.map((r) => r.username).filter(Boolean) } },
      select: { username: true },
    });
    const existingUsernameSet = new Set(existingUsernames.map((u) => u.username));

    const existingMobiles = await prisma.student.findMany({
      where: { organizationId: user.organizationId, mobile: { in: rows.map((r) => r.mobile).filter(Boolean) } },
      select: { mobile: true },
    });
    const existingMobileSet = new Set(existingMobiles.map((m) => m.mobile));

    const results: RowResult[] = [];
    let hasErrors = false;

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const rowNum = i + 2;
      const errors: string[] = [];

      for (const field of REQUIRED_FIELDS) {
        if (!r[field]?.trim()) errors.push(`${field} is required`);
      }

      if (r.email && !EMAIL_RE.test(r.email)) errors.push("Invalid email format");
      if (r.email && existingEmailSet.has(r.email.toLowerCase())) errors.push("Email already in use");

      if (r.username) {
        if (r.username.length < 3) errors.push("Username must be at least 3 characters");
        if (existingUsernameSet.has(r.username)) errors.push("Username already taken");
      }

      if (r.mobile) {
        if (existingMobileSet.has(r.mobile)) errors.push("Mobile already in use in this organization");
      }

      if (r.password) {
        const pwCheck = validatePassword(r.password);
        if (!pwCheck.valid) errors.push(...pwCheck.errors.map((e: string) => `Password: ${e}`));
      }

      if (r.fullName && r.fullName.length > 100) errors.push("Full name too long (max 100)");
      if (r.country && r.country.length > 100) errors.push("Country too long (max 100)");

      if (errors.length > 0) hasErrors = true;

      results.push({
        row: rowNum,
        fullName: r.fullName || "",
        email: r.email || "",
        status: errors.length === 0 ? "valid" : "error",
        errors,
      });
    }

    if (!confirm || hasErrors) {
      return NextResponse.json({
        success: true,
        validated: true,
        hasErrors,
        total: rows.length,
        valid: results.filter((r) => r.status === "valid").length,
        invalid: results.filter((r) => r.status === "error").length,
        results,
      });
    }

    const created: { fullName: string; email: string }[] = [];
    const { ip, userAgent } = getClientInfo(request);

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (results[i].status !== "valid") continue;

      const passwordHash = await hashPassword(r.password);

      const newUser = await prisma.user.create({
        data: {
          email: r.email.toLowerCase(),
          username: r.username || null,
          passwordHash,
          fullName: r.fullName,
          role: "STUDENT",
          status: "ACTIVE",
          organizationId: user.organizationId,
        },
        select: { id: true, email: true, fullName: true },
      });

      const student = await prisma.student.create({
        data: {
          userId: newUser.id,
          fullName: r.fullName,
          email: r.email.toLowerCase(),
          mobile: r.mobile || null,
          country: r.country || null,
          preferredCourse: r.preferredCourse || null,
          preferredCountry: r.preferredCountry || null,
          organizationId: user.organizationId,
          status: "REGISTERED",
        },
      });

      await prisma.notification.create({
        data: {
          userId: student.userId,
          studentId: student.id,
          type: "GENERAL",
          title: "Account Created",
          message: `Welcome ${r.fullName}! Your account has been created. Please complete your profile.`,
        },
      });

      await createAuditLog({
        organizationId: user.organizationId,
        userId: user.userId,
        studentId: student.id,
        action: "STUDENT_CREATED",
        entity: "Student",
        entityId: student.id,
        newValue: { fullName: r.fullName, email: r.email.toLowerCase(), source: "bulk-upload" },
        ipAddress: ip,
        userAgent,
      });

      created.push({ fullName: newUser.fullName, email: newUser.email });
    }

    return NextResponse.json({
      success: true,
      confirmed: true,
      totalProcessed: rows.length,
      createdCount: created.length,
      skippedCount: rows.length - created.length,
      created,
    });
  } catch (err) {
    console.error("Bulk upload error:", err);
    return NextResponse.json({ success: false, error: "Failed to process bulk upload" }, { status: 500 });
  }
}
